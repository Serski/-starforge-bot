const raidSessions = new Map();

function getRaidSession(userId) {
  return raidSessions.get(userId);
}

function setRaidSession(userId, data) {
  raidSessions.set(userId, data);
}

function clearRaidSession(userId) {
  raidSessions.delete(userId);
}

module.exports = {
  getRaidSession,
  setRaidSession,
  clearRaidSession
};
