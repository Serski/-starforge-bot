const { EmbedBuilder } = require('discord.js');

async function handleReviewModal(interaction) {
  const hashtagsInput = interaction.fields.getTextInputValue('review_hashtags');
  let imageMessageId = interaction.fields.getTextInputValue('review_image');
  let imageChannel = interaction.channel;
  if (imageMessageId) {
    imageMessageId = imageMessageId.trim();
    const linkMatch = imageMessageId.match(/discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)/);
    if (linkMatch) {
      const [, guildId, channelId, messageId] = linkMatch;
      if (guildId !== interaction.guildId) {
        await interaction.reply({ content: '❌ Image must be from this server.', ephemeral: true });
        return;
      }
      try {
        imageChannel = await interaction.guild.channels.fetch(channelId);
        imageMessageId = messageId;
      } catch (err) {
        console.error('❌ Failed to fetch image channel:', err);
        await interaction.reply({ content: '❌ Could not fetch the specified image.', ephemeral: true });
        return;
      }
    }
  }

  const target = interaction.fields.getTextInputValue('review_target');
  const summary = interaction.fields.getTextInputValue('review_summary');
  const fullText = interaction.fields.getTextInputValue('review_full');

  const hashtags = hashtagsInput
    ? hashtagsInput
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 4)
        .map(tag => (tag.startsWith('#') ? tag : `#${tag}`))
    : [];

  let description = summary;
  if (fullText) description += `\n\n${fullText}`;
  if (hashtags.length) description += `\n\n${hashtags.join(' ')}`;

  const embed = new EmbedBuilder()
    .setTitle(`${target} — Review`)
    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
    .setDescription(description)
    .setColor(0x2c3e50);



  if (imageMessageId) {
    try {
      const msg = await imageChannel.messages.fetch(imageMessageId);
      const attachment = msg.attachments.first();
      if (attachment && /(png|jpe?g|gif)$/i.test(attachment.url)) {
        embed.setImage(attachment.url);
      } else {
        await interaction.reply({ content: '❌ No image found on that message.', ephemeral: true });
        return;
      }
    } catch (err) {
      console.error('❌ Failed to fetch image message:', err);
      await interaction.reply({ content: '❌ Could not fetch the specified image.', ephemeral: true });
      return;
    }
  }

  const channel = interaction.guild.channels.cache.find(
    c => c.name === process.env.NEWS_CHANNEL_NAME && c.isTextBased()
  );
  if (!channel) {
    await interaction.reply({ content: '❌ Could not find the news-feed channel.', ephemeral: true });
    return;
  }

  try {
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('❌ Failed to post review:', err);
    await interaction.reply({ content: '❌ Failed to post review.', ephemeral: true });
    return;
  }

  await interaction.reply({ content: '✅ Review posted!', ephemeral: true });
}

module.exports = { handleReviewModal };
