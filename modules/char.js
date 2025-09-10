const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'char.json');

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return {};
  }
}

function writeAll(all) {
  fs.writeFileSync(dataFile, JSON.stringify(all, null, 2));
}

function findPlayerData(userId) {
  const all = readAll();
  if (!all[userId]) {
    all[userId] = { inventory: {}, fleet: {}, lastMineAt: 0 };
    writeAll(all);
  }
  return all[userId];
}

function savePlayerData(userId, data) {
  const all = readAll();
  all[userId] = data;
  writeAll(all);
}

module.exports = { findPlayerData, savePlayerData };
