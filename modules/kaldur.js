const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const IMAGE_URL = 'https://i.imgur.com/S9FwJIV.png';

// Kaldur Prime adventure flow utilities

async function showKaldurMenu(interaction) {
  const embed = new EmbedBuilder()
    .setDescription(
      '*Hypertrip resumes on haunted Kaldur Prime.*\n\n' +
        'Shuttles skim the ash dunes and vanish. Three rumors claw for your attention: ' +
        'the **Cinderholm Ruins**, the **Crystal Basilica Rot**, and the **Murmuring Fields**.\n\n' +
        'Where will you begin?'
    )
    .setImage(IMAGE_URL)
    .setColor(0x2c3e50);

  const select = new StringSelectMenuBuilder()
    .setCustomId('kaldur_select_destination')
    .setPlaceholder('Choose your path')
    .addOptions([
      { label: 'Cinderholm Ruins', value: 'kaldur_cinderholm' },
      { label: 'Crystal Basilica Rot', value: 'kaldur_basilica' },
      { label: 'Murmuring Fields', value: 'kaldur_fields' },
      { label: 'Abort Hunt', value: 'kaldur_abort' }
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

  const scenes = {
    kaldur_cinderholm: {
      text:
        'You reach the **Cinderholm Ruins**. The Smelter God wakes in molten chains. Choose:',
      options: [
        { label: 'A: Challenge it', value: 'cinderholm_a' },
        { label: 'B: Offer tribute', value: 'cinderholm_b' },
        { label: 'C: Flee', value: 'cinderholm_c' }
      ]
    },
    cinderholm_a: { text: 'You slay the Smelter God. Victory is yours.' },
    cinderholm_b: {
      text: 'The Smelter God melts you into legend. Hunt failed.'
    },
    cinderholm_c: { text: 'You flee the ruins empty-handed.' },

    kaldur_basilica: {
      text:
        'You enter the **Crystal Basilica Rot**. The Choir That Bleeds hums beneath shattered glass. Choose:',
      options: [
        { label: 'A: Join the refrain', value: 'basilica_a' },
        { label: 'B: Silence them', value: 'basilica_b' },
        { label: 'C: Back away', value: 'basilica_c' }
      ]
    },
    basilica_a: {
      text: 'You join the Choir and survive the night. Success.'
    },
    basilica_b: {
      text: "Their song shreds your mind. Hunt failed."
    },
    basilica_c: { text: 'You retreat from the basilica, shaken.' },

    kaldur_fields: {
      text:
        'You step into the **Murmuring Fields**. A Stampede in the Whisper-Grass gathers on the horizon. Choose:',
      options: [
        { label: 'A: Ride with the beasts', value: 'fields_a' },
        { label: 'B: Hide until they pass', value: 'fields_b' },
        { label: 'C: Turn back', value: 'fields_c' }
      ]
    },
    fields_a: { text: 'You ride the stampede to triumph.' },
    fields_b: {
      text: 'The beasts trample you beneath whispering grass.'
    },
    fields_c: { text: 'Lost in the grass, you abandon the hunt.' },

    kaldur_abort: { text: 'You abandon the hunt and return home.' }
  };

  const scene = scenes[choice];
  if (!scene) {
    await interaction.update({ content: '⚠️ Unknown option.', components: [] });
    return;
  }

  let components = [];
  if (scene.options) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('kaldur_select_' + choice)
      .setPlaceholder('Choose an action')
      .addOptions(scene.options);
    components.push(new ActionRowBuilder().addComponents(menu));
  }

  const text = scene.text;

  const disabled = disableComponents(interaction.message.components);
  const embed = new EmbedBuilder()
    .setDescription(text)
    .setImage(IMAGE_URL)
    .setColor(0x2c3e50);
  await interaction.update({ embeds: [embed], components: disabled.concat(components) });
}

module.exports = { showKaldurMenu, handleKaldurOption };
