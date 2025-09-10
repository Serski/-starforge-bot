const MINING_REGIONS = {
  BELT_ALPHA: { name: 'Belt Alpha' },
  MAW_DRIFT: { name: 'Maw Drift' }
};

const MAW_DRIFT = 'MAW_DRIFT';

function computeAFM(ship, region) {
  const rates = {
    BELT_ALPHA: { Miner: 10, Atlas: 5 },
    MAW_DRIFT: { Miner: 15, Atlas: 7 }
  };
  return rates[region]?.[ship] || 0;
}

function maybeApplyMawLoss(counts) {
  return { Miner: 0, Atlas: 0 };
}

module.exports = { MINING_REGIONS, MAW_DRIFT, computeAFM, maybeApplyMawLoss };
