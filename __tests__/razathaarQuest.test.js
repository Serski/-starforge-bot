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

jest.mock('../modules/razathaarQuest', () => ({
  showRazathaarMenu: jest.fn(),
  handleRazathaarOption: mockHandleRazathaarOption,
}));

jest.mock('../modules/calisa', () => ({ showCalisaMenu: jest.fn(), handleCalisaOption: jest.fn() }));
jest.mock('../modules/kaldur', () => ({ showKaldurMenu: jest.fn(), handleKaldurOption: jest.fn() }));
jest.mock('../modules/news', () => ({ startNewsCycle: jest.fn() }));
jest.mock('../modules/status', () => jest.fn());
jest.mock('../modules/ads', () => ({ startAdLoop: jest.fn() }));
jest.mock('../modules/review', () => ({ handleReviewModal: jest.fn() }));

describe('razathaar quest interaction routing', () => {
  test('dispatches to handleRazathaarOption for rz_ select menus', async () => {
    require('../index');
    const interactionHandler = mockOn.mock.calls.find(call => call[0] === 'interactionCreate')[1];
    const interaction = {
      isButton: () => false,
      isStringSelectMenu: () => true,
      customId: 'rz_d1_select',
    };
    await interactionHandler(interaction);
    expect(mockHandleRazathaarOption).toHaveBeenCalledWith(interaction);
  });
});
