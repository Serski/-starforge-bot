const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');

async function showKaldurMenu(interaction) {
  const embed = new EmbedBuilder()
    .setDescription(
      '*No return. No mercy.*\n\n' +
        'Kaldur Prime awaits beyond the veil of sanctioned space. ' +
        'Ice storms flay metal. Megafauna roam ancient valleys. ' +
        'Hunters vanish chasing glory.\n\n' +
        '**Where will you hunt?**'
    )
    .setImage('https://i.imgur.com/WdZImBi.png')
    .setColor(0x2c3e50);

  const select = new StringSelectMenuBuilder()
    .setCustomId('kaldur_select_destination')
    .setPlaceholder('Choose your quarry')
    .addOptions([
      {
        label: 'The Iron Citadel',
        value: 'kaldur_option_citadel',
        emoji: { id: '1399477691278692352' },
      },
      {
        label: 'Ice Wastes',
        value: 'kaldur_option_wastes',
        emoji: { id: '1399477691278692352' },
      },
      {
        label: 'Crystal Caverns',
        value: 'kaldur_option_cavern',
        emoji: { id: '1399477691278692352' },
      },
    ]);

  const row = new ActionRowBuilder().addComponents(select);

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handleKaldurOption(interaction) {
  const choice = interaction.isStringSelectMenu()
    ? interaction.values[0]
    : interaction.customId;

  let text = '';
  let img = null;

  switch (choice) {
    case 'kaldur_option_citadel':
      text =
        'You breach the rusted gates of the **Iron Citadel**. ' +
        'Automated turrets track your every move. Few return from its halls.';
      img = 'https://i.imgur.com/WdZImBi.png';
      break;

    case 'kaldur_option_wastes':
      text =
        'You trek across the **Ice Wastes**, where blizzards swallow sound and shadow.';
      img = 'https://i.imgur.com/WdZImBi.png';
      break;

    case 'kaldur_option_cavern':
      text =
        'You descend into the **Crystal Caverns**, light refracting into endless shards.';
      img = 'https://i.imgur.com/WdZImBi.png';
      break;

    default:
      await interaction.update({ content: '⚠️ Unknown option.', components: [] });
      return;
  }

  const embed = new EmbedBuilder()
    .setDescription(text)
    .setImage(img)
    .setColor(0x2c3e50);

  await interaction.update({ embeds: [embed], components: [] });
}

module.exports = { showKaldurMenu, handleKaldurOption };
