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
      reply: jest.fn().mockResolvedValue(),
      guild: { channels: { cache: { find: jest.fn() } } },
      message: { components: [row], edit: jest.fn().mockResolvedValue() },
    };

    await handleCalisaOption(interaction);

    expect(interaction.message.edit).toHaveBeenCalled();
  });

  test('mountain option shows a select menu', async () => {
    const interaction = {
      isStringSelectMenu: () => true,
      values: ['calisa_option_mountain'],
      reply: jest.fn().mockResolvedValue(),
      guild: { channels: { cache: { find: jest.fn() } } },
      message: { components: [], edit: jest.fn().mockResolvedValue() },
    };

    await handleCalisaOption(interaction);

    const components = interaction.reply.mock.calls[0][0].components;
    expect(components).toHaveLength(1);
    const menu = components[0].components[0];
    expect(menu).toBeInstanceOf(StringSelectMenuBuilder);
  });
});
