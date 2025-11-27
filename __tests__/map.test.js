const mapCommand = require('../commands/map');
const { EmbedBuilder } = require('discord.js');

describe('map command', () => {
  test('shows main menu with map embed only', async () => {
    const reply = jest.fn().mockResolvedValue({ editable: true, edit: jest.fn() });
    const interaction = { reply, user: { id: '1' } };

    await mapCommand.execute(interaction);

    const { embeds, components } = reply.mock.calls[0][0];
    expect(embeds[0]).toBeInstanceOf(EmbedBuilder);
    expect(components).toBeUndefined();
  });
});
