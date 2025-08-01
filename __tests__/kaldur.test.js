const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');
const { handleKaldurOption } = require('../modules/kaldur');

describe('kaldur module', () => {
  test('selecting a destination disables menu components', async () => {
    const select = new StringSelectMenuBuilder()
      .setCustomId('menu')
      .addOptions({ label: 'camp', value: 'kaldur_option_camp' });
    const row = new ActionRowBuilder().addComponents(select);

    const interaction = {
      isStringSelectMenu: () => true,
      values: ['kaldur_option_camp'],
      update: jest.fn().mockResolvedValue(),
      message: { components: [row] },
    };

    await handleKaldurOption(interaction);

    const components = interaction.update.mock.calls[0][0].components;
    expect(components[0].components[0].toJSON().disabled).toBe(true);
  });

  test.each([
    [
      'kaldur_option_camp',
      'You set up a base camp amid the cold spires of Kaldur Prime.',
      1,
    ],
    [
      'kaldur_option_hunt',
      'The hunt begins in the obsidian wilds.',
      2,
    ],
    [
      'kaldur_option_end',
      'You abandon the hunt and return home with tales of near glory.',
      1,
    ],
  ])('responds correctly for %s', async (value, text, rows) => {
    const select = new StringSelectMenuBuilder()
      .setCustomId('menu')
      .addOptions({ label: 'opt', value });
    const row = new ActionRowBuilder().addComponents(select);

    const interaction = {
      isStringSelectMenu: () => true,
      values: [value],
      update: jest.fn().mockResolvedValue(),
      message: { components: [row] },
    };

    await handleKaldurOption(interaction);

    const { embeds, components } = interaction.update.mock.calls[0][0];
    expect(embeds[0]).toBeInstanceOf(EmbedBuilder);
    expect(embeds[0].data.description).toBe(text);
    expect(components).toHaveLength(rows);
    expect(components[0].components[0].toJSON().disabled).toBe(true);
    if (value === 'kaldur_option_hunt') {
      const menu = components[1].components[0];
      expect(menu).toBeInstanceOf(StringSelectMenuBuilder);
    }
  });
});
