const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { postAd } = require('../modules/ads');
const withInteractionHandler = require('../utils/withInteractionHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('postad')
    .setDescription('Post a random ad to the news-feed (admin only)'),

  execute: withInteractionHandler(async (interaction) => {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.editReply({
        content: '❌ You are not authorized to use this command.',
        ephemeral: true
      });
      return;
    }

    await postAd(interaction.client);

    await interaction.editReply({
      content: '✅ Ad posted to the news-feed!',
      ephemeral: true
    });
  }),
};
