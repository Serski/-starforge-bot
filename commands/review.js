const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Submit a structured player review'),

  async execute(interaction) {
    if (interaction.channel?.name !== process.env.NEWS_CHANNEL_NAME) {
      await interaction.reply({
        content: '❌ This command can only be used in the #news-feed channel.',
        ephemeral: true,
      });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('review_modal')
      .setTitle('Submit Review');

    const targetInput = new TextInputBuilder()
      .setCustomId('review_target')
      .setLabel('Target Name')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const summaryInput = new TextInputBuilder()
      .setCustomId('review_summary')
      .setLabel('Summary Line')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const detailInput = new TextInputBuilder()
      .setCustomId('review_detail')
      .setLabel('Detail Review (optional)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const ratingsInput = new TextInputBuilder()
      .setCustomId('review_ratings')
      .setLabel('Ratings JSON')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('{ "hospitality":1, "price":2 }');

    modal.addComponents(
      new ActionRowBuilder().addComponents(targetInput),
      new ActionRowBuilder().addComponents(summaryInput),
      new ActionRowBuilder().addComponents(detailInput),
      new ActionRowBuilder().addComponents(ratingsInput)
    );

    await interaction.showModal(modal);
  },
};
