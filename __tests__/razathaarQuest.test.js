const mockOn = jest.fn();
const mockClient = {
  on: mockOn,
  once: jest.fn(),
  login: jest.fn(),
  guilds: { fetch: jest.fn() },
};

jest.mock('fs', () => ({ readdirSync: () => [] }));

jest.mock('discord.js', () => ({
  Client: jest.fn(() => mockClient),
  GatewayIntentBits: {},
  Collection: class {},
}));

const mockHandleRazathaarOption = jest.fn();
const mockShowRazathaarMenu = jest.fn();

jest.mock('../modules/razathaarQuest', () => ({
  showRazathaarMenu: mockShowRazathaarMenu,
  handleRazathaarOption: mockHandleRazathaarOption,
}));

jest.mock('../modules/calisa', () => ({ showCalisaMenu: jest.fn(), handleCalisaOption: jest.fn() }));
jest.mock('../modules/kaldur', () => ({ showKaldurMenu: jest.fn(), handleKaldurOption: jest.fn() }));
jest.mock('../modules/news', () => ({ startNewsCycle: jest.fn() }));
jest.mock('../modules/status', () => jest.fn());
jest.mock('../modules/ads', () => ({ startAdLoop: jest.fn() }));
jest.mock('../modules/review', () => ({ handleReviewModal: jest.fn() }));

require('../index');
const interactionHandler = mockOn.mock.calls.find(call => call[0] === 'interactionCreate')[1];

beforeEach(() => {
  mockHandleRazathaarOption.mockClear();
  mockShowRazathaarMenu.mockClear();
});

describe('razathaar quest interaction routing', () => {
  test('dispatches to handleRazathaarOption for rz_ select menus', async () => {
    const interaction = {
      isButton: () => false,
      isStringSelectMenu: () => true,
      customId: 'rz_d1_select',
    };

    await interactionHandler(interaction);

    expect(mockHandleRazathaarOption).toHaveBeenCalledWith(interaction);
  });

  test('assigns RAZATHAAR role and starts quest', async () => {
    const role = { id: '1' };
    const guild = { roles: { cache: { find: jest.fn(() => role) } } };
    const member = { id: '42', roles: { add: jest.fn().mockResolvedValue(), cache: new Map() } };
    const channel = { send: jest.fn().mockResolvedValue() };

    const interaction = {
      isButton: () => true,
      customId: 'razathaar_start_quest',
      member,
      guild,
      channel,
      deferReply: jest.fn().mockResolvedValue(),
    };

    await interactionHandler(interaction);

    expect(interaction.deferReply).toHaveBeenCalledWith({ ephemeral: true });
    expect(member.roles.add).toHaveBeenCalledWith(role);
    expect(channel.send).toHaveBeenCalledWith({ content: `🚚 <@${member.id}> has accepted a Razathaar freight contract...` });
    expect(mockShowRazathaarMenu).toHaveBeenCalledWith(interaction);
  });
});

