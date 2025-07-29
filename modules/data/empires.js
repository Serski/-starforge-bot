const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {
  const embed = new EmbedBuilder()
    .setTitle('EMPIRE REGISTRY')
    .setDescription('Overview of known empires and their classifications.')
    .setColor(0x3b82f6);

  await interaction.reply({ embeds: [embed], ephemeral: true });
};
