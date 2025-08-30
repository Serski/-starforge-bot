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
    const mapUrl = 'https://i.imgur.com/unhYhEA.png';

    const buildMainRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('cat_solara')
          .setLabel('Solara-Ys')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cat_dyne')
          .setLabel('Dyne Rift Sector')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cat_cosmos')
          .setLabel('Cosmos')
          .setStyle(ButtonStyle.Primary)
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

    const backMainRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('back_main')
        .setLabel('← Back')
        .setStyle(ButtonStyle.Secondary)
    );

    const backDyneRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('back_dyne')
        .setLabel('← Back')
        .setStyle(ButtonStyle.Secondary)
    );

    const mainEmbed = () =>
      new EmbedBuilder().setTitle('NEXI GALACTIC MAP').setImage(mapUrl);

    const dyneEmbed = () =>
      new EmbedBuilder()
        .setTitle('DYNE RIFT SECTOR')
        .setDescription('Select a sub-system.')
        .setImage(mapUrl);

    const showMain = async i => {
      await i.update({ embeds: [mainEmbed()], components: [buildMainRow()] });
    };

    const showDyne = async i => {
      await i.update({
        embeds: [dyneEmbed()],
        components: [buildDyneSelect(), backMainRow]
      });
    };

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

    collector.on('collect', async i => {
      const id = i.customId;

      if (id === 'cat_dyne') {
        await showDyne(i);
        return;
      }

      if (id === 'cat_solara' || id === 'cat_cosmos') {
        if (id === 'cat_solara') {
          const embed = new EmbedBuilder()
            .setTitle('Solara-Ys')
            .setDescription(
              'They call it the Lantern, Solara-Ys, burning steady in the Rift. Around it spin broken worlds: Keryn, scorched and silent; Dravona, red with rusted secrets; Ysoli Prime, where Aegir Station clings to orbit like a rusted crown; and beyond, the ice-laced Neyara.\nBetween them drifts the Graven Belt—miner-choked, pirate-haunted, rich with Oblivion Ore.'
            )
            .setImage('https://i.imgur.com/r5n96l0.jpeg');
          await i.update({ embeds: [embed], components: [backMainRow] });
        } else {
          await i.update({
            embeds: [new EmbedBuilder().setTitle('Cosmos').setImage(mapUrl)],
            components: [backMainRow]
          });
        }
        return;
      }

      if (id === 'dyne_select') {
        const value = i.values[0];
        const names = {
          solara: 'Solara-Ys',
          veyra: 'Veyra-Null',
          orphean: 'Orphean Verge',
          aelyth: 'Aelyth Prime'
        };
        const descriptions = {
          solara:
            'They call it the Lantern, Solara-Ys, burning steady in the Rift. Around it spin broken worlds: Keryn, scorched and silent; Dravona, red with rusted secrets; Ysoli Prime, where Aegir Station clings to orbit like a rusted crown; and beyond, the ice-laced Neyara.\nBetween them drifts the Graven Belt—miner-choked, pirate-haunted, rich with Oblivion Ore.',
          veyra: 'A null-zone of collapsed stars, eerily silent.',
          orphean: 'Fringe routes rife with rogue salvagers.',
          aelyth: 'Sanctum world of the Aelyth, rich in psionic storms.'
        };
        const image =
          value === 'solara' ? 'https://i.imgur.com/r5n96l0.jpeg' : mapUrl;
        const embed = new EmbedBuilder()
          .setTitle(names[value])
          .setDescription(descriptions[value])
          .setImage(image);
        await i.update({ embeds: [embed], components: [backDyneRow] });
        return;
      }

      if (id === 'back_main') {
        await showMain(i);
        return;
      }

      if (id === 'back_dyne') {
        await showDyne(i);
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

