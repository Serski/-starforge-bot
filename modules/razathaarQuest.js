// Placeholder quest for Razathaar freight run.
// Full narrative will be implemented later.

async function showRazathaarMenu(interaction) {
  await interaction.reply({
    content: '🚧 Razathaar freight run coming soon...',
    ephemeral: true,
  });
}

async function handleRazathaarOption(interaction) {
  await interaction.update({
    content: '🚧 Razathaar quest step pending implementation.',
    components: [],
  });
}

module.exports = {
  showRazathaarMenu,
  handleRazathaarOption,
};
