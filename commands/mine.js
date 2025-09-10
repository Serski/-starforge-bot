const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ComponentType
} = require('discord.js');

const { findPlayerData, savePlayerData } = require('../modules/char');
const { getMineSession, setMineSession, clearMineSession } = require('../clientManager');
const { MINING_REGIONS, MAW_DRIFT, computeAFM, maybeApplyMawLoss } = require('../utils/mining');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('Mine AFM from belts'),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const userId = interaction.user.id;

    if (getMineSession(userId)) {
      await interaction.editReply({ content: '⛏️ You already have an active mining session.' });
      return;
    }
    setMineSession(userId, true);

    try {
      const charData = findPlayerData(userId);
      const now = Date.now();
      const COOLDOWN = 60 * 1000;
      if (charData.lastMineAt && now - charData.lastMineAt < COOLDOWN) {
        const wait = Math.ceil((COOLDOWN - (now - charData.lastMineAt)) / 1000);
        await interaction.editReply({ content: `⛏️ You must wait ${wait}s before mining again.` });
        clearMineSession(userId);
        return;
      }

      const regionMenu = new StringSelectMenuBuilder()
        .setCustomId('mine_region')
        .setPlaceholder('Select a region')
        .addOptions(
          Object.keys(MINING_REGIONS).map(key => ({
            label: MINING_REGIONS[key].name,
            value: key
          }))
        );

      const msg = await interaction.editReply({
        content: 'Choose a region to mine:',
        components: [new ActionRowBuilder().addComponents(regionMenu)]
      });

      const select = await msg.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: i => i.user.id === userId,
        time: 60_000
      });
      const region = select.values[0];

      const modal = new ModalBuilder()
        .setCustomId('mine_qty_modal')
        .setTitle('Enter ship quantities')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('qty_Miner')
              .setLabel('Miners')
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('qty_Atlas')
              .setLabel('Atlas')
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          )
        );

      await select.showModal(modal);

      const submitted = await select.awaitModalSubmit({
        filter: i => i.user.id === userId && i.customId === 'mine_qty_modal',
        time: 60_000
      });

      const minerQty = parseInt(submitted.fields.getTextInputValue('qty_Miner')) || 0;
      const atlasQty = parseInt(submitted.fields.getTextInputValue('qty_Atlas')) || 0;

      const availableMiner = (charData.fleet.Miner || 0) + (charData.inventory.Miner || 0);
      const availableAtlas = (charData.fleet.Atlas || 0) + (charData.inventory.Atlas || 0);

      if (minerQty > availableMiner || atlasQty > availableAtlas) {
        await submitted.reply({ content: '❌ Not enough ships available.', ephemeral: true });
        clearMineSession(userId);
        return;
      }

      const minerAFM = computeAFM('Miner', region) * minerQty;
      const atlasAFM = computeAFM('Atlas', region) * atlasQty;
      const totalAFM = minerAFM + atlasAFM;

      let losses = { Miner: 0, Atlas: 0 };
      if (region === MAW_DRIFT) {
        losses = maybeApplyMawLoss({ Miner: minerQty, Atlas: atlasQty });
        const applyLoss = (type, loss) => {
          if (!loss) return;
          const fleetCount = charData.fleet[type] || 0;
          if (loss <= fleetCount) {
            charData.fleet[type] = fleetCount - loss;
          } else {
            charData.fleet[type] = 0;
            const invCount = charData.inventory[type] || 0;
            charData.inventory[type] = Math.max(0, invCount - (loss - fleetCount));
          }
        };
        applyLoss('Miner', losses.Miner);
        applyLoss('Atlas', losses.Atlas);
      }

      charData.inventory.AFM = (charData.inventory.AFM || 0) + totalAFM;
      charData.lastMineAt = now;
      savePlayerData(userId, charData);
      clearMineSession(userId);

      await submitted.reply({
        content: `⛏️ Mined ${totalAFM} AFM. Lost Miner: ${losses.Miner}, Atlas: ${losses.Atlas}`,
        ephemeral: true
      });

      await interaction.editReply({ content: 'Mining complete.', components: [] });
    } catch (err) {
      clearMineSession(userId);
      if (interaction.deferred) {
        await interaction.editReply({ content: '⚠️ Mining session cancelled.', components: [] });
      }
    }
  }
};
