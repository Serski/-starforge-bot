const { ActionRowBuilder } = require('discord.js');
const { postAd } = require('../modules/ads');

jest.mock('../modules/cache', () => ({
  getAds: jest.fn(),
}));

const { getAds } = require('../modules/cache');

describe('ads module', () => {
  test('adds ticket button for Kaldur ad', async () => {
    process.env.GUILD_ID = '1';
    process.env.NEWS_CHANNEL_NAME = 'news-feed';

    const send = jest.fn().mockResolvedValue();
    const channel = { name: 'news-feed', isTextBased: () => true, send };
    const channels = { find: jest.fn(() => channel) };
    const guild = { name: 'Test', channels: { fetch: jest.fn().mockResolvedValue(channels) } };
    const client = { guilds: { fetch: jest.fn().mockResolvedValue(guild) } };

    getAds.mockReturnValue([
      {
        title: 'KALDUR PRIME',
        text: 'Hunt awaits',
        image: 'http://example.com/img.png',
        sponsor: 'Hypertrip',
      },
    ]);

    await postAd(client);

    expect(send).toHaveBeenCalled();
    const components = send.mock.calls[0][0].components;
    expect(components).toHaveLength(1);
    const row = components[0];
    expect(row).toBeInstanceOf(ActionRowBuilder);
    const btn = row.components[0];
    expect(btn.toJSON().custom_id).toBe('kaldur_buy_ticket');
  });

  test('adds contract button for light-freight ad', async () => {
    process.env.GUILD_ID = '1';
    process.env.NEWS_CHANNEL_NAME = 'news-feed';

    const send = jest.fn().mockResolvedValue();
    const channel = { name: 'news-feed', isTextBased: () => true, send };
    const channels = { find: jest.fn(() => channel) };
    const guild = { name: 'Test', channels: { fetch: jest.fn().mockResolvedValue(channels) } };
    const client = { guilds: { fetch: jest.fn().mockResolvedValue(guild) } };

    getAds.mockReturnValue([
      {
        title: 'CALLING ALL LIGHT-FREIGHT CAPTAINS',
        text: 'Haul cargo',
        image: 'http://example.com/img.png',
        sponsor: 'Kawazei',
      },
    ]);

    await postAd(client);

    expect(send).toHaveBeenCalled();
    const components = send.mock.calls[0][0].components;
    expect(components).toHaveLength(1);
    const row = components[0];
    expect(row).toBeInstanceOf(ActionRowBuilder);
    const btn = row.components[0];
    expect(btn.toJSON().custom_id).toBe('razathaar_start_quest');
  });
});
