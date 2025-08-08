const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');
const { showKaldurMenu, handleKaldurOption } = require('../modules/kaldur');

describe.skip('kaldur module', () => {
  test('showKaldurMenu sends intro embed with choices', async () => {
    const reply = jest.fn().mockResolvedValue();
    const interaction = { reply };

    await showKaldurMenu(interaction);

    const { embeds, components } = reply.mock.calls[0][0];
    expect(embeds[0]).toBeInstanceOf(EmbedBuilder);
    expect(embeds[0].data.description).toBe(
      '*Hypertrip returns to the ice world of Kaldur Prime.*\n\nChoose your path.'
    );
    const options = components[0].components[0].options.map(o => o.data.value);
    expect(options).toEqual([
      'kaldur_option_camp',
      'kaldur_option_hunt',
      'kaldur_option_pillage',
      'kaldur_option_end'
    ]);
  });
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
      'You abandon the hunt and return home.',
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

  test('deeper hunt track option disables all components', async () => {
    const destSelect = new StringSelectMenuBuilder()
      .setCustomId('kaldur_select_destination')
      .addOptions({ label: 'camp', value: 'kaldur_option_hunt' });
    const huntSelect = new StringSelectMenuBuilder()
      .setCustomId('kaldur_select_hunt')
      .addOptions({ label: 'track', value: 'kaldur_hunt_track' });
    const row1 = new ActionRowBuilder().addComponents(destSelect);
    const row2 = new ActionRowBuilder().addComponents(huntSelect);
    const interaction = {
      isStringSelectMenu: () => true,
      values: ['kaldur_hunt_track'],
      update: jest.fn().mockResolvedValue(),
      message: { components: [row1, row2] },
    };

    await handleKaldurOption(interaction);

    const { embeds, components } = interaction.update.mock.calls[0][0];
    expect(embeds[0].data.description).toBe(
      'You stalk the legendary beast through frozen canyons.'
    );
    expect(components[0].components[0].toJSON().disabled).toBe(true);
    expect(components[1].components[0].toJSON().disabled).toBe(true);
  });

  test('pillage option grants role', async () => {
    const destSelect = new StringSelectMenuBuilder()
      .setCustomId('kaldur_select_destination')
      .addOptions({ label: 'camp', value: 'kaldur_option_hunt' });
    const huntSelect = new StringSelectMenuBuilder()
      .setCustomId('kaldur_select_hunt')
      .addOptions({ label: 'pillage', value: 'kaldur_hunt_pillage' });
    const row1 = new ActionRowBuilder().addComponents(destSelect);
    const row2 = new ActionRowBuilder().addComponents(huntSelect);
    const member = { roles: { add: jest.fn().mockResolvedValue(), cache: new Map() } };
    const guild = { roles: { cache: { find: jest.fn(() => ({ id: '1' })) } } };
    const interaction = {
      isStringSelectMenu: () => true,
      values: ['kaldur_hunt_pillage'],
      update: jest.fn().mockResolvedValue(),
      message: { components: [row1, row2] },
      member,
      guild,
    };

    await handleKaldurOption(interaction);

    expect(member.roles.add).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });
});
