module.exports = function rotateStatus(client) {
  const statuses = [
    { type: 'WATCHING', text: 'station logs uplink' },
    { type: 'WATCHING', text: 'cargo logs shift ' },
    { type: 'WATCHING', text: 'tribunal feed' },
    { type: 'WATCHING', text: 'reactor output levels' },
    { type: 'WATCHING', text: 'auto-calibration subroutines' },
    { type: 'WATCHING', text: '#news-feed telemetry' },
    { type: 'WATCHING', text: 'command stream authentications' },
    { type: 'WATCHING', text: 'SubdeckGossip.live' },
    { type: 'WATCHING', text: 'Dock 3 photo uploads' },
    { type: 'WATCHING', text: 'profile sync signals' },
    { type: 'WATCHING', text: 'broadcast loop glitch' },
    { type: 'WATCHING', text: 'ethics committee dissolve quietly' },
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
