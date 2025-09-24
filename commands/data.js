const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');
const wiki = require('../modules/data/wiki.json');

const factionConfigs = {
  trade: {
    title: 'The Trade Federation',
    roleName: 'Trade Federation',
    emojiName: 'TradeFederation'
  },
  yamato: {
    title: 'Yamato Syndicate',
    roleName: 'Yamato Syndicate',
    emojiName: 'Yamato'
  },
  nova: {
    title: 'Nova Confederation',
    roleName: 'Nova Confederation',
    emojiName: 'Nova'
  },
  crimson: {
    title: 'Crimson Collective',
    roleName: 'Crimson Collective',
    emojiName: 'Crimson'
  },
  eagle: {
    title: 'Eagle Republic',
    roleName: 'Eagle Republic',
    emojiName: 'Eagle'
  }
};

const joinableEmpires = Object.fromEntries(
  Object.entries(factionConfigs).map(([key, { title }]) => [title, key])
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('data')
    .setDescription('Access the NEXI data library'),

  async execute(interaction) {
    const categories = Object.keys(wiki);

    const buildCategoryRow = () =>
      new ActionRowBuilder().addComponents(
        ...categories.map(cat =>
          new ButtonBuilder()
            .setCustomId(`cat_${cat}`)
            .setLabel(cat.toUpperCase())
            .setStyle(ButtonStyle.Primary)
        )
      );

    const showCategoryMenu = async i => {
      await i.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('NEXI DATA ACCESS TERMINAL')
            .setDescription('Classification accepted.\n\nSelect a data stream category to proceed.')
            .setImage('https://i.imgur.com/8IiY4LT.png')
            .setFooter({ text: 'Access Node: NEXI-COMM/43F | Trace clean' })
        ],
        components: [buildCategoryRow()],
        content: null
      });
    };

    const msg = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('📘 NEXI DATA ACCESS TERMINAL')
          .setDescription('Classification accepted.\n\nSelect a data stream category to proceed.')
          .setImage('https://i.imgur.com/8IiY4LT.png')
          .setFooter({ text: 'Access Node: NEXI-COMM/43F | Trace clean' })
      ],
      components: [buildCategoryRow()],
      ephemeral: true,
      fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 3 * 60 * 1000
    });

    collector.on('collect', async i => {
      const [action, cat] = i.customId.split('_');

      // Category selected
      if (action === 'cat') {
        const options = wiki[cat].map((entry, idx) => ({
          label: entry.title,
          value: String(idx),
          description: entry.content.slice(0, 50)
        }));

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`select_${cat}`)
          .setPlaceholder(`Choose ${cat}`)
          .addOptions(options);

        const backButton = new ButtonBuilder()
          .setCustomId('go_back')
          .setLabel('← Back')
          .setStyle(ButtonStyle.Secondary);

        await i.update({
          content: `**📖 ${cat.toUpperCase()} Articles** — pick one:`,
          components: [
            new ActionRowBuilder().addComponents(selectMenu),
            new ActionRowBuilder().addComponents(backButton)
          ],
          embeds: []
        });
      }

      // Article selected
      else if (action === 'select') {
        const entry = wiki[cat][Number(i.values[0])];

        const embed = new EmbedBuilder()
          .setTitle(entry.title)
          .setDescription(entry.content)
          .setImage(entry.image ?? 'https://i.imgur.com/YourDefaultImage.png')
          .setColor(0x2c3e50)
          .setFooter({ text: `Category: ${cat}` });

        const backButton = new ButtonBuilder()
          .setCustomId('go_back')
          .setLabel('← Back')
          .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder();

        if (cat === 'empires') {
          const joinKey = joinableEmpires[entry.title];
          const factionConfig = factionConfigs[joinKey];

          if (joinKey && factionConfig) {
            const joinButton = new ButtonBuilder()
              .setCustomId(`join_${joinKey}`)
              .setLabel('Join')
              .setStyle(ButtonStyle.Primary);

            const { emojiName } = factionConfig;

            if (emojiName && i.guild) {
              const emoji = i.guild.emojis.cache.find(e => e.name === emojiName);

              if (emoji) {
                joinButton.setEmoji({ id: emoji.id, name: emoji.name });
              }
            }

            actionRow.addComponents(joinButton);
          }
        }

        actionRow.addComponents(backButton);

        await i.update({
          content: null,
          embeds: [embed],
          components: [actionRow]
        });
      }

      // Back to category selection
      else if (i.customId === 'go_back') {
        await showCategoryMenu(i);
      }
      
      // Join faction
      else if (action === 'join') {
        const factionKey = cat;
        const factionConfig = factionConfigs[factionKey];
        const roleName = factionConfig?.roleName;

        if (!roleName) {
          await i.reply({
            content: 'This faction is not currently joinable.',
            ephemeral: true
          });
          return;
        }

        const guild = i.guild;

        if (!guild) {
          await i.reply({
            content: 'Unable to access the guild context.',
            ephemeral: true
          });
          return;
        }

        let member;

        try {
          member = await guild.members.fetch(i.user.id);
        } catch (err) {
          console.error('Failed to fetch guild member for join request:', err);
          await i.reply({
            content: 'Unable to verify your membership status at this time.',
            ephemeral: true
          });
          return;
        }

        const role = guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
          await i.reply({
            content: `The ${roleName} role could not be found. Please contact a server administrator.`,
            ephemeral: true
          });
          return;
        }

        const factionRoleNames = Object.values(factionConfigs).map(cfg => cfg.roleName);
        const currentFactionRole = member.roles.cache.find(
          r => factionRoleNames.includes(r.name) && r.id !== role.id
        );

        if (currentFactionRole) {
          await i.reply({
            content: `You must leave the ${currentFactionRole.name} before joining another faction.`,
            ephemeral: true
          });
          return;
        }

        if (member.roles.cache.has(role.id)) {
          await i.reply({
            content: `You are already enlisted with the ${roleName}.`,
            ephemeral: true
          });
          return;
        }

        try {
          await member.roles.add(role);
        } catch (err) {
          console.error('Failed to assign faction role:', err);
          await i.reply({
            content: 'Something went wrong while assigning your faction role. Please try again later.',
            ephemeral: true
          });
          return;
        }

        await i.reply({
          content: `Welcome to the ${roleName}!`,
          ephemeral: true
        });
      }
    });

    collector.on('end', async () => {
      try {
        if (msg.editable) await msg.edit({ components: [] });
      } catch (err) {
        if (err.code !== 10008) {
          console.error("❌ Cleanup error:", err);
        }
      }
    });
  }
};
