const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {
  const embed = new EmbedBuilder()
    .setTitle('AEGIR CORE NODE')
    .setDescription('Monitoring uplink to AEGIR AI core. Data feed status: nominal.')
    .setColor(0x7c3aed);

  await interaction.reply({ embeds: [embed], ephemeral: true });
};
