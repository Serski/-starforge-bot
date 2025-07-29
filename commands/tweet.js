const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const withInteractionHandler = require('../utils/withInteractionHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tweet')
    .setDescription('Post an in-character social feed message')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Your message (in-character, up to 400 words)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('hashtags')
        .setDescription('Space separated hashtags (max 4)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Imgur image link')
        .setRequired(false)
    ),

  execute: withInteractionHandler(async (interaction) => {
    const text = interaction.options.getString('text');
    const hashtagsInput = interaction.options.getString('hashtags');
    const imageUrl = interaction.options.getString('image');

    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length > 400) {
      await interaction.editReply({
        content: '❌ Message must be 400 words or fewer.',
        ephemeral: true,
      });
      return;
    }

    const hashtags = hashtagsInput
      ? hashtagsInput
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 4)
          .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
      : [];

    if (imageUrl && !/imgur\.com/.test(imageUrl)) {
      await interaction.editReply({
        content: '❌ Image must be hosted on Imgur.',
        ephemeral: true,
      });
      return;
    }

    const username = interaction.user.username;
    const avatar = interaction.user.displayAvatarURL();

    const descriptionParts = [`"${text}"`];
    if (hashtags.length) descriptionParts.push(hashtags.join(' '));

    const embed = new EmbedBuilder()
      .setAuthor({ name: `@${username}`, iconURL: avatar })
      .setDescription(descriptionParts.join('\n\n'))
      .setFooter({ text: ` NEXI Social Feed` })
      .setColor(0x2c3e50);

    if (imageUrl) {
      embed.setImage(imageUrl);
    }

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
