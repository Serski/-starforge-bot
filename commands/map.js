const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('map')
    .setDescription('Access the NEXI galactic map.'),

  async execute(interaction) {
    const mapUrl = 'attachment://map-int.png';

    const mapEmbed = new EmbedBuilder()
      .setTitle('NEXI GALACTIC MAP')
      .setDescription('View the interactive map here: https://outpost-aegir.com/')
      .setImage(mapUrl);

    const mapAttachment = new AttachmentBuilder(
      path.join(__dirname, '../modules/data/MAP INT.png'),
      { name: 'map-int.png' }
    );

    await interaction.reply({
      embeds: [mapEmbed],
      fetchReply: true,
      ephemeral: true,
      files: [mapAttachment]
    });
  }
};
