// kaldurPrimeQuest.js  –  2025‑08‑01
// ----------------------------------------------------------------------------
// Exports two functions:
//
//   • showKaldurMenu(interaction)  – entry‑point slash‑command handler
//   • handleKaldurOption(interaction) – component‑interaction router
//
// The file purposefully mirrors the Calisa‑VII module so you can drop it into
// the same command collection without any other code changes.
// ----------------------------------------------------------------------------

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');

// --------------------------- 1.  ENTRY MENU ---------------------------------
async function showKaldurMenu(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x2c3e50)
    .setImage('https://i.imgur.com/RL66SJO.png') // 🔄 swap for your own art
    .setDescription(
      '*You feel the drop long before you see the planet.*\n' +
        'No luxury welcome. No soft gravity. Just turbulence, metal creak, and the smell of burnt ozone.\n\n' +
        'Kaldur Prime smears the viewport in rust‑red clouds and bone‑gray towers. Down there: feral cities half‑eaten by moss and fire, infected cathedrals still chanting without power, and **something that laughs in a voice shaped like teeth**.\n\n' +
        'Your pulse‑link crackles once: **“Hunt begins. No uplinks. No exfil until nightfall.”**\n' +
        'Your kill‑counter starts at **0**.\n\n' +
        '**Where do you begin?**'
    );

  const destSelect = new StringSelectMenuBuilder()
    .setCustomId('kaldur_select_destination')
    .setPlaceholder('Choose your hunting ground')
    .addOptions([
      {
        label: 'Cinderholm Ruins',
        value: 'kaldur_option_ruins',
        description: 'Molten factories; burning hosts that never stop screaming',
        emoji: { id: '1399477691278692352' },
      },
      {
        label: 'Crystal Basilica Rot',
        value: 'kaldur_option_basilica',
        description: 'A drowned temple where the choir bleeds',
        emoji: { id: '1399477691278692352' },
      },
      {
        label: 'Murmuring Fields',
        value: 'kaldur_option_fields',
        description: 'Tall grass, coordinated herds, and something nesting in the silos',
        emoji: { id: '1399477691278692352' },
      },
    ]);

  await interaction.reply({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(destSelect)],
    ephemeral: true,
  });
}

