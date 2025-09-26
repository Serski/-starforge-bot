require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const { startNewsCycle } = require('./modules/news');
const rotateStatus = require('./modules/status');
const { startAdLoop } = require('./modules/ads');
const { showCalisaMenu, handleCalisaOption } = require('./modules/calisa');
const { showKaldurMenu, handleKaldurOption } = require('./modules/kaldur');
const { showRazathaarMenu, handleRazathaarOption } = require('./modules/razathaarQuest');
const { startNeurolateExam, handleNeurolateInteraction } = require('./modules/neurolateExam');
const { handleReviewModal } = require('./modules/review');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('guildMemberAdd', async (member) => {
    const accountAge = Date.now() - member.user.createdTimestamp;
    if (accountAge < 10 * 24 * 60 * 60 * 1000) {
        const explanationMessage = `Hey there! Thanks for joining **${member.guild.name}**. ` +
            'For security reasons we only allow accounts that are at least 10 days old to participate. ' +
            'Please feel free to rejoin once your account is a little older.';

        try {
            await member.send(explanationMessage);
        } catch (error) {
            console.warn(`⚠️ Could not DM ${member.user.tag} about account age restriction.`, error);
        }

        try {
            await member.kick('Account age below 10 days');
            console.log(`👢 Kicked ${member.user.tag} for joining with an account younger than 10 days.`);
        } catch (error) {
            console.error(`❌ Failed to kick ${member.user.tag} for account age restriction.`, error);
        }
    }
});

// Load all slash commands from commands folder
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && file !== 'inventory.js');

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
    const guildId = process.env.GUILD_ID;
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

        // 🎫 KALDUR PRIME TICKET HANDLER
        if (interaction.customId === 'kaldur_buy_ticket') {
            const member = interaction.member;
            const guild = interaction.guild;
            const kaldurRole = guild.roles.cache.find(r => r.name === 'KALDUR PRIME');

            if (!kaldurRole) {
                await interaction.reply({ content: '❌ Kaldur role not found.', ephemeral: true });
                return;
            }

            if (member.roles.cache.has(kaldurRole.id)) {
                await interaction.reply({ content: '🗡️ You already have a ticket to Kaldur Prime.', ephemeral: true });
                return;
            }

            await member.roles.add(kaldurRole);

            await interaction.channel.send({ content: `🗡️ <@${member.id}> has departed for **Kaldur Prime**...` });

            await showKaldurMenu(interaction);
            return;
        }

        if (interaction.customId === 'neurolate_start_exam') {
            try {
                await interaction.deferReply({ ephemeral: true });
                await startNeurolateExam(interaction);
            } catch (error) {
                console.error('❌ Failed to start Neurolate exam', error);
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({
                        content: '⚠️ Could not launch the Neurolate exam.',
                        ephemeral: true
                    }).catch(console.error);
                } else {
                    await interaction.reply({
                        content: '⚠️ Could not launch the Neurolate exam.',
                        ephemeral: true
                    }).catch(console.error);
                }
            }
            return;
        }

        // 🚚 RAZATHAAR FREIGHT CONTRACT HANDLER
        if (interaction.customId === 'razathaar_start_quest') {
            const member = interaction.member;
            const guild = interaction.guild;
            const razathaarRole = guild.roles.cache.find(r => r.name === 'RAZATHAAR');

            if (!razathaarRole) {
                await interaction.reply({ content: '❌ Razathaar role not found.', ephemeral: true });
                return;
            }

            if (member.roles.cache.has(razathaarRole.id)) {
                await interaction.reply({ content: '🚫 You cannot restart the Razathaar quest.', ephemeral: true });
                return;
            }

            try {
                await interaction.deferReply({ ephemeral: true });
                await member.roles.add(razathaarRole);

                await interaction.channel.send({
                    content: `🚚 <@${member.id}> has accepted a Razathaar freight contract...`
                });
                await showRazathaarMenu(interaction);
            } catch (error) {
                console.error('❌ Failed to start Razathaar quest', error);
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({
                        content: '⚠️ Could not start the Razathaar quest.',
                        ephemeral: true
                    }).catch(console.error);
                } else {
                    await interaction.reply({
                        content: '⚠️ Could not start the Razathaar quest.',
                        ephemeral: true
                    }).catch(console.error);
                }
            }
            return;
        }


        // 🧭 CALISA OPTION + SUBPATH HANDLER
        if (scope === 'calisa' && (category.startsWith('option') || category.startsWith('mtn'))) {
            await handleCalisaOption(interaction);
            return;
        }

        // 🗡️ KALDUR OPTION HANDLER
        if (
            scope === 'kaldur' &&
            (
                category.startsWith('option') ||
                category.startsWith('hunt') ||
                category.startsWith('basilica') ||
                category.startsWith('fields') ||
                category.startsWith('heart')
            )
        ) {
            await handleKaldurOption(interaction);
            return;
        }

        // 📦 RAZATHAAR OPTION HANDLER
        if (scope === 'razathaar' || scope === 'rz') {
            await handleRazathaarOption(interaction);
            return;
        }

    }

    // 🧪 NEUROLATE EXAM SELECT HANDLER
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('neurolate_')) {
        await handleNeurolateInteraction(interaction);
        return;
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

    if (interaction.isStringSelectMenu() &&
        interaction.customId.startsWith('kaldur_select_')) {
        await handleKaldurOption(interaction);
        return;
    }

    if (interaction.isStringSelectMenu() &&
        (interaction.customId.startsWith('razathaar_') || interaction.customId.startsWith('rz_'))) {
        await handleRazathaarOption(interaction);
        return;
    }

    // REVIEW MODAL SUBMISSION
    if (interaction.isModalSubmit() && interaction.customId === 'review_modal') {
        await handleReviewModal(interaction);
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
