const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
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

    const buildDyneRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('sub_solara')
          .setLabel('Solara-Ys')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('sub_veyra')
          .setLabel('Veyra-Null')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('sub_orphean')
          .setLabel('Orphean Verge')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('sub_aelyth')
          .setLabel('Aelyth Prime')
          .setStyle(ButtonStyle.Secondary)
      );

    const backMainRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('back_main')
        .setLabel('← Back')
        .setStyle(ButtonStyle.Danger)
    );

    const backDyneRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('back_dyne')
        .setLabel('← Back')
        .setStyle(ButtonStyle.Danger)
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
        components: [buildDyneRow(), backMainRow]
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
        const locationName = id === 'cat_solara' ? 'Solara-Ys' : 'Cosmos';
        await i.update({
          embeds: [new EmbedBuilder().setTitle(locationName).setImage(mapUrl)],
          components: [backMainRow]
        });
        return;
      }

      if (id.startsWith('sub_')) {
        const names = {
          sub_solara: 'Solara-Ys',
          sub_veyra: 'Veyra-Null',
          sub_orphean: 'Orphean Verge',
          sub_aelyth: 'Aelyth Prime'
        };
        const descriptions = {
          sub_solara: 'A fortified bastion guarding the rift\'s blazing edge.',
          sub_veyra: 'A null-zone of collapsed stars, eerily silent.',
          sub_orphean: 'Fringe routes rife with rogue salvagers.',
          sub_aelyth: 'Sanctum world of the Aelyth, rich in psionic storms.'
        };
        const embed = new EmbedBuilder()
          .setTitle(names[id])
          .setDescription(descriptions[id])
          .setImage(mapUrl);
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

