const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getInventory } = require('../modules/inventory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Show your current inventory'),

  async execute(interaction) {
    const items = getInventory(interaction.user.id);
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Inventory`)
      .setDescription(
        items.length ? items.map(i => `• ${i}`).join('\n') : 'Your inventory is empty.'
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
