const path = require('path');
const { getAds, getNews, reloadAll } = require('../modules/cache');

describe('cache module', () => {
  beforeEach(() => {
    reloadAll();
  });

  test('loads ads from JSON', () => {
    const ads = getAds();
    expect(Array.isArray(ads)).toBe(true);
    expect(ads.length).toBeGreaterThan(0);
    expect(ads[0]).toHaveProperty('title');
  });

  test('loads news from JSON', () => {
    const news = getNews();
    expect(Array.isArray(news)).toBe(true);
    expect(news.length).toBeGreaterThan(0);
    expect(typeof news[0]).toBe('string');
  });
});
