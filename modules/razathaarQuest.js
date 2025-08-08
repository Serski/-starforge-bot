// razathaarQuest.js 
// ----------------------------------------------------------------------------
// RAZATHAAR: THE 72‑HOUR WINDOW
//
// Deterministic, lore-first quest. No stats, no RNG.
// Success requires assembling three kinds of knowledge:
//   C = Contact  (CD=Dock, CN=Nomad, CS=Scribe [reserved])
//   R = Corridor (RB=BlueHour, RC=Canyon, RS=SweepSchedule)
//   V = Cover    (GLC=GhostLadingCodes, CR=RegistryHole, CL=LatticeToken)
//
// We persist "flags" inside customIds/values like: "rz_d2_choice|CN|RB"
// On Night 3 we gate the secret auction if flags contain one C, one R, one V.
//
// Exports:
//   showRazathaarMenu(interaction)
//   handleRazathaarOption(interaction)
//
// Requires discord.js v14+
// ----------------------------------------------------------------------------
'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

// ---------- utilities: simple flag packing / parsing ------------------------
/** @param {string} fromId */
function parseFlags(fromId = '') {
  if (typeof fromId !== 'string') return [];
  const parts = fromId.split('|').slice(1); // ignore leading route token
  // dedupe + drop empties
  return Array.from(new Set(parts.filter(Boolean)));
}

/** Compose a customId/value with merged flags, avoiding a trailing '|' */
function withFlags(baseId, flags = [], ...newOnes) {
  const set = new Set([...(flags || []), ...newOnes.filter(Boolean)]);
  const joined = Array.from(set).join('|');
  return `${baseId}${joined ? `|${joined}` : ''}`;
}

/** Category presence check using explicit whitelists to avoid collisions */
function haveCategory(flags, prefix) {
  const contacts = new Set(['CD', 'CN', 'CS']);      // Contact*
  const corridors = new Set(['RB', 'RC', 'RS']);     // Corridor*
  const covers = new Set(['GLC', 'CR', 'CL']);       // Cover (V)*

  if (prefix === 'C') return flags.some(f => contacts.has(f));
  if (prefix === 'R') return flags.some(f => corridors.has(f));
  if (prefix === 'V') return flags.some(f => covers.has(f));
  return false;
}

function knowledgeBadge(flags) {
  const c = haveCategory(flags, 'C') ? '✅ Contact' : '⬜ Contact';
  const r = haveCategory(flags, 'R') ? '✅ Corridor' : '⬜ Corridor';
  const v = haveCategory(flags, 'V') ? '✅ Cover' : '⬜ Cover';
  return `${c}  •  ${r}  •  ${v}`;
}

// ---------- 1) Entry --------------------------------------------------------
/**
 * Opens Day 1 menu.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function showRazathaarMenu(interaction) {
  const poster = 'https://i.imgur.com/M4dWXkD.png'; // ⬅️ swap to your Razathaar poster

  const embed = new EmbedBuilder()
    .setColor(0x2c3e50)
    .setImage(poster)
    .setTitle('Razathaar — 72‑Hour Window')
    .setDescription(
      'Kawazei Systems routes you to **Port Raz** for a light‑freight pickup. ' +
      'On approach, tower control pings a **72‑hour ground stop**: sharq‑glass storm inbound and a surprise **customs audit**. ' +
      'Your cargo sits in **Warehouse Q‑13**. Your berth clock is ticking.\n\n' +
      '**Where do you spend Day One?**'
    )
    .setFooter({ text: 'Day 1 • What you know: ⬜ Contact • ⬜ Corridor • ⬜ Cover' });

  const d1 = new StringSelectMenuBuilder()
    .setCustomId('rz_d1_select')
    .setPlaceholder('Choose a Day One lead')
    .addOptions(
      {
        label: 'Warehouse Q‑13 (Kawazei)',
        description: 'Meet foreman, learn how their seals work',
        value: 'rz_d1_wh',
      },
      {
        label: 'Shroud Harbor (Under‑Port)',
        description: 'Find Dockmaster Rell',
        value: 'rz_d1_dock',
      },
      {
        label: 'Wind‑singers’ Camp (Desert Rim)',
        description: 'Parley with the Iktari clan',
        value: 'rz_d1_nomad',
      }
    );

  await interaction.reply({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(d1)],
    ephemeral: true,
  });
}

// ---------- 2) Router -------------------------------------------------------
/**
 * Routes select/button interactions for the quest.
 * @param {import('discord.js').AnySelectMenuInteraction | import('discord.js').ButtonInteraction} interaction
 */
