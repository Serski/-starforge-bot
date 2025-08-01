const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { handleKaldurOption } = require('../modules/kaldur');

describe('kaldur module', () => {
  test('disables original components after selection', async () => {
    const select = new StringSelectMenuBuilder()
      .setCustomId('menu')
      .addOptions({ label: 'opt', value: 'kaldur_option_camp' });
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

  test('hunt option shows a select menu', async () => {
    const select = new StringSelectMenuBuilder()
      .setCustomId('menu')
      .addOptions({ label: 'hunt', value: 'kaldur_option_hunt' });
    const row = new ActionRowBuilder().addComponents(select);

    const interaction = {
      isStringSelectMenu: () => true,
      values: ['kaldur_option_hunt'],
      update: jest.fn().mockResolvedValue(),
      message: { components: [row] },
    };

    await handleKaldurOption(interaction);

    const components = interaction.update.mock.calls[0][0].components;
    expect(components).toHaveLength(2);
    expect(components[0].components[0].toJSON().disabled).toBe(true);
    const menu = components[1].components[0];
    expect(menu).toBeInstanceOf(StringSelectMenuBuilder);
  });

  test('track option ends hunt without new menus', async () => {
    const rootSelect = new StringSelectMenuBuilder()
      .setCustomId('menu')
      .addOptions({ label: 'hunt', value: 'kaldur_option_hunt' });
    const subSelect = new StringSelectMenuBuilder()
      .setCustomId('sub')
      .addOptions({ label: 'track', value: 'kaldur_hunt_track' });
    const row1 = new ActionRowBuilder().addComponents(rootSelect);
    const row2 = new ActionRowBuilder().addComponents(subSelect);

    const interaction = {
      isStringSelectMenu: () => true,
      values: ['kaldur_hunt_track'],
      update: jest.fn().mockResolvedValue(),
      message: { components: [row1, row2] },
    };

    await handleKaldurOption(interaction);

    const components = interaction.update.mock.calls[0][0].components;
    expect(components).toHaveLength(2);
    expect(components.every(r => r.components[0].toJSON().disabled)).toBe(true);
  });
});
