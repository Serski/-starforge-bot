const { EmbedBuilder } = require('discord.js');

async function handleReviewModal(interaction) {
  const target = interaction.fields.getTextInputValue('review_target');
  const summary = interaction.fields.getTextInputValue('review_summary');
  const detail = interaction.fields.getTextInputValue('review_detail');
  const ratingsRaw = interaction.fields.getTextInputValue('review_ratings');

  let ratings;
  try {
    ratings = JSON.parse(ratingsRaw);
  } catch {
    await interaction.reply({ content: '❌ Invalid ratings JSON.', ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`${target} — Player Review`)
    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
    .setDescription(summary)
    .setColor(0x2c3e50);

  const keys = ['hospitality', 'price', 'crowd', 'cleanliness', 'transport'];
  for (const key of keys) {
    if (ratings[key] !== undefined) {
      embed.addFields({ name: key.charAt(0).toUpperCase() + key.slice(1), value: String(ratings[key]), inline: true });
    }
  }

  if (detail) {
    embed.addFields({ name: 'Full Review', value: `||${detail}||` });
  }

  const channel = interaction.guild.channels.cache.find(
    c => c.name === process.env.NEWS_CHANNEL_NAME && c.isTextBased()
  );
  if (!channel) {
    await interaction.reply({ content: '❌ Could not find the news-feed channel.', ephemeral: true });
    return;
  }

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: '✅ Review posted!', ephemeral: true });
}

module.exports = { handleReviewModal };
