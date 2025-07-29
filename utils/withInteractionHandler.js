// utils/withInteractionHandler.js

module.exports = function withInteractionHandler(handlerFn) {
  return async function (interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      await handlerFn(interaction);
    } catch (err) {
      console.error(`[${interaction.commandName} error]`, err);
      try {
        await interaction.editReply('❌ Something went wrong.');
      } catch {}
    }
  };
};