// --------------------------- 2.  ROUTER -------------------------------------
async function handleKaldurOption(interaction) {
  // Accept both StringSelectMenu & Button/Component customIds for extensibility
  const choice = interaction.isStringSelectMenu()
    ? interaction.values[0]
    : interaction.customId;

  let embed, components = [];

  switch (choice) {
    // -------- CINDERHOLM ----------------------------------------------------
    case 'kaldur_option_ruins': {
      embed = new EmbedBuilder()
        .setColor(0x7a1e0e)
        .setImage('https://i.imgur.com/MFr2sLU.png')
        .setTitle('The Smelter God Still Breathes')
        .setDescription(
          'You descend into the sub‑reactor vaults beneath slag towers. Ash falls like snow; pipes rattle with fever. In the dark a rogue geothermal vent **exhales** something aware.\n' +
            'Infected workers crawl along the walls in worship, eyes burned black, mouths chanting.\n\n' +
            '*Your oxygen gauge flickers. Your blade is already hot.*\n\n' +
            '**How do you engage?**'
        );

      const ruinsSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_ruins')
        .setPlaceholder('Choose your approach')
        .addOptions([
          {
            label: 'Charge with Plasma Battle‑Axe',
            description: '“This will be fun!”  (high risk)',
            value: 'kaldur_ruins_axe',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Purge with Theric Rifle',
            description: 'Long‑range extermination (safer)',
            value: 'kaldur_ruins_rifle',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(ruinsSelect)];
      break;
    }

    case 'kaldur_ruins_axe': {
      embed = deathEmbed(
        'You swing too fast. One body latches on, whispering in your mother’s voice while the rest swarm. Metal screams, flesh tears — and you fall into molten silence.'
      );
      break;
    }

    case 'kaldur_ruins_rifle': {
      embed = new EmbedBuilder()
        .setColor(0x343434)
        .setImage('https://i.imgur.com/7hGGC1m.png')
        .setDescription(
          'Ash coats your visor. Heat sears your lungs. Yet the hosts are silent now — every last one. The vent’s glow flares, almost… amused.\n\n' +
            '*Weeks later, your rifle is in a locker, your name scrubbed from the charter. Kaldur burns on, and you never sleep quite right again.*'
        );
      break;
    }

    // -------- CRYSTAL BASILICA ---------------------------------------------
    case 'kaldur_option_basilica': {
      embed = new EmbedBuilder()
        .setColor(0x5b0e7a)
        .setImage('https://i.imgur.com/5ayiWNG.png')
        .setTitle('The Choir That Bleeds')
        .setDescription(
          'Beneath the shattered dome, stained‑glass corpses hang on silver chains and hum your name. Priest‑class infected turn from the altar, scripture carved into rusted faces.\n\n' +
            '**What will you do?**'
        );

      const basilicaSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_basilica1')
        .setPlaceholder('Choose your approach')
        .addOptions([
          {
            label: 'Charge with Plasma Battle‑Axe',
            value: 'kaldur_basilica1_axe',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Snipe with Theric Rifle',
            value: 'kaldur_basilica1_rifle',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(basilicaSelect)];
      break;
    }

    case 'kaldur_basilica1_axe': {
      embed = deathEmbed(
        'You cleave robed bodies in half, but a ruined mouth grips your greave, hissing liturgy in your mother’s voice. The swarm folds over you. Silence.'
      );
      break;
    }

    case 'kaldur_basilica1_rifle': {
      // Success → branch to “Her Blessing Was Hunger”
      embed = new EmbedBuilder()
        .setColor(0x5b0e7a)
        .setImage('https://i.imgur.com/22q99tl.png')
        .setTitle('Her Blessing Was Hunger')
        .setDescription(
          'Spores shimmer in the dark. A bishop‑class host drags a crystal ring through congealed blood while child‑shaped husks spiral in mock prayer.\n' +
            'One child’s face is familiar — you *killed her on another planet*.\n\n' +
            '**Your move?**'
        );

      const hungerSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_basilica2')
        .setPlaceholder('Choose your approach')
        .addOptions([
          {
            label: 'Leap with Battle‑Axe (rage)',
            value: 'kaldur_basilica2_axe',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Steady Rifle Shot (mercy?)',
            value: 'kaldur_basilica2_rifle',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(hungerSelect)];
      break;
    }

    case 'kaldur_basilica2_axe': {
      embed = deathEmbed(
        'You roar into crimson dust. The bishop laughs, belly‑wide, as husks converge. Steel meets bone; your clone tank hisses awake on Thanix‑7.'
      );
      break;
    }

    case 'kaldur_basilica2_rifle': {
      embed = new EmbedBuilder()
        .setColor(0x343434)
        .setImage('https://i.imgur.com/aRrE8l1.png')
        .setDescription(
          'One quiet shot. The bishop drops; the ring rolls into shadow. The children freeze, tilt their heads… and simply *walk away*.\n\n' +
            '*Outside, night falls. Extraction finds you praying with an empty gun.*'
        );
      break;
    }

    // -------- MURMURING FIELDS (stub – build later) ------------------------
    case 'kaldur_option_fields': {
      embed = new EmbedBuilder()
        .setColor(0x264653)
        .setImage('https://i.imgur.com/EYlc12x.png')
        .setTitle('The Murmuring Fields')
        .setDescription(
          'Grass taller than your visor sways, whispering coordinates that don’t exist. Herds move in perfect silence, and the grain silos pulse like hearts.\n\n' +
            '_Dynamic events for this zone coming soon…_'
        );
      break;
    }

    // -----------------------------------------------------------------------
    default:
      await interaction.update({
        content: '⚠️ Unknown option.',
        components: [],
        ephemeral: true,
      });
      return;
  }

  // Send / update message ----------------------------------------------------
  await interaction.update({ embeds: [embed], components });

  // Optional: broadcast deaths to a news channel & tag a role
  if (choice.endsWith('_axe')) {
    await broadcastDeath(interaction, embed.data.title ?? 'Fatal Mistake');
  }
}

// --------------------------- 3.  UTILITIES ----------------------------------
/**
 * Creates a standardized death‑screen embed.
 */
function deathEmbed(causeText) {
  return new EmbedBuilder()
    .setColor(0x000000)
    .setImage('https://i.imgur.com/0JWUtMO.png')
    .setDescription(
      `${causeText}\n\n` +
        'A breath later you wake in **Orbital Station Thanix‑7**, clone tank fluid dripping.\n' +
        '*Your kill‑counter resets. Your nightmares do not.*'
    );
}

/**
 * Push a headline to your #news channel and grant a “Kaldur Prime Casualty” role
 * (mirrors the pattern you used for Calisa VII).
 */
async function broadcastDeath(interaction, headline) {
  const newsChannel = interaction.guild.channels.cache.find(
    c => c.name === process.env.NEWS_CHANNEL_NAME && c.isTextBased()
  );
  if (newsChannel) {
    await newsChannel.send(
      `**KALDUR PRIME: ${headline.toUpperCase()}**\n` +
        'Clone tank reports another fatality. Officials remind hunters: *“You have one credit left. Or none.”*'
    );
  }

  const deathRole = interaction.guild.roles.cache.find(
    r => r.name === 'Kaldur Prime Casualty'
  );
  try {
    if (deathRole && !interaction.member.roles.cache.has(deathRole.id)) {
      await interaction.member.roles.add(deathRole);
    }
  } catch (err) {
    console.warn('⚠️ Could not assign casualty role:', err.message);
  }
}

// --------------------------- 4.  EXPORTS ------------------------------------
module.exports = {
  showKaldurMenu,
  handleKaldurOption,
};
