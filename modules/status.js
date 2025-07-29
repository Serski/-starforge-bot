const { ActivityType } = require('discord.js');

module.exports = function rotateStatus(client) {
  const statuses = [
    { type: ActivityType.Watching, text: 'station logs uplink' },
  ];

  let i = 0;

  const updateStatus = () => {
    const s = statuses[i % statuses.length];
    client.user.setPresence({
      activities: [
        {
          name: `${s.text} \u200B`, // includes an invisible space (U+200B)
          type: s.type,
        },
      ],
      status: 'online',
    });
    console.log(`🛰️ Status set to: ${s.type} ${s.text}`);
    i++;
  };

  // Set immediately on startup
  updateStatus();

  // Rotate every 10 minutes
  setInterval(updateStatus, 10 * 60 * 1000);
};
