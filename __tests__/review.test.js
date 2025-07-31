const { handleReviewModal } = require('../modules/review');
const { EmbedBuilder } = require('discord.js');

describe('review module', () => {
  test('posts embed and replies', async () => {
    process.env.NEWS_CHANNEL_NAME = 'news-feed';
    const send = jest.fn().mockResolvedValue();
    const interaction = {
      guild: { channels: { cache: { find: jest.fn(() => ({ send })) } } },
      fields: { getTextInputValue: jest.fn(id => {
          const data = {
            review_target: 'Calisa VII',
            review_summary: 'Nice place',
            review_full: '',
            review_hashtags: '',
            review_image: ''
          };
          return data[id];
      }) },
      user: { username: 'tester', displayAvatarURL: () => 'https://example.com/avatar.png' },
      reply: jest.fn().mockResolvedValue(),
    };

    await handleReviewModal(interaction);

    expect(send).toHaveBeenCalled();
    const embed = send.mock.calls[0][0].embeds[0];
    expect(embed).toBeInstanceOf(EmbedBuilder);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('handles hashtags and image attachment', async () => {
    process.env.NEWS_CHANNEL_NAME = 'news-feed';
    const send = jest.fn().mockResolvedValue();
    const fetch = jest.fn().mockResolvedValue({
      attachments: { first: () => ({ url: 'https://example.com/img.png' }) }
    });
    const interaction = {
      guild: { channels: { cache: { find: jest.fn(() => ({ send })) } } },
      channel: { messages: { fetch } },
      fields: { getTextInputValue: jest.fn(id => {
          const data = {
            review_target: 'Calisa VII',
            review_summary: 'Nice place',
            review_full: 'Full text',
            review_hashtags: 'cool',
            review_image: '123'
          };
          return data[id];
      }) },
      user: { username: 'tester', displayAvatarURL: () => 'https://example.com/avatar.png' },
      reply: jest.fn().mockResolvedValue(),
    };

    await handleReviewModal(interaction);

    expect(send).toHaveBeenCalled();
    const embed = send.mock.calls[0][0].embeds[0];
    expect(embed.data.description).toMatch(/Full text/);
    expect(embed.data.description).toMatch(/#cool/);
    expect(embed.data.image.url).toBe('https://example.com/img.png');
  });

  test('handles error when sending embed', async () => {
    process.env.NEWS_CHANNEL_NAME = 'news-feed';
    const send = jest.fn().mockRejectedValue(new Error('fail'));
    const interaction = {
      guild: { channels: { cache: { find: jest.fn(() => ({ send })) } } },
      fields: {
        getTextInputValue: jest.fn(id => {
          const data = {
            review_target: 'Calisa VII',
            review_summary: 'Nice place',
            review_full: '',
            review_hashtags: '',
            review_image: ''
          };
          return data[id];
        })
      },
      user: { username: 'tester', displayAvatarURL: () => 'https://example.com/avatar.png' },
      reply: jest.fn().mockResolvedValue(),
    };
    console.error = jest.fn();

    await handleReviewModal(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
    expect(console.error).toHaveBeenCalled();
  });
});
