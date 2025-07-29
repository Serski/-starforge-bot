const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {
  const embed = new EmbedBuilder()
    .setTitle('CORPORATE INDEX')
    .setDescription('Profiles of major interstellar companies and trade groups.')
    .setColor(0xf97316);

  await interaction.reply({ embeds: [embed], ephemeral: true });
};
