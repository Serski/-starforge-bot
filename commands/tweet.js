const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const withInteractionHandler = require('../utils/withInteractionHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tweet')
    .setDescription('Post an in-character social feed message')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Your message (in-character)')
        .setRequired(true)
    ),

  execute: withInteractionHandler(async (interaction) => {
    const text = interaction.options.getString('text');
    const username = interaction.user.username;
    const avatar = interaction.user.displayAvatarURL();

    const embed = new EmbedBuilder()
      .setAuthor({ name: `@${username}`, iconURL: avatar })
      .setDescription(`"${text}"`)
      .setFooter({ text: ` NEXI Social Feed` })
      .setColor(0x2c3e50);

    const channel = interaction.guild.channels.cache.find(
      c => c.name === process.env.NEWS_CHANNEL_NAME && c.isTextBased()
    );

    if (!channel) {
      await interaction.editReply({
        content: '❌ Could not find the news-feed channel.',
        ephemeral: true
      });
      return;
    }

    await channel.send({ embeds: [embed] });

    await interaction.editReply({
      content: '✅ NEXI uplink sent.',
      ephemeral: true
    });
  }),
};
