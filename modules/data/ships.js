const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {
  const embed = new EmbedBuilder()
    .setTitle('STARSHIP REGISTRY')
    .setDescription('Technical readouts for notable ships.')
    .setColor(0x0ea5e9);

  await interaction.reply({ embeds: [embed], ephemeral: true });
};
