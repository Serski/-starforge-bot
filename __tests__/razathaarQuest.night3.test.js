const { handleRazathaarOption } = require('../modules/razathaarQuest');

describe('Night 3 resolution', () => {
  test('succeeds with contact, corridor, and cover', async () => {
    const update = jest.fn().mockResolvedValue();
    const followUp = jest.fn().mockResolvedValue();
    const interaction = {
      isStringSelectMenu: () => false,
      isButton: () => true,
      customId: 'rz_night|CN|RB|GLC',
      update,
      followUp,
      inGuild: () => false,
    };

    await handleRazathaarOption(interaction);
    const embed = update.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('The Sere Auction');
  });

  test('fails when a cover is missing', async () => {
    const update = jest.fn().mockResolvedValue();
    const followUp = jest.fn().mockResolvedValue();
    const interaction = {
      isStringSelectMenu: () => false,
      isButton: () => true,
      customId: 'rz_night|CN|RB',
      update,
      followUp,
      inGuild: () => false,
    };

    await handleRazathaarOption(interaction);
    const embed = update.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Audit Hall, Dawn');
    expect(embed.data.description).toContain('a **Cover**');
  });
});
