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

const mineSessions = new Map();

function getMineSession(userId) {
  return mineSessions.get(userId);
}

function setMineSession(userId, data) {
  mineSessions.set(userId, data);
}

function clearMineSession(userId) {
  mineSessions.delete(userId);
}

module.exports = {
  getRaidSession,
  setRaidSession,
  clearRaidSession,
  getMineSession,
  setMineSession,
  clearMineSession
};
