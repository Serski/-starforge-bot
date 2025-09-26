const { ActionRowBuilder } = require('discord.js');
const { startNeurolateExam, handleNeurolateInteraction } = require('../modules/neurolateExam');

describe('Neurolate exam flow', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createGuild() {
    return {
      channels: {
        cache: {
          find: jest.fn(() => undefined),
        },
      },
      roles: {
        cache: {
          find: jest.fn(() => undefined),
        },
      },
    };
  }

  test('startNeurolateExam renders a select menu for choices', async () => {
    const interaction = {
      deferred: false,
      replied: false,
      member: { roles: { cache: [] } },
      guild: createGuild(),
      deferReply: jest.fn().mockImplementation(function () {
        interaction.deferred = true;
        return Promise.resolve();
      }),
      editReply: jest.fn().mockResolvedValue(),
    };

    await startNeurolateExam(interaction);

    expect(interaction.deferReply).toHaveBeenCalledWith({ flags: expect.any(Number) });
    expect(interaction.editReply).toHaveBeenCalled();

    const payload = interaction.editReply.mock.calls[0][0];
    expect(Array.isArray(payload.components)).toBe(true);
    expect(payload.components).toHaveLength(1);

    const row = payload.components[0];
    expect(row).toBeInstanceOf(ActionRowBuilder);

    const rowJson = row.toJSON();
    expect(rowJson.components).toHaveLength(1);
    const select = rowJson.components[0];
    expect(select.type).toBe(3); // String select menu
    expect(select.custom_id).toBe('neurolate_q1');
    expect(select.options[0].value).toContain('neurolate_q2');
  });

  test('handleNeurolateInteraction advances to next question via select value', async () => {
    const interaction = {
      values: ['neurolate_q2|ok'],
      customId: 'neurolate_q1',
      message: {
        components: [
          {
            components: [
              {
                customId: 'neurolate_q1',
                options: [
                  { value: 'neurolate_q2|ok' },
                  { value: 'neurolate_q2|fail' },
                ],
              },
            ],
          },
        ],
      },
      update: jest.fn().mockResolvedValue(),
    };

    await handleNeurolateInteraction(interaction);

    expect(interaction.update).toHaveBeenCalled();
    const nextPayload = interaction.update.mock.calls[0][0];
    expect(Array.isArray(nextPayload.components)).toBe(true);
    expect(nextPayload.components).toHaveLength(1);

    const row = nextPayload.components[0];
    expect(row).toBeInstanceOf(ActionRowBuilder);
    const rowJson = row.toJSON();
    expect(rowJson.components[0].custom_id).toBe('neurolate_q2');
  });

  test('stale submissions are ignored with deferUpdate', async () => {
    const interaction = {
      values: ['neurolate_q2|ok'],
      customId: 'neurolate_q1',
      message: {
        components: [
          {
            components: [
              {
                customId: 'neurolate_q2',
                options: [{ value: 'neurolate_q3|ok' }],
              },
            ],
          },
        ],
      },
      deferUpdate: jest.fn().mockResolvedValue(),
    };

    await handleNeurolateInteraction(interaction);

    expect(interaction.deferUpdate).toHaveBeenCalled();
  });
});
