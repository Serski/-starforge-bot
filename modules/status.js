module.exports = function rotateStatus(client) {
  const statuses = [
    { type: 'WATCHING', text: 'station logs uplink' },
  ];

  let i = 0;
setInterval(() => {
  const s = statuses[i % statuses.length];
client.user.setPresence({
  activities: [{
    name: `${s.text} ​`, // <-- includes an invisible space (U+200B)
    type: s.type
  }],
  status: 'online'
});
  console.log(`🛰️ Status set to: ${s.type} ${s.text}`);
  i++;
}, 10 * 60 * 1000);
// every 10 minutes
};
