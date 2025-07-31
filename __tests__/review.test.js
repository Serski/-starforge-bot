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
            review_detail: 'Long review',
            review_ratings: '{"hospitality":1,"price":2,"crowd":3,"cleanliness":4,"transport":5}'
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

  test('invalid ratings shows error message', async () => {
    process.env.NEWS_CHANNEL_NAME = 'news-feed';
    const send = jest.fn().mockResolvedValue();
    const interaction = {
      guild: { channels: { cache: { find: jest.fn(() => ({ send })) } } },
      fields: { getTextInputValue: jest.fn(id => {
          const data = {
            review_target: 'Calisa VII',
            review_summary: 'Nice place',
            review_detail: 'Long review',
            review_ratings: 'not json'
          };
          return data[id];
      }) },
      user: { username: 'tester', displayAvatarURL: () => 'https://example.com/avatar.png' },
      reply: jest.fn().mockResolvedValue(),
    };

    await handleReviewModal(interaction);

    expect(send).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.stringContaining('Invalid ratings JSON'),
      ephemeral: true,
    }));
  });
});
