const { ActionRowBuilder } = require('discord.js');

let startNeurolateExam;
let handleNeurolateInteraction;

function loadNeurolateModule() {
  jest.resetModules();
  ({ startNeurolateExam, handleNeurolateInteraction } = require('../modules/neurolateExam'));
}

const ORIGINAL_DRUG_EMOJI = process.env.DRUG_EMOJI_TAG;
const ORIGINAL_NEWS_CHANNEL_NAME = process.env.NEWS_CHANNEL_NAME;

describe('Neurolate exam flow', () => {
  beforeEach(() => {
    loadNeurolateModule();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (ORIGINAL_DRUG_EMOJI === undefined) {
      delete process.env.DRUG_EMOJI_TAG;
    } else {
      process.env.DRUG_EMOJI_TAG = ORIGINAL_DRUG_EMOJI;
    }

    if (ORIGINAL_NEWS_CHANNEL_NAME === undefined) {
      delete process.env.NEWS_CHANNEL_NAME;
    } else {
      process.env.NEWS_CHANNEL_NAME = ORIGINAL_NEWS_CHANNEL_NAME;
    }

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
    loadNeurolateModule();
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
    expect(row?.constructor?.name).toBe(ActionRowBuilder.name);

    const rowJson = row.toJSON();
    expect(rowJson.components).toHaveLength(1);
    const select = rowJson.components[0];
    expect(select.type).toBe(3); // String select menu
    expect(select.custom_id).toBe('neurolate_q1');
    expect(select.options[0].value).toContain('neurolate_q2');
  });

  test('startNeurolateExam announces with configured drug emoji', async () => {
    process.env.DRUG_EMOJI_TAG = '<:Drug:12345>';
    process.env.NEWS_CHANNEL_NAME = 'station-news';

    loadNeurolateModule();

    const send = jest.fn().mockResolvedValue();
    const newsChannel = {
      name: 'station-news',
      isTextBased: () => true,
      send,
    };

    const guild = {
      channels: {
        cache: {
          find: jest.fn(callback => (callback(newsChannel) ? newsChannel : undefined)),
        },
      },
      roles: { cache: { find: jest.fn(() => undefined) } },
    };

    const interaction = {
      deferred: false,
      replied: false,
      member: { roles: { cache: [] } },
      guild,
      deferReply: jest.fn().mockImplementation(function () {
        interaction.deferred = true;
        return Promise.resolve();
      }),
      editReply: jest.fn().mockResolvedValue(),
    };

    await startNeurolateExam(interaction);

    expect(send).toHaveBeenCalled();
    const [message] = send.mock.calls[0];
    expect(typeof message).toBe('string');
    expect(message.startsWith(process.env.DRUG_EMOJI_TAG)).toBe(true);
  });

  test('handleNeurolateInteraction advances to next question via select value', async () => {
    loadNeurolateModule();
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
    expect(row?.constructor?.name).toBe(ActionRowBuilder.name);
    const rowJson = row.toJSON();
    expect(rowJson.components[0].custom_id).toBe('neurolate_q2');
  });

  test('handleNeurolateInteraction reports results with configured emoji', async () => {
    process.env.DRUG_EMOJI_TAG = '<:Drug:12345>';
    process.env.NEWS_CHANNEL_NAME = 'station-news';

    loadNeurolateModule();

    const send = jest.fn().mockResolvedValue();
    const newsChannel = {
      name: 'station-news',
      isTextBased: () => true,
      send,
    };

    const neurolateRole = { id: 'role-1', name: 'NEUROLATE' };
    const ambassadorRole = { id: 'role-2', name: 'NEUROLATE AMBASSADOR' };
    const assignedRoles = new Set([neurolateRole.id]);

    const guild = {
      channels: {
        cache: {
          find: jest.fn(callback => (callback(newsChannel) ? newsChannel : undefined)),
        },
      },
      roles: {
        cache: {
          find: jest.fn(callback => {
            if (callback(neurolateRole)) return neurolateRole;
            if (callback(ambassadorRole)) return ambassadorRole;
            return undefined;
          }),
        },
      },
    };

    const member = {
      roles: {
        cache: {
          has: jest.fn(id => assignedRoles.has(id)),
        },
        remove: jest.fn(role => {
          assignedRoles.delete(role.id);
          return Promise.resolve();
        }),
        add: jest.fn(role => {
          assignedRoles.add(role.id);
          return Promise.resolve();
        }),
      },
    };

    const interaction = {
      values: ['neurolate_complete|ok'],
      customId: 'neurolate_q10',
      message: {
        components: [
          {
            components: [
              {
                customId: 'neurolate_q10',
                options: [{ value: 'neurolate_complete|ok' }],
              },
            ],
          },
        ],
      },
      update: jest.fn().mockResolvedValue(),
      followUp: jest.fn().mockResolvedValue(),
      guild,
      member,
    };

    await handleNeurolateInteraction(interaction);

    expect(interaction.followUp).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringMatching(new RegExp(`^${process.env.DRUG_EMOJI_TAG}`)),
      })
    );
    expect(send).toHaveBeenCalled();
    const [announcement] = send.mock.calls[0];
    expect(announcement.startsWith(process.env.DRUG_EMOJI_TAG)).toBe(true);
  });

  test('stale submissions are ignored with deferUpdate', async () => {
    loadNeurolateModule();
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
