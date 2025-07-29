const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');
const wiki = require('../modules/data/wiki.json');

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

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('📘 NEXI DATA ACCESS TERMINAL')
          .setDescription('Classification accepted.\n\nSelect a data stream category to proceed.')
          .setImage('https://i.imgur.com/8IiY4LT.png')
          .setFooter({ text: 'Access Node: NEXI-COMM/43F | Trace clean' })
      ],
      components: [buildCategoryRow()],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id && i.message.interaction.id === interaction.id,
      time: 3 * 60 * 1000
    });

    collector.on('collect', async i => {
      const userId = i.user.id;
      if (userId !== interaction.user.id) return;

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

        await i.update({
          content: null,
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(backButton)]
        });
      }

      // Back to category selection
      else if (i.customId === 'go_back') {
        await showCategoryMenu(i);
      }
    });

    collector.on('end', async () => {
      try {
        const msg = await interaction.fetchReply();
        if (msg.editable) await msg.edit({ components: [] });
      } catch (err) {
        if (err.code !== 10008) {
          console.error("❌ Cleanup error:", err);
        }
      }
    });
  }
};
