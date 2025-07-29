const fs = require('fs');
const path = require('path');

let adsCache = null;
let newsCache = null;

function loadJSON(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw);
}

function loadAll() {
  adsCache = loadJSON('ads.json');
  newsCache = loadJSON('news.json');
}

function getAds() {
  if (!adsCache) loadAll();
  return adsCache;
}

function getNews() {
  if (!newsCache) loadAll();
  return newsCache;
}

function reloadAll() {
  loadAll();
}

module.exports = {
  getAds,
  getNews,
  reloadAll
};
