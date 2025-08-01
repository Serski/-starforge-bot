const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

// Kaldur Prime adventure flow utilities

async function showKaldurMenu(interaction) {
  const embed = new EmbedBuilder()
    .setDescription(
      '*Hypertrip awaits on Kaldur Prime.*\n\nChoose your destiny.'
    )
    .setImage('https://i.imgur.com/WdZImBi.png')
    .setColor(0x2c3e50);

  const select = new StringSelectMenuBuilder()
    .setCustomId('kaldur_select_destination')
    .setPlaceholder('Choose your path')
    .addOptions([
      { label: 'Base Camp', value: 'kaldur_option_camp' },
      { label: 'Hunting Grounds', value: 'kaldur_option_hunt' },
      { label: 'Abort Hunt', value: 'kaldur_option_end' }
    ]);

  const row = new ActionRowBuilder().addComponents(select);
  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

function disableComponents(rows) {
  return rows.map(r => {
    const row = ActionRowBuilder.from(r);
    row.components = row.components.map(c => {
      if (typeof c.setDisabled === 'function') c.setDisabled(true);
      return c;
    });
    return row;
  });
}

async function handleKaldurOption(interaction) {
  const choice = interaction.isStringSelectMenu()
    ? interaction.values[0]
    : interaction.customId;
  let text = '';
  let components = [];

  switch (choice) {
    case 'kaldur_option_camp':
      text = 'You set up a base camp amid the cold spires of Kaldur Prime.';
      break;
    case 'kaldur_option_hunt':
      text = 'The hunt begins in the obsidian wilds.';
      const huntSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_hunt')
        .setPlaceholder('Next step')
        .addOptions([
          { label: 'Track the Beast', value: 'kaldur_hunt_track' },
          { label: 'Return to Camp', value: 'kaldur_option_end' }
        ]);
      components.push(new ActionRowBuilder().addComponents(huntSelect));
      break;
    case 'kaldur_hunt_track':
      text = 'You stalk the legendary beast through frozen canyons.';
      break;
    case 'kaldur_option_end':
      text = 'You abandon the hunt and return home with tales of near glory.';
      break;
    default:
      await interaction.update({ content: '⚠️ Unknown option.', components: [] });
      return;
  }

  const disabled = disableComponents(interaction.message.components);
  const embed = new EmbedBuilder().setDescription(text).setColor(0x2c3e50);
  await interaction.update({ embeds: [embed], components: disabled.concat(components) });

  if (/murmuring fields.*pillage/i.test(text)) {
    let pillageRole = interaction.guild.roles.cache.find(
      r => r.name === 'KALDUR PILLAGE'
    );
    if (!pillageRole) {
      try {
        pillageRole = await interaction.guild.roles.create({ name: 'KALDUR PILLAGE' });
      } catch (err) {
        console.warn('⚠️ Could not create pillage role:', err.message);
      }
    }

    try {
      if (pillageRole && !interaction.member.roles.cache.has(pillageRole.id)) {
        await interaction.member.roles.add(pillageRole);
      }
    } catch (err) {
      console.warn('⚠️ Could not assign pillage role:', err.message);
    }

    await interaction.followUp({
      content:
        'Smoke rises from the Murmuring Fields. Your spoils are secure.\n\nKaldur Pillage role granted!',
      ephemeral: true,
    });
  }
}

module.exports = { showKaldurMenu, handleKaldurOption };
