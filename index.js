require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const { startNewsCycle } = require('./modules/news');
const rotateStatus = require('./modules/status');
const { startAdLoop } = require('./modules/ads');
const { showCalisaMenu, handleCalisaOption } = require('./modules/calisa');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});

// Load all slash commands from commands folder
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);

    // Dynamically register all slash commands
    const commandData = [];
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commandData.push(command.data.toJSON());
    }

    // 🔁 FAST REGISTRATION FOR YOUR TEST SERVER
    const guildId = '806555974168215553';
    const guild = await client.guilds.fetch(guildId);
    await guild.commands.set(commandData);
    console.log(`✅ Commands registered to guild ${guild.name}`);

    // Start background systems
    startNewsCycle(client);
    rotateStatus(client);
    startAdLoop(client);
});

// 🚨 Unified interaction handler
client.on('interactionCreate', async interaction => {
    // BUTTON INTERACTIONS
    if (interaction.isButton()) {
        const [scope, category] = interaction.customId.split('_');

        // 📊 DATA MODULE HANDLERS
        if (scope === 'data') {
            try {
                const handler = require(`./modules/data/${category}.js`);
                await handler(interaction);
            } catch (err) {
                console.error(`❌ No handler for /data ${category}`, err);
                await interaction.reply({ content: '⚠️ This data module is unavailable.', ephemeral: true });
            }
            return;
        }

        // 🎫 CALISA VII TICKET HANDLER
        if (interaction.customId === 'calisa_buy_ticket') {
            const member = interaction.member;
            const guild = interaction.guild;
            const calisaRole = guild.roles.cache.find(r => r.name === 'CALISA VII');

            if (!calisaRole) {
                await interaction.reply({ content: '❌ Calisa role not found.', ephemeral: true });
                return;
            }

            if (member.roles.cache.has(calisaRole.id)) {
                await interaction.reply({ content: '🌺 You already have a ticket to Calisa VII.', ephemeral: true });
                return;
            }

            await member.roles.add(calisaRole);

            await interaction.channel.send({ content: `🌺 <@${member.id}> has departed for **Calisa VII**...` });

            await showCalisaMenu(interaction);
            return;
        }


        // 🧭 CALISA OPTION + SUBPATH HANDLER
        if (scope === 'calisa' && (category.startsWith('option') || category.startsWith('mtn'))) {
            await handleCalisaOption(interaction);
            return;
        }
    }

    // DESTINATION SELECT MENU
    if (
        interaction.isStringSelectMenu() &&
        (interaction.customId === 'calisa_select_destination' ||
         interaction.customId === 'calisa_select_mountain')
    ) {
        await handleCalisaOption(interaction);
        return;
    }

    // SLASH COMMAND INTERACTIONS
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ Error executing command: ${interaction.commandName}`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '⚠️ Command failed.', ephemeral: true });
            } else {
                await interaction.reply({ content: '⚠️ Command failed.', ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
