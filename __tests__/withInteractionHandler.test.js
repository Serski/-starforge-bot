const withInteractionHandler = require('../utils/withInteractionHandler');

describe('withInteractionHandler', () => {
  test('calls handler and defers reply', async () => {
    const interaction = {
      deferReply: jest.fn().mockResolvedValue(),
      editReply: jest.fn().mockResolvedValue(),
    };
    const handler = jest.fn().mockResolvedValue();

    const wrapped = withInteractionHandler(handler);
    await wrapped(interaction);

    expect(interaction.deferReply).toHaveBeenCalledWith({ ephemeral: true });
    expect(handler).toHaveBeenCalledWith(interaction);
    expect(interaction.editReply).not.toHaveBeenCalled();
  });

  test('handles errors and edits reply', async () => {
    const interaction = {
      deferReply: jest.fn().mockResolvedValue(),
      editReply: jest.fn().mockResolvedValue(),
      commandName: 'test'
    };
    const error = new Error('fail');
    const handler = jest.fn().mockRejectedValue(error);
    console.error = jest.fn();

    const wrapped = withInteractionHandler(handler);
    await wrapped(interaction);

    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalledWith('❌ Something went wrong.');
    expect(console.error).toHaveBeenCalled();
  });
});
