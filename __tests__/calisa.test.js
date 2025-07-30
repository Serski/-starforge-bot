const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { handleCalisaOption } = require('../modules/calisa');

describe('calisa module', () => {
  test('disables original components after selection', async () => {
    const select = new StringSelectMenuBuilder()
      .setCustomId('menu')
      .addOptions({ label: 'opt', value: 'calisa_option_hotel' });
    const row = new ActionRowBuilder().addComponents(select);

    const interaction = {
      isStringSelectMenu: () => true,
      values: ['calisa_option_hotel'],
      update: jest.fn().mockResolvedValue(),
      guild: { channels: { cache: { find: jest.fn() } } },
      message: { components: [row] },
    };

    await handleCalisaOption(interaction);

    expect(interaction.update).toHaveBeenCalled();
  });

  test('mountain option shows a select menu', async () => {
    const interaction = {
      isStringSelectMenu: () => true,
      values: ['calisa_option_mountain'],
      update: jest.fn().mockResolvedValue(),
      guild: { channels: { cache: { find: jest.fn() } } },
      message: { components: [] },
    };

    await handleCalisaOption(interaction);

    const components = interaction.update.mock.calls[0][0].components;
    expect(components).toHaveLength(1);
    const menu = components[0].components[0];
    expect(menu).toBeInstanceOf(StringSelectMenuBuilder);
  });

  test('forest option grants mystery role and pings', async () => {
    const send = jest.fn().mockResolvedValue();
    const followUp = jest.fn().mockResolvedValue();
    const guild = {
      channels: { cache: { find: jest.fn(() => ({ send })) } },
      roles: { cache: { find: jest.fn(() => ({ id: '123' })) } },
    };
    const member = { roles: { add: jest.fn().mockResolvedValue(), cache: new Map() } };
    const interaction = {
      isStringSelectMenu: () => true,
      values: ['calisa_mtn_forest'],
      update: jest.fn().mockResolvedValue(),
      followUp,
      guild,
      member,
      message: { components: [] },
    };

    await handleCalisaOption(interaction);

    expect(member.roles.add).toHaveBeenCalled();
    expect(followUp).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });
});
