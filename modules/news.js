const { getNews } = require('./cache');

function getRandomDelay() {
  const min = 2 * 60 * 60 * 1000; // 2 hours
  const max = 3 * 60 * 60 * 1000; // 3 hours
  return Math.floor(Math.random() * (max - min) + min);
}

async function postNews(client) {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channels = await guild.channels.fetch();

    const channel = [...channels.values()].find(
      (c) => c.name === process.env.NEWS_CHANNEL_NAME && c.isTextBased()
    );

    if (!channel) {
      console.error(`❌ News channel "${process.env.NEWS_CHANNEL_NAME}" not found in ${guild.name}`);
      return;
    }

    const newsMessages = getNews();
    const message = newsMessages[Math.floor(Math.random() * newsMessages.length)];

    await channel.send(message);
    console.log(`📰 News posted in ${guild.name}: "${message.substring(0, 50)}..."`);
  } catch (err) {
    console.error('❌ Failed to post news:', err);
  }
}

function startNewsCycle(client) {
  postNews(client); // post once immediately
  setInterval(() => postNews(client), getRandomDelay());
}

module.exports = {
  startNewsCycle
};
