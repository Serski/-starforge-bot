const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');


async function showCalisaMenu(interaction) {
  const embed = new EmbedBuilder()
    .setDescription(
      '*Breathe in the nectar-thick air. Let the suns kiss your skin. Forget the war, the politics, the void. Just for a little while.*\n\n' +
        'After months in orbital rust, Calisa VII glows like a hallucination: twin suns, bioluminescent reefs, whispering forests, and gravity set just low enough to make your body feel born again. The shuttle drops you near Coralport \u2014 a coastal node strung between cliffs and lagoons. Your bags are already ashore. Your neural inbox is blissfully silent.\n\n' +
        '**Where will you go?**'
    )
    .setImage('https://i.imgur.com/cMnHiUs.png')
    .setColor(0x2c3e50);

  const select = new StringSelectMenuBuilder()
    .setCustomId('calisa_select_destination')
    .setPlaceholder('Choose your destination')
    .addOptions([
      {
        label: 'Skyglass Hotel',
        value: 'calisa_option_hotel',
        emoji: '🌴',
      },
      {
        label: 'Beach Hut',
        value: 'calisa_option_beach',
        emoji: '🛖',
      },
      {
        label: 'Calisan Mountains',
        value: 'calisa_option_mountain',
        emoji: '🏔',
      },
    ]);

  const row = new ActionRowBuilder().addComponents(select);

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

  if (interaction.message?.components?.length) {
    const row = interaction.message.components[0];
    const disabled = row.components.map(comp => {
      const json = comp.toJSON();
      return json.type === 3
        ? StringSelectMenuBuilder.from(comp).setDisabled(true)
        : ButtonBuilder.from(comp).setDisabled(true);
    });
    const disabledRow = new ActionRowBuilder().addComponents(disabled);
    try {
      await interaction.message.edit({ components: [disabledRow] });
    } catch (err) {
      console.warn('⚠️ Could not disable components:', err.message);
    }
  }
}

async function handleCalisaOption(interaction) {
  const choice = interaction.isStringSelectMenu()
    ? interaction.values[0]
    : interaction.customId;
  let text = '';
  let img = null;

  let components = [];
  switch (choice) {
    case 'calisa_option_hotel':
      text = `You check into the **Skyglass Hotel**, a towering shell of glass and biovine scaffolds overlooking the opal sea. Your room hums with soft ambient synth, a zero-g bath pod awaits, and scent-curtains recall your best memories. After a week on Calisa VII, you return home, sun-warmed, dream-fed, and quietly reborn.`;
      img = 'https://i.imgur.com/hN5Ua6Z.png';
      break;

    case 'calisa_option_beach':
      text = `You head to a **private beach hut** — wood and silk, open to the breeze. The sand glows faintly. A kelp-skinned host offers fermented fruit that tastes like childhood and rebellion. After a week on Calisa VII, you return home, sun-warmed, dream-fed, and quietly reborn.`;
      img = 'https://i.imgur.com/qIxbQ7O.png';
      break;

    case 'calisa_option_mountain':
      text = `You hike into the **Calisan mountains**, draped in shifting mist and alien birdsong. A gravity-adaptive cloak lets you float over gaps. Locals say the trails change when unobserved.`;
      img = 'https://i.imgur.com/8r0EY2x.png'; // updated working image

      const mountainSelect = new StringSelectMenuBuilder()
        .setCustomId('calisa_select_mountain')
        .setPlaceholder('Choose an activity')
        .addOptions([
          {
            label: 'Chill in Mountain Hut',
            value: 'calisa_mtn_hut',
            emoji: '🛖',
          },
          {
            label: 'Climb to the Mountain Top',
            value: 'calisa_mtn_climb',
            emoji: '🧗',
          },
          {
            label: 'Explore the Forest',
            value: 'calisa_mtn_forest',
            emoji: '🌲',
          },
          {
            label: 'End Vacation',
            value: 'calisa_option_end',
            emoji: '🔚',
          },
        ]);

      components = [new ActionRowBuilder().addComponents(mountainSelect)];
      break;

    case 'calisa_mtn_hut':
      text = `You settle into a **mountain hut**, heated with volcanic vents and lit by ancient fiber-lanterns. A local elder tells stories of when the stars were closer. Outside, mist curls like memory.`;
      img = 'https://i.imgur.com/KDrgMG0.png';
      break;

    case 'calisa_mtn_climb':
      text = `You climb the final ridge, air crisp and light. At the **mountaintop**, the sky unfolds like a scroll. Time pauses. You feel your name dissolving into something older.`;
      img = 'https://i.imgur.com/latmlhe.png';
      break;

    case 'calisa_mtn_forest':
      text =
        'The light bends strangely between the branches. A figure finds you: elfin, tall, humming in chords your ears weren\'t built to parse. It watches you with mirrored eyes.\n' +
        'After days you earn its trust. It leans close and whispers:\n' +
        '"None of this is real. Not Calisa. Not the suns. Not even the war. We are fragments in a Discord server… echoing choices someone else thinks they made."\n' +
        'You laugh. Or cry. Or both.';
      img = 'https://i.imgur.com/C9oTdId.png';
      break;

    case 'calisa_option_end':
      text = `You close your eyes and whisper “end vacation.” A shuttle lifts you into orbit. The illusion fades — but something soft clings to your memory. Calisa never really leaves.`;
      img = 'https://i.imgur.com/pjwUdy5.jpeg';
      break;

    default:
      await interaction.update({ content: '⚠️ Unknown option.', components: [] });
      return;
  }

  const embed = new EmbedBuilder()
    .setDescription(text)
    .setImage(img)
    .setColor(0x2c3e50);

  await interaction.update({ embeds: [embed], components });

  if (choice === 'calisa_mtn_forest') {
    const newsChannel = interaction.guild.channels.cache.find(
      c => c.name === process.env.NEWS_CHANNEL_NAME && c.isTextBased()
    );
    if (newsChannel) {
      await newsChannel.send(
        '**CALISA VII: GUEST CLAIMS REALITY IS A DISCORD SERVER**\n' +
          'Tourist returns from Calisa VII raving about an "elf-coded entity" who revealed:\n' +
          '"None of this is real. We\'re fragments in a Discord server."\n' +
          'Local guides blame hallucinogenic pollen. Vacation officials offer memory wipes "for those troubled by metaphysical recursion."\n' +
          '#ForestGlitch #DiscordMythos #SimulationLeak'
      );
    }

    const mysteryRole = interaction.guild.roles.cache.find(
      r => r.name === 'CALISA VII Mystery'
    );
    try {
      if (mysteryRole && !interaction.member.roles.cache.has(mysteryRole.id)) {
        await interaction.member.roles.add(mysteryRole);
      }
    } catch (err) {
      console.warn('⚠️ Could not assign mystery role:', err.message);
    }

    await interaction.followUp({
      content:
        "You're home now. But the forest's whisper won't leave.\nThe elf. The Discord. The fracture in the sky.\n\nYou'll be watching. Just in case it wasn't a dream. Calisa VII Mystery role granted!",
      ephemeral: true,
    });
  }

}

module.exports = {
  showCalisaMenu,
  handleCalisaOption,
};
