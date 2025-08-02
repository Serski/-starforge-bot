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
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/g9xi0BE.png')
        .setTitle('The Smelter God Still Breathes')
        .setDescription(
          'You descend into the sub‑reactor vaults beneath slag towers. Ash falls like snow; pipes rattle with fever. In the dark a rogue geothermal vent **exhales** something aware.\n' +
            'Infected workers crawl along the walls in worship, eyes burned black, mouths chanting.\n\n' +
            '*Your oxygen gauge flickers. Your plasma battle-axe is already hot.*\n\n' +
            '**How do you engage?**'
        );

      const ruinsSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_ruins')
        .setPlaceholder('Choose your approach')
        .addOptions([
          {
            label: 'Charge with Plasma Battle‑Axe',
            description: '“This will be fun!”',
            value: 'kaldur_ruins_axe',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Purge with Theric Rifle',
            description: 'Long‑range extermination',
            value: 'kaldur_ruins_rifle',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(ruinsSelect)];
      break;
    }

    case 'kaldur_ruins_axe': {
      embed = deathEmbed(
        'You swing too fast. One body latches on, whispering in your mother’s voice while the rest swarm. Metal screams, flesh tears, and you fall into molten silence.'
      );
      break;
    }

    case 'kaldur_ruins_rifle': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/Of7G7ST.png')
        .setDescription(
          'Ash coats your visor. Heat sears your lungs. Yet the hosts are silent now, every last one. The vent’s glow flares, almost… amused.\n\n' +
            '*Weeks later, your rifle is in a locker, your name scrubbed from the charter. Kaldur burns on, and you never sleep quite right again.*'
        );
      break;
    }

    // -------- CRYSTAL BASILICA ---------------------------------------------
    case 'kaldur_option_basilica': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/BfUTthz.png')
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
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/VrhbVuq.png')
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
            label: 'Leap with Battle‑Axe',
            value: 'kaldur_basilica2_axe',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Steady Shot',
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
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/dC0lN8i.png')
        .setDescription(
          'One quiet shot. The bishop drops; the ring rolls into shadow. The children freeze, tilt their heads… and simply *walk away*.\n\n' +
            '*Outside, night falls. Extraction finds you praying with an empty gun.Kaldur burns on, and you never sleep quite right again.*'
        );
      break;
    }

    // -------- MURMURING FIELDS --------------------------------------------
    case 'kaldur_option_fields': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/76NcqCI.png')
        .setTitle('The Murmuring Fields')
        .setDescription(
          'Whisper‑grass brushes your visor. Every stalk murmurs a different secret. Somewhere out there, herds of silent infected move in perfect formation, guided by something older than bone.\n\n' +
            '**What draws your attention?**'
        );

      const fieldsSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_fields')
        .setPlaceholder('Choose an encounter')
        .addOptions([
          {
            label: 'Stampede in the Whisper-Grass',
            value: 'kaldur_fields_stampede',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'The Silo of the Old One',
            value: 'kaldur_fields_silo',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: "Herd-Mother's Shadow",
            value: 'kaldur_fields_mother',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(fieldsSelect)];
      break;
    }

    case 'kaldur_fields_stampede': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/PjbLJ4b.png')
        .setTitle('Stampede in the Whisper-Grass')
        .setDescription(
          'You feel them before you see them: a wall of desiccated bodies sprinting through the tall grass, heads low, jaws slack, fast enough to shear wheat into dust. Their charge is aimed straight at you.\n\n' +
            '**How do you respond?**'
        );

      const stampedeSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_stampede')
        .setPlaceholder('Choose your move')
        .addOptions([
          {
            label: 'Open fire with Theric rifle',
            value: 'kaldur_stampede_rifle',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Meet them with plasma battle axe',
            value: 'kaldur_stampede_axe',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(stampedeSelect)];
      break;
    }

    case 'kaldur_stampede_rifle': {
      embed = deathEmbed(
        'You strike fast, too fast. Their bodies fall, but one clings to your leg, whispering in your mother\'s voice. The others swarm. Metal screams. Flesh tears. You die in molten silence.'
      );
      break;
    }

    case 'kaldur_stampede_axe': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/g847pbq.png')
        .setTitle('The Rooted Beacon')
        .setDescription(
          'The first arc severs three torsos; ionised sap sprays like fireflies. The herd breaks around you in panic‑harmony, then scatters into the wheat. You stand alone, axe humming, heart louder than the grass.\n\n' +
            'Deep roots form a living antenna, broadcasting low‑frequency commands to every infected in the plain.\n\n' +
            '**How do you silence it?**'
        );

      const beaconSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_beacon')
        .setPlaceholder('Choose your approach')
        .addOptions([
          {
            label: 'Theric rifle',
            value: 'kaldur_beacon_rifle',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Plasma battle axe',
            value: 'kaldur_beacon_axe',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(beaconSelect)];
      break;
    }

    case 'kaldur_beacon_rifle': {
      embed = deathEmbed(
        'You strike fast, too fast. Their bodies fall, but one clings to your leg, whispering in your mother\'s voice. The others swarm. Metal screams. Flesh tears. You die in molten silence.'
      );
      break;
    }

    case 'kaldur_beacon_axe': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/m6P2xVy.png')
        .setDescription(
          'Your swing severs the living antenna; roots shriek in static as the broadcast dies. You limp away, alone with the silence. The Rescue finds you praying with an empty gun.Kaldur burns on, and you never sleep quite right again.'
        );
      break;
    }

    case 'kaldur_fields_silo': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/1fPlX0m.png')
        .setTitle('The Silo of the Old One')
        .setDescription(
          'A rusted grain silo looms above the fields, its seams pulsing faintly as if something inside is breathing. The hatch hangs open, dripping yellow spores.\n\n' +
            '**Your move?**'
        );

      const siloSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_silo')
        .setPlaceholder('Choose your approach')
        .addOptions([
          {
            label: 'Rush the hatch with plasma battle axe',
            value: 'kaldur_silo_axe',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Circle wide and fire Theric rifle',
            value: 'kaldur_silo_rifle',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(siloSelect)];
      break;
    }

    case 'kaldur_silo_axe': {
      embed = deathEmbed(
        'You strike fast, too fast. Their bodies fall, but one clings to your leg, whispering in your mother\'s voice. The others swarm. Metal screams. Flesh tears. You die in molten silence.'
      );
      break;
    }

    case 'kaldur_silo_rifle': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/nx90Hh4.png')
        .setTitle('The Broken Silo')
        .setDescription(
          'Spores erupt, then settle. The ancient thing inside collapses with a sigh that isn\'t air. You advance, find ladders downward, into tunnels scorched long ago.\n\n' +
            'Inside, lanterns glow and voices debate in hushed tones.\n\n' +
            '**How will you enter?**'
        );

      const windmillSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_windmill')
        .setPlaceholder('Choose your approach')
        .addOptions([
          {
            label: 'Theric rifle',
            value: 'kaldur_windmill_rifle',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Plasma battle axe',
            value: 'kaldur_windmill_axe',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(windmillSelect)];
      break;
    }

    case 'kaldur_windmill_rifle': {
      embed = deathEmbed(
        'You strike fast, too fast. Their bodies fall, but one clings to your leg, whispering in your mother\'s voice. The others swarm. Metal screams. Flesh tears. You die in molten silence.'
      );
      break;
    }

    case 'kaldur_windmill_axe': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/GLVKjC4.png')
        .setTitle('Among the Quiet Ones')
        .setDescription(
          'You disarm tripwires, And then you see them, survivors. You are escorted to a hidden camp: scar‑stitched terran survivors who\'ve built a semi‑civilized life amid the wheat. A gold idol — crude, radiant — stands at their centre. The chief\'s spouse watches you with wary curiosity.\n\n' +
            '**What do you do?**'
        );

      const quietSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_quiet')
        .setPlaceholder('Choose')
        .addOptions([
          {
            label: 'Lay down your weapons and stay',
            value: 'kaldur_quiet_stay',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Pillage the camp for the idol',
            value: 'kaldur_quiet_pillage',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(quietSelect)];
      break;
    }

    case 'kaldur_quiet_stay': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/OWcTKwT.png')
        .setDescription(
          'You remain for months. Fields are quiet, nights warmer. The chief\'s other spouse finds you often; whispers become touches. When longing turns dangerous, you request a discreet evac. You leave at dawn, heart racing, lips tasting of wheat & sin.'
        );
      break;
    }

    case 'kaldur_quiet_pillage': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/OWcTKwT.png')
        .setDescription(
          'You kill them while they sleep, axe red in torch‑glow. The idol\'s heavier than expected, but greed lightens your step. Evac ship rises on smoky thrusters; the wheat below burns. Gold gleams in the hold — and something whispers your name from inside it.'
        );

      const pillageRole = interaction.guild.roles.cache.find(
        r => r.name === 'KALDUR PILLAGE'
      );
      try {
        if (pillageRole && !interaction.member.roles.cache.has(pillageRole.id)) {
          await interaction.member.roles.add(pillageRole);
        }
      } catch (err) {
        console.warn('⚠️ Could not assign pillage role:', err.message);
      }
      break;
    }

    case 'kaldur_fields_mother': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/rB4LuxQ.png')
        .setTitle("Herd-Mother's Shadow")
        .setDescription(
          'You crest a low ridge and see her: a towering matriarchal husk bound in strands of grass, directing lesser infected with silent gestures of bone.\n\n' +
            '**Choose your strike.**'
        );

      const motherSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_mother')
        .setPlaceholder('Choose your approach')
        .addOptions([
          {
            label: 'Drive the battle axe up under her jaw',
            value: 'kaldur_mother_axe',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Snipe her core with the Theric rifle',
            value: 'kaldur_mother_rifle',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(motherSelect)];
      break;
    }

    case 'kaldur_mother_axe': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/t8mJbWx.png')
        .setTitle('The Echoing Watch-Fire')
        .setDescription(
          'The blow severs control. Sub‑herds scatter, lost without the signal. You wipe ichor from your visor, heart pounding.\n\n' +
            'An abandoned ranger tower burns with green flame; each ember carries a scream.\n\n' +
            '**How do you proceed?**'
        );

      const watchSelect = new StringSelectMenuBuilder()
        .setCustomId('kaldur_select_watch')
        .setPlaceholder('Choose your approach')
        .addOptions([
          {
            label: 'Cleave the flame with your battle axe',
            value: 'kaldur_watchfire_axe',
            emoji: { id: '1399477691278692352' },
          },
          {
            label: 'Use the zero-g fire foam',
            value: 'kaldur_watchfire_rifle',
            emoji: { id: '1399477691278692352' },
          },
        ]);

      components = [new ActionRowBuilder().addComponents(watchSelect)];
      break;
    }

    case 'kaldur_mother_rifle': {
      embed = deathEmbed(
        'You strike fast, too fast. Their bodies fall, but one clings to your leg, whispering in your mother\'s voice. The others swarm. Metal screams. Flesh tears. You die in molten silence.'
      );
      break;
    }

    case 'kaldur_watchfire_axe': {
      embed = deathEmbed(
        'You strike fast, too fast. Their bodies fall, but one clings to your leg, whispering in your mother\'s voice. The others swarm. Metal screams. Flesh tears. You die in molten silence.'
      );
      break;
    }

    case 'kaldur_watchfire_rifle': {
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/aHsb1rm.png')
        .setDescription(
          'The foam kills the flames; screams fade. You stagger on, throat raw. You left Kaldur soon after. That was enough.'
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
    .setImage('https://i.imgur.com/S9FwJIV.png')
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
        'Another tourist has died on Kaldur Prime after trying to katana-charge a singing zombie priest.”*'
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
