const mapCommand = require('../commands/map');
const { EmbedBuilder } = require('discord.js');

describe('map command', () => {
  const setup = async () => {
    const handlers = {};
    const reply = jest.fn().mockResolvedValue({
      createMessageComponentCollector: jest.fn(() => ({
        on: (event, fn) => {
          handlers[event] = fn;
        }
      })),
      editable: true,
      edit: jest.fn().mockResolvedValue()
    });
    const interaction = { reply, user: { id: '1' } };
    await mapCommand.execute(interaction);
    return { handlers, reply };
  };

  test('shows main menu with sectors and cosmos', async () => {
    const { reply } = await setup();
    const { embeds, components } = reply.mock.calls[0][0];
    expect(embeds[0]).toBeInstanceOf(EmbedBuilder);
    const ids = components[0].components.map(c => c.data.custom_id);
    expect(ids).toEqual(['cat_sectors', 'cat_cosmos']);
  });

  test('sector and system flow for Nullwek', async () => {
    const { handlers } = await setup();
    const collect = handlers.collect;

    const update = jest.fn().mockResolvedValue();

    await collect({ customId: 'cat_sectors', update });
    let args = update.mock.calls[0][0];
    expect(args.components[0].components[0].data.custom_id).toBe('sector_select');

    update.mockReset();
    await collect({ customId: 'sector_select', values: ['nullwek'], update });
    args = update.mock.calls[0][0];
    expect(args.embeds[0].data.title).toBe('THE NULLWEK SECTOR');
    expect(args.embeds[0].data.image.url).toBe('https://i.imgur.com/OvKSoNl.jpeg');
    expect(args.components[0].components[0].data.custom_id).toBe('nullwek_select');

    update.mockReset();
    await collect({ customId: 'nullwek_select', values: ['thalyron'], update });
    args = update.mock.calls[0][0];
    expect(args.embeds[0].data.title).toBe('Thalyron');
    expect(args.components[0].components[0].data.custom_id).toBe('back_sector');

    update.mockReset();
    await collect({ customId: 'back_sector', update });
    args = update.mock.calls[0][0];
    expect(args.components[0].components[0].data.custom_id).toBe('sector_select');
  });

  test('sector and system flow for Ashen Verge', async () => {
    const { handlers } = await setup();
    const collect = handlers.collect;

    const update = jest.fn().mockResolvedValue();

    await collect({ customId: 'cat_sectors', update });
    let args = update.mock.calls[0][0];
    expect(args.components[0].components[0].data.custom_id).toBe('sector_select');

    update.mockReset();
    await collect({ customId: 'sector_select', values: ['ashen'], update });
    args = update.mock.calls[0][0];
    expect(args.embeds[0].data.title).toBe('ASHEN VERGE SECTOR');
    expect(args.embeds[0].data.image.url).toBe('https://i.imgur.com/hyMsa2M.jpeg');
    expect(args.components[0].components[0].data.custom_id).toBe('ashen_select');

    update.mockReset();
    await collect({ customId: 'ashen_select', values: ['serothis'], update });
    args = update.mock.calls[0][0];
    expect(args.embeds[0].data.title).toBe('Serothis');
    expect(args.components[0].components[0].data.custom_id).toBe('back_sector');

    update.mockReset();
    await collect({ customId: 'back_sector', update });
    args = update.mock.calls[0][0];
    expect(args.components[0].components[0].data.custom_id).toBe('sector_select');
  });
});

