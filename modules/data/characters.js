const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {
  const embed = new EmbedBuilder()
    .setTitle('PERSONNEL DOSSIERS')
    .setDescription('Accessing character archives... displaying authorized profiles.')
    .setColor(0x84cc16);

  await interaction.reply({ embeds: [embed], ephemeral: true });
};
