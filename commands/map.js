const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('map')
    .setDescription('Access the NEXI galactic map.'),

  async execute(interaction) {
    const mapUrl = 'https://i.imgur.com/MROdtQX.jpeg';
    const DYNE_RIFT_IMAGE_URL = 'https://i.imgur.com/O7I3Gnz.jpeg';
    const NULLWEK_IMAGE_URL = 'https://i.imgur.com/OvKSoNl.jpeg';
    const ASHEN_VERGE_IMAGE_URL = 'https://i.imgur.com/hyMsa2M.jpeg';
    const VERYTHRA_IMAGE_URL = 'https://i.imgur.com/fkjNogD.png';
    const VEIL_IMAGE_URL = 'https://i.imgur.com/jOSJ3Qr.jpeg';
    const KORRATH_IMAGE_URL = 'https://i.imgur.com/9WWwyrk.png';
    const THALOROS_IMAGE_URL = 'https://i.imgur.com/RSRPJUl.png';

    // Builders
    const buildMainRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('cat_sectors')
          .setLabel('Sectors')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cat_cosmos')
          .setLabel('Cosmos')
          .setStyle(ButtonStyle.Primary)
      );

    const buildSectorSelect = () =>
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('sector_select')
          .addOptions(
            { label: 'The Nullwek Sector (Yamato)', value: 'nullwek' },
            { label: 'Ashen Verge Sector (Nova)', value: 'ashen' },
            { label: 'Dyne Rift Sector (Aegir)', value: 'dyne' },
            { label: 'Verythra Sector (Trade Fed)', value: 'verythra' },
            { label: 'Korrath Sector (Crimson)', value: 'korrath' },
            { label: 'Thaloros Reach Sector (Eagle)', value: 'thaloros' }
          )
      );

    const buildNullwekSelect = () =>
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('nullwek_select')
          .addOptions(
            { label: 'Thalyron', value: 'thalyron' },
            { label: 'Icarra', value: 'icarra' },
            { label: 'Drosven', value: 'drosven' },
            { label: 'Pyralis', value: 'pyralis' }
          )
      );

    const buildAshenSelect = () =>
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ashen_select')
          .addOptions(
            { label: 'Serothis', value: 'serothis' },
            { label: 'Eryndor', value: 'eryndor' },
            { label: 'Caluth', value: 'caluth' },
            { label: 'Kaivorn', value: 'kaivorn' }
          )
      );

    const buildDyneSelect = () =>
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('dyne_select')
          .addOptions(
            { label: 'Solara-Ys', value: 'solara' },
            { label: 'Veyra-Null', value: 'veyra' },
            { label: 'Orphean Verge', value: 'orphean' },
            { label: 'Aelyth Prime', value: 'aelyth' }
          )
      );

    const buildVerythraSelect = () =>
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('verythra_select')
          .addOptions(
            { label: 'Veil', value: 'veil' },
            { label: 'Korneth', value: 'korneth' },
            { label: 'Shathros', value: 'shathros' }
          )
      );

    const buildKorrathSelect = () =>
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('korrath_select')
          .addOptions(
            { label: 'Drelith', value: 'drelith' },
            { label: 'Ormun', value: 'ormun' },
            { label: 'Vayth', value: 'vayth' }
          )
      );

    const buildThalorosSelect = () =>
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('thaloros_select')
          .addOptions(
            { label: 'Akrion', value: 'akrion' },
            { label: 'Ceythros', value: 'ceythros' },
            { label: 'Kentauros', value: 'kentauros' }
          )
      );

    const backMainRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('back_main')
        .setLabel('← Back')
        .setStyle(ButtonStyle.Secondary)
    );

    const backSectorsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('back_sectors')
        .setLabel('← Back')
        .setStyle(ButtonStyle.Secondary)
    );

    const backSectorRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('back_sector')
        .setLabel('← Back')
        .setStyle(ButtonStyle.Secondary)
    );

    // Embeds
    const mainEmbed = () =>
      new EmbedBuilder().setTitle('NEXI GALACTIC MAP').setImage(mapUrl);

    const sectorsEmbed = () =>
      new EmbedBuilder()
        .setTitle('SECTORS')
        .setDescription('Select a sector.')
        .setImage(mapUrl);

    const dyneEmbed = () =>
      new EmbedBuilder()
        .setTitle('DYNE RIFT SECTOR')
        .setDescription('Select a system.')
        .setImage(DYNE_RIFT_IMAGE_URL);

    const nullwekEmbed = () =>
      new EmbedBuilder()
        .setTitle('THE NULLWEK SECTOR')
        .setDescription('Select a system.')
        .setImage(NULLWEK_IMAGE_URL);

    const ashenEmbed = () =>
      new EmbedBuilder()
        .setTitle('ASHEN VERGE SECTOR')
        .setDescription('Select a system.')
        .setImage(ASHEN_VERGE_IMAGE_URL);

    const verythraEmbed = () =>
      new EmbedBuilder()
        .setTitle('VERYTHRA SECTOR')
        .setDescription('Select a system.')
        .setImage(VERYTHRA_IMAGE_URL);

    const korrathEmbed = () =>
      new EmbedBuilder()
        .setTitle('KORRATH SECTOR')
        .setDescription('Select a system.')
        .setImage(KORRATH_IMAGE_URL);

    const thalorosEmbed = () =>
      new EmbedBuilder()
        .setTitle('THALOROS REACH SECTOR')
        .setDescription('Select a system.')
        .setImage(THALOROS_IMAGE_URL);

    // Helpers
    const showMain = async i => {
      await i.update({ embeds: [mainEmbed()], components: [buildMainRow()] });
    };

    const showSectors = async i => {
      await i.update({
        embeds: [sectorsEmbed()],
        components: [buildSectorSelect(), backMainRow]
      });
    };

    const showSector = async (i, sector) => {
      const builders = {
        nullwek: [nullwekEmbed, buildNullwekSelect],
        ashen: [ashenEmbed, buildAshenSelect],
        dyne: [dyneEmbed, buildDyneSelect],
        verythra: [verythraEmbed, buildVerythraSelect],
        korrath: [korrathEmbed, buildKorrathSelect],
        thaloros: [thalorosEmbed, buildThalorosSelect]
      };
      const [embedFn, selectFn] = builders[sector];
      await i.update({
        embeds: [embedFn()],
        components: [selectFn(), backSectorsRow]
      });
    };

    // Init
    const msg = await interaction.reply({
      embeds: [mainEmbed()],
      components: [buildMainRow()],
      fetchReply: true,
      ephemeral: true
    });

    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 3 * 60 * 1000
    });

    // Handler
    collector.on('collect', async i => {
      const id = i.customId;

      if (id === 'cat_sectors') {
        await showSectors(i);
        return;
      }

      if (id === 'cat_cosmos') {
        await i.update({
          embeds: [new EmbedBuilder().setTitle('Cosmos').setImage(mapUrl)],
          components: [backMainRow]
        });
        return;
      }

      if (id === 'sector_select') {
        const sector = i.values[0];
        await showSector(i, sector);
        return;
      }

      if (
        id === 'nullwek_select' ||
        id === 'ashen_select' ||
        id === 'dyne_select' ||
        id === 'verythra_select' ||
        id === 'korrath_select' ||
        id === 'thaloros_select'
      ) {
        const value = i.values[0];

        const data = {
          nullwek_select: {
            names: {
              thalyron: 'Thalyron',
              icarra: 'Icarra',
              drosven: 'Drosven',
              pyralis: 'Pyralis'
            },
            descriptions: {
              thalyron: 'Thalyron shimmers with aurora-lit skies and silent ruins.',
              icarra: 'Icarra rings with crystalline dust and forgotten towers.',
              drosven: 'Drosven is a storm-swept world of rust deserts.',
              pyralis: 'Pyralis burns with volcanic fury beneath ember clouds.'
            },
            images: {
              thalyron: 'https://i.imgur.com/4K9x0TE.jpeg',
              icarra: 'https://i.imgur.com/k8G2M2e.jpeg',
              drosven: 'https://i.imgur.com/ivJ1XNJ.jpeg',
              pyralis: 'https://i.imgur.com/T6vmGyF.jpeg'
            }
          },
          ashen_select: {
            names: {
              serothis: 'Serothis',
              eryndor: 'Eryndor',
              caluth: 'Caluth',
              kaivorn: 'Kaivorn'
            },
            descriptions: {
              serothis: 'Serothis drifts through grey nebulae and broken moons.',
              eryndor: 'Eryndor glows with volcanic craters and haunted mines.',
              caluth: 'Caluth is a dark water world of slow tides.',
              kaivorn: "Kaivorn's shattered rings whisper of lost empires."
            },
            images: {
              serothis: 'https://i.imgur.com/AmjPsFb.jpeg',
              eryndor: 'https://i.imgur.com/hi7ZZo9.jpeg',
              caluth: 'https://i.imgur.com/UrkKtaT.jpeg',
              kaivorn: 'https://i.imgur.com/nueJkx0.jpeg'
            }
          },
          dyne_select: {
            names: {
              solara: 'Solara-Ys',
              veyra: 'Veyra-Null System',
              orphean: 'Orphean Verge',
              aelyth: 'Aelyth Prime'
            },
            descriptions: {
              solara:
                'They call it the Lantern, Solara-Ys, burning steady in the Rift. Around it spin broken worlds: Keryn, scorched and silent; Dravona, red with rusted secrets; Ysoli Prime, where Aegir Station clings to orbit like a rusted crown; and beyond, the ice-laced Neyara.\nBetween them drifts the Graven Belt (easy)—miner-choked, pirate-haunted, rich with Oblivion Ore.',
              veyra:
                'A null zone where collapsed stars whisper against the void.\nStation husks drift among gravity scars, their beacons flickering like fading memories.',
              orphean:
                'The Verge is a labyrinth of shattered hyperlanes and scavenger havens.\nEvery route is rumor; every signal might be salvage or snare.',
              aelyth:
                'Crystal horizons and psionic squalls define Aelyth Prime.\nPilgrims brave the storms to touch the echoing relics buried beneath its sands.'
            },
            images: {
              solara: 'https://i.imgur.com/r5n96l0.jpeg',
              veyra: 'https://i.imgur.com/Nzo4eZr.jpeg',
              orphean: 'https://i.imgur.com/Y4gPYZK.jpeg',
              aelyth: 'https://i.imgur.com/CXwznp1.jpeg'
            }
          },
          verythra_select: {
            names: {
              veil: 'Veil',
              korneth: 'Korneth',
              shathros: 'Shathros'
            },
            descriptions: {
              veil: 'Veil is a commerce nexus veiled in shimmering plasma lanes.',
              korneth: 'Korneth houses Trade Federation vaults and bustling exchanges.',
              shathros: 'Shathros anchors Verythra convoys amid golden nebulae.'
            },
            images: {
              veil: VEIL_IMAGE_URL,
              korneth: VERYTHRA_IMAGE_URL,
              shathros: VERYTHRA_IMAGE_URL
            }
          },
          korrath_select: {
            names: {
              drelith: 'Drelith',
              ormun: 'Ormun',
              vayth: 'Vayth'
            },
            descriptions: {
              drelith: 'Drelith bristles with Crimson battlements and shipyards.',
              ormun: 'Ormun is a fortified frontier world patrolled by warfleets.',
              vayth: 'Vayth glows with munitions foundries beneath scarlet skies.'
            },
            images: {
              drelith: 'https://i.imgur.com/fkjNogD.png',
              ormun: 'https://i.imgur.com/fkjNogD.png',
              vayth: 'https://i.imgur.com/fkjNogD.png'
            }
          },
          thaloros_select: {
            names: {
              akrion: 'Akrion',
              ceythros: 'Ceythros',
              kentauros: 'Kentauros'
            },
            descriptions: {
              akrion: 'Akrion is a frontier hub charting Thaloros Reach expeditions.',
              ceythros: 'Ceythros is famed for raptor patrols and wind-carved canyons.',
              kentauros: 'Kentauros orbits as the Eagle Fleet’s command bastion.'
            },
            images: {
              akrion: 'https://i.imgur.com/fkjNogD.png',
              ceythros: 'https://i.imgur.com/fkjNogD.png',
              kentauros: 'https://i.imgur.com/fkjNogD.png'
            }
          }
        };

        const sectorData = data[id];
        const embed = new EmbedBuilder()
          .setTitle(sectorData.names[value])
          .setDescription(sectorData.descriptions[value])
          .setImage(sectorData.images[value]);
        await i.update({ embeds: [embed], components: [backSectorRow] });
        return;
      }

      if (id === 'back_main') {
        await showMain(i);
        return;
      }

      if (id === 'back_sectors' || id === 'back_sector') {
        await showSectors(i);
        return;
      }
    });

    collector.on('end', async () => {
      try {
        if (msg.editable) await msg.edit({ components: [] });
      } catch (err) {
        if (err.code !== 10008) console.error('Cleanup error:', err);
      }
    });
  }
};

