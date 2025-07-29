const { SlashCommandBuilder } = require('discord.js');
const { reloadAll } = require('../modules/cache');
const withInteractionHandler = require('../utils/withInteractionHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reloadcache')
    .setDescription('Reload ads and news cache from JSON files (admin only)'),

  execute: withInteractionHandler(async (interaction) => {
    const allowedUserId = process.env.ADMIN_USER_ID;

    if (interaction.user.id !== allowedUserId) {
      await interaction.editReply({
        content: '❌ You are not authorized to use this command.',
        ephemeral: true
      });
      return;
    }

    reloadAll();

    await interaction.editReply({
      content: '♻️ Cache reloaded from disk.',
      ephemeral: true
    });
  }),
};