async function handleRazathaarOption(interaction) {
  const isSelect = interaction.isStringSelectMenu();
  const choice = isSelect ? interaction.values[0] : interaction.customId;

  /** @type {EmbedBuilder} */
  let embed;
  /** @type {import('discord.js').ActionRowBuilder[]} */
  let components = [];
  /** @type {{content: string, ephemeral?: boolean} | undefined} */
  let followUp;

  const footer = (dayLabel, flags) => `${dayLabel} • What you know: ${knowledgeBadge(flags)}`;

  switch (true) {
    // ---------------- DAY 1 ----------------
    case choice === 'rz_d1_wh': {
      const flags = []; // starting branch
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/mpGUyws.png') // ⬅️ art placeholder
        .setTitle('Warehouse Q‑13')
        .setDescription(
          'Forklifts weave between pallet stacks. The foreman, **Atta Reiko**, complains about audits: "Weigh‑seals spool fine until someone decides to *notice*." ' +
          'She teaches you how **Ghost Lading Codes** can mask two extra pallets—if your handler is brave.\n\n' +
          '**Day Two?**'
        )
        .setFooter({ text: footer('Day 2', ['GLC']) });

      components = [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(withFlags('rz_d2_select', ['GLC']))
            .setPlaceholder('Choose Day Two')
            .addOptions(
              { label: 'Stormglass Flats', value: withFlags('rz_d2_flats', ['GLC']) },
              { label: 'Crown Windfarm (Audit Drones)', value: withFlags('rz_d2_wind', ['GLC']) },
              { label: 'Under‑Port: Nine Wells', value: withFlags('rz_d2_wells', ['GLC']) }
            )
        ),
      ];
      break;
    }

    case choice === 'rz_d1_dock': {
      const flags = ['CD']; // Contact: Dock
      embed = new EmbedBuilder()
        .setColor(0xd35400)
        .setImage('https://i.imgur.com/2jjYdI4.png')
        .setTitle('Shroud Harbor')
        .setDescription(
          'Dockmaster **Rell** thumbs a chipped comm: "I make ships *leave* when they shouldn’t. But not for strangers." ' +
          'A quiet bribe and shared tea earn a number you can pulse once.\n\n' +
          '**Day Two?**'
        )
        .setFooter({ text: footer('Day 2', flags) });

      components = [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(withFlags('rz_d2_select', flags))
            .setPlaceholder('Choose Day Two')
            .addOptions(
              { label: 'Stormglass Flats', value: withFlags('rz_d2_flats', flags) },
              { label: 'Crown Windfarm (Audit Drones)', value: withFlags('rz_d2_wind', flags) },
              { label: 'Wind‑singers’ Camp', value: withFlags('rz_d2_nomad', flags) }
            )
        ),
      ];
      break;
    }

    case choice === 'rz_d1_nomad': {
      const flags = ['CN']; // Contact: Nomad
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/WKuuxhZ.png')
        .setTitle('Wind‑singers’ Camp')
        .setDescription(
          'The Iktari matriarch listens from behind veils. "Our caravans keep their own counsel," she says, yet you trade names with her nephew. ' +
          'They speak of a *Blue Hour* when the storm blinds machines.\n\n' +
          '**Day Two?**'
        )
        .setFooter({ text: footer('Day 2', flags) });

      components = [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(withFlags('rz_d2_select', flags))
            .setPlaceholder('Choose Day Two')
            .addOptions(
              { label: 'Stormglass Flats', value: withFlags('rz_d2_flats', flags) },
              { label: 'Umber Gate Canyon', value: withFlags('rz_d2_canyon', flags) },
              { label: 'Under‑Port: Nine Wells', value: withFlags('rz_d2_wells', flags) }
            )
        ),
      ];
      break;
    }

    // ---------------- DAY 2 ----------------
    case /^rz_d2_flats/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('RB') ? flags : [...flags, 'RB']; // Corridor: Blue Hour
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/5CN4eAZ.png')
        .setTitle('Stormglass Flats')
        .setDescription(
          'Silica organs hum as wind charges the desert. Sensors spike, then wash blank. ' +
          '**Blue Hour**—twenty‑three minutes when spectrometers see only weather.\n\n' +
          '**Day Three?**'
        )
        .setFooter({ text: footer('Day 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(withFlags('rz_d3_select', newFlags))
            .setPlaceholder('Choose Day Three')
            .addOptions(
              { label: 'Shroud Harbor (call Rell)', value: withFlags('rz_d3_dock', newFlags) },
              { label: 'Nine Wells Data‑Cistern', value: withFlags('rz_d3_wells', newFlags) },
              { label: 'Kawazei Warehouse (check seals)', value: withFlags('rz_d3_wh', newFlags) }
            )
        ),
      ];
      break;
    }

    case /^rz_d2_wind/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('RS') ? flags : [...flags, 'RS']; // Corridor: Sweep Schedule
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/FzE0i4q.png')
        .setTitle('Crown Windfarm — Audit Drones')
        .setDescription(
          'Technicians bicker over scan cones. You glimpse the **customs sweep schedule**; minute‑accurate, habit‑ridden. ' +
          'You could time a walk between their arcs.\n\n' +
          '**Day Three?**'
        )
        .setFooter({ text: footer('Day 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(withFlags('rz_d3_select', newFlags))
            .setPlaceholder('Choose Day Three')
            .addOptions(
              { label: 'Under‑Port: Nine Wells', value: withFlags('rz_d3_wells', newFlags) },
              { label: 'Wind‑singers’ Camp', value: withFlags('rz_d3_nomad', newFlags) },
              { label: 'Shroud Harbor (call Rell)', value: withFlags('rz_d3_dock', newFlags) }
            )
        ),
      ];
      break;
    }

    case /^rz_d2_wells/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('CR') ? flags : [...flags, 'CR']; // Cover: Registry Hole
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/kAu7V1G.png')
        .setTitle('Nine Wells Data‑Cistern')
        .setDescription(
          'In a humidity‑sealed vault, a clerk sells you an old exploit: a **registry hole** that eats two pallets if the manifest wording is poetic enough.\n\n' +
          '**Day Three?**'
        )
        .setFooter({ text: footer('Day 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(withFlags('rz_d3_select', newFlags))
            .setPlaceholder('Choose Day Three')
            .addOptions(
              { label: 'Shroud Harbor (call Rell)', value: withFlags('rz_d3_dock', newFlags) },
              { label: 'Umber Gate Canyon', value: withFlags('rz_d3_canyon', newFlags) },
              { label: 'Kawazei Warehouse', value: withFlags('rz_d3_wh', newFlags) }
            )
        ),
      ];
      break;
    }

    case /^rz_d2_nomad/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('CN') ? flags : [...flags, 'CN']; // ensure Contact: Nomad
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/JIPWmc2.png')
        .setTitle('Wind‑singers’ Camp')
        .setDescription(
          'Songs ripple the dunes. "Storm blinds the eye that thinks itself a sun," the matriarch says. ' +
          'They sketch a safe arc around the port bluffs.\n\n' +
          '**Day Three?**'
        )
        .setFooter({ text: footer('Day 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(withFlags('rz_d3_select', newFlags))
            .setPlaceholder('Choose Day Three')
            .addOptions(
              { label: 'Umber Gate Canyon', value: withFlags('rz_d3_canyon', newFlags) },
              { label: 'Nine Wells Data‑Cistern', value: withFlags('rz_d3_wells', newFlags) },
              { label: 'Shroud Harbor (call Rell)', value: withFlags('rz_d3_dock', newFlags) }
            )
        ),
      ];
      break;
    }

    case /^rz_d2_canyon/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('RC') ? flags : [...flags, 'RC']; // Corridor: Canyon
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/oK98XFe.png')
        .setTitle('Umber Gate Canyon')
        .setDescription(
          'A switchback chokes sound and heat. With the **lattice token**, caravans bow you through; without it, you wait and count bones in the rock.\n\n' +
          '**Day Three?**'
        )
        .setFooter({ text: footer('Day 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(withFlags('rz_d3_select', newFlags))
            .setPlaceholder('Choose Day Three')
            .addOptions(
              { label: 'Shroud Harbor (call Rell)', value: withFlags('rz_d3_dock', newFlags) },
              { label: 'Kawazei Warehouse', value: withFlags('rz_d3_wh', newFlags) },
              { label: 'Nine Wells Data‑Cistern', value: withFlags('rz_d3_wells', newFlags) }
            )
        ),
      ];
      break;
    }

    // ---------------- DAY 3 ----------------
    case /^rz_d3_dock/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('CD') ? flags : [...flags, 'CD']; // ensure Contact: Dock
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/Ht1mzsX.png')
        .setTitle('Shroud Harbor — Rell')
        .setDescription(
          'Rell answers on the second ping. "If you’ve got a window and a cover, I’ve got a berth. Meet me at night." ' +
          'He mutters a word: **Sere**.\n\n' +
          '**Proceed to Night 3?**'
        )
        .setFooter({ text: footer('Night 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(withFlags('rz_night', newFlags))
            .setLabel('Go to Night 3')
            .setStyle(ButtonStyle.Primary)
        ),
      ];
      break;
    }

    case /^rz_d3_wells/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('CR') ? flags : [...flags, 'CR']; // Cover: Registry Hole
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/ninewells.png')
        .setTitle('Nine Wells — Second Visit')
        .setDescription(
          'You refine the wording for the manifest poem. The clerk grins. "Two pallets fall between commas." ' +
          'If you have a handler and a route, you might just pull it off.\n\n' +
          '**Proceed to Night 3?**'
        )
        .setFooter({ text: footer('Night 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(withFlags('rz_night', newFlags))
            .setLabel('Go to Night 3')
            .setStyle(ButtonStyle.Primary)
        ),
      ];
      break;
    }

    case /^rz_d3_wh/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('GLC') ? flags : [...flags, 'GLC']; // Cover: Ghost Lading Codes
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/nhapW2w.png')
        .setTitle('Warehouse Q‑13 — Seals & Spools')
        .setDescription(
          'Foreman Atta rolls a fresh spool. "If this bites me, it never happened." ' +
          'You now hold **ghost lading codes** to bury two pallets.\n\n' +
          '**Proceed to Night 3?**'
        )
        .setFooter({ text: footer('Night 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(withFlags('rz_night', newFlags))
            .setLabel('Go to Night 3')
            .setStyle(ButtonStyle.Primary)
        ),
      ];
      break;
    }

    case /^rz_d3_nomad/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('CN') ? flags : [...flags, 'CN']; // Contact: Nomad
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/nomadCamp.png')
        .setTitle('Wind‑singers — Second Counsel')
        .setDescription(
          '"Blue Hour comes soon," they murmur. "If you must sin, sin quietly." ' +
          'Your lattice token is rewoven with a **storm‑knot** that marks allies in the dunes.\n\n' +
          '**Proceed to Night 3?**'
        )
        .setFooter({ text: footer('Night 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(withFlags('rz_night', newFlags))
            .setLabel('Go to Night 3')
            .setStyle(ButtonStyle.Primary)
        ),
      ];
      break;
    }

    case /^rz_d3_canyon/.test(choice): {
      const flags = parseFlags(choice);
      const newFlags = flags.includes('RC') ? flags : [...flags, 'RC']; // Corridor: Canyon
      embed = new EmbedBuilder()
        .setColor(0x2c3e50)
        .setImage('https://i.imgur.com/Z7sUhtX.png')
        .setTitle('Umber Gate — Second Pass')
        .setDescription(
          'You chalk waymarks that only glow under ionized dust. The **canyon route** now lives in your bones.\n\n' +
          '**Proceed to Night 3?**'
        )
        .setFooter({ text: footer('Night 3', newFlags) });

      components = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(withFlags('rz_night', newFlags))
            .setLabel('Go to Night 3')
            .setStyle(ButtonStyle.Primary)
        ),
      ];
      break;
    }

    // ---------------- NIGHT 3 (resolution) ----------------
    case /^rz_night/.test(choice): {
      const flags = parseFlags(choice);
      const hasWin = haveCategory(flags, 'C') && haveCategory(flags, 'R') && haveCategory(flags, 'V');

      if (hasWin) {
        embed = new EmbedBuilder()
          .setColor(0x2c3e50)
          .setImage('https://i.imgur.com/bq1XeSq.png')
          .setTitle('The Sere Auction')
          .setDescription(
            'Blue Hour gathers. In a dry cistern lit by stormlight, a half‑circle of handlers trades **mirage‑glass** lots with poetry for passwords. ' +
            'Your **contact** nods; your **cover** holds; your **corridor** opens. A contract slides under your palm: ' +
            '**two pallets per ascent, every week**, no questions.\n\n' +
            '* Access to mirage‑glass*'
          )
          .setFooter({ text: footer('Aftermath', flags) });

        // grant RAZATHAAR SHADOW role
        followUp = { content: 'Role granted: **RAZATHAAR SHADOW**. Access to mirage‑glass.', ephemeral: true };
        await grantRole(interaction, 'RAZATHAAR SHADOW');
      } else {
        // choose a tailored fail-forward ending by missing category
        const need = [
          !haveCategory(flags, 'C') ? 'a **Contact**' : null,
          !haveCategory(flags, 'R') ? 'a **Corridor**' : null,
          !haveCategory(flags, 'V') ? 'a **Cover**' : null,
        ].filter(Boolean).join(', ');

        embed = new EmbedBuilder()
          .setColor(0x2c3e50)
          .setImage('https://i.imgur.com/ImaJa9N.png')
          .setTitle('Audit Hall, Dawn')
          .setDescription(
            `You arrive at the rendezvous missing ${need}. The room cools. A handler snuffs the lantern. ` +
            'By noon you sign the *legal* manifest, paid in hazard bonus and silence. Kawazei smiles too widely.\n\n' +
            '*You leave clean. The desert remembers more than your ledger does.*'
          )
          .setFooter({ text: footer('Aftermath', flags) });

        // optional flavor role on miss
        await maybeGrant(interaction, 'Kawazei Good Standing');
      }
      components = [];
      break;
    }

    default: {
      embed = new EmbedBuilder().setColor(0x000000).setDescription('⚠️ Unknown option.');
      components = [];
      break;
    }
  }

  // Edit the ephemeral message in place for selects/buttons
  if (interaction.isStringSelectMenu() || interaction.isButton()) {
    await interaction.update({ embeds: [embed], components });
  }

  if (followUp) {
    await interaction.followUp(followUp);
  }
}

// ---------- role helpers ----------------------------------------------------
async function grantRole(interaction, roleName) {
  try {
    if (!interaction.inGuild()) return;
    const role = interaction.guild.roles.cache.find(r => r.name === roleName);
    const member = interaction.member;
    if (!role || !member || member.roles.cache.has(role.id)) return;
    await member.roles.add(role);
  } catch (e) {
    console.warn('Could not assign role:', roleName, e?.message);
  }
}

async function maybeGrant(interaction, roleName) {
  try {
    if (!interaction.inGuild()) return;
    const role = interaction.guild.roles.cache.find(r => r.name === roleName);
    const member = interaction.member;
    if (!role || !member || member.roles.cache.has(role.id)) return;
    await member.roles.add(role);
  } catch { /* no-op */ }
}

// ---------- exports ---------------------------------------------------------
module.exports = {
  showRazathaarMenu,
  handleRazathaarOption,
};
