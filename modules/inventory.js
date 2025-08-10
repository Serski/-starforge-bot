const fs = require('fs');
const path = require('path');

const inventoryFile = path.join(__dirname, '..', 'inventory.json');

function readInventory() {
  try {
    const data = fs.readFileSync(inventoryFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function writeInventory(inv) {
  fs.writeFileSync(inventoryFile, JSON.stringify(inv, null, 2));
}

function getInventory(userId) {
  const inv = readInventory();
  return inv[userId] || [];
}

function setInventory(userId, items) {
  const inv = readInventory();
  inv[userId] = items;
  writeInventory(inv);
}

module.exports = {
  getInventory,
  setInventory,
};
