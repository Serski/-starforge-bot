const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { getAds } = require("./cache");

async function postAd(client) {
  const ads = getAds();
  const ad = ads[Math.floor(Math.random() * ads.length)];

  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const channels = await guild.channels.fetch();
  const channel = channels.find(
    (c) => c.name === process.env.NEWS_CHANNEL_NAME && c.isTextBased()
  );

  if (!channel) {
    console.error(`❌ Ads channel not found in ${guild.name}!`);
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(ad.title)
    .setDescription(ad.text)
    .setImage(ad.image)
    .setColor(0x2c3e50)
    .setFooter({
      text: `Sponsored by ${ad.sponsor}`,
    });

  // 🎫 Show the BUY TICKET button for CALISA or KALDUR ads
  const title = ad.title.toLowerCase();
  const isCalisa = title.includes("calisa");
  const isKaldur = title.includes("kaldur"); // match "kaldur prime" as well
  const components = isCalisa || isKaldur
    ? [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(isCalisa ? "calisa_buy_ticket" : "kaldur_buy_ticket")
            .setLabel("🎫 Buy Ticket")
            .setStyle(ButtonStyle.Primary)
        ),
      ]
    : [];

  await channel.send({ embeds: [embed], components });
  console.log(`[✅] Ad posted in ${guild.name}: "${ad.title}"`);
}

function startAdLoop(client) {
  async function loop() {
    await postAd(client);
    const hours = 18 + Math.floor(Math.random() * 6); // Between 18–24 hours
    const ms = hours * 60 * 60 * 1000;
    setTimeout(loop, ms);
  }

  loop(); // Kick off the loop
}

module.exports = {
  postAd,
  startAdLoop,
};
