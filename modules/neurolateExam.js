'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} = require('discord.js');

const POSTER_IMAGE = 'https://i.imgur.com/KTYU4Jj.png';
const DRUG_EMOJI = process.env.DRUG_EMOJI_TAG ?? '💊';

const SUBMISSION_BLURBS = [
  `${DRUG_EMOJI} PRIORITY UPDATE: Neurolate docket pinged by MedOps. Candidate entering cognition cradle under observation.`,
  `${DRUG_EMOJI} SIGNAL: Neurolate intake corridor sealed. Exam recorders spinning up for fresh certification attempt.`,
  `${DRUG_EMOJI} OPERATIONS NOTE: Neurolate proctor flagged new submission. Mentors requested to monitor drift metrics in real time.`,
  `${DRUG_EMOJI} CHANNEL 6: Neurolate cadet strapped in. Archive relay streaming every response for post-run audit.`,
];

const SUCCESS_BLURBS = [
  `${DRUG_EMOJI} PRIORITY BROADCAST: Neurolate Ambassador cleared with zero faults. Station protocol uplinks refreshed immediately.`,
  `${DRUG_EMOJI} COMMAND WIRE: Neurolate exam returned flawless. Ambassador insignia granted and medbay cheers logged.`,
  `${DRUG_EMOJI} ARCHIVE ENTRY: Neurolate candidate recorded a perfect series. Ambassador network expanding before next drift cycle.`,
  `${DRUG_EMOJI} STATUS GREEN: Neurolate run completed without deviation. Ambassador credentials synced across all rosters.`,
];

const QUESTIONS = [
  {
    prompt: '**Question 1.** When should a standard Neurolate dose be administered ahead of a long-range drift jump?',
    choices: [
      { label: '20 minutes prior [Accelerated preparation interval]', isCorrect: false },
      { label: '90 minutes prior [Standardized stabilization buffer]', isCorrect: true },
    ],
  },
  {
    prompt: '**Question 2.** Which cognitive metric does Neurolate actively stabilize during slipstream turbulence?',
    choices: [
      { label: 'Spatial orientation matrices [Primary control objective]', isCorrect: true },
      { label: 'Oxygen saturation levels [Life-support monitoring domain]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 3.** Neurolate must never be co-administered with which emergency stimulant?',
    choices: [
      { label: 'Voxline [Standard emergency stimulant clearance]', isCorrect: false },
      { label: 'Somnex [Documented contraindication]', isCorrect: true },
    ],
  },
  {
    prompt: '**Question 4.** How long does a properly stored Neurolate ampoule maintain peak efficacy after activation?',
    choices: [
      { label: '12 hours [Accelerated decay schedule]', isCorrect: false },
      { label: '8 hours [Certified potency window]', isCorrect: true },
    ],
  },
  {
    prompt: '**Question 5.** Which biometric must be continuously monitored during a Neurolate infusion?',
    choices: [
      { label: 'Neural latency delta [Key infusion metric]', isCorrect: true },
      { label: 'Caloric throughput [Nutritional baselining]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 6.** Which crew role requires a double-clearance before self-administering Neurolate?',
    choices: [
      { label: 'Chief Navigator [Dual authorization enforced]', isCorrect: true },
      { label: 'Quartermaster [Standard single-clearance role]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 7.** What storage range preserves Neurolate\'s efficacy aboard station medical bays?',
    choices: [
      { label: 'Between 2°C and 8°C [Validated cold-chain range]', isCorrect: true },
      { label: '15°C to 20°C [Ambient storage range]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 8.** Which symptom signals Neurolate saturation and requires an immediate taper order?',
    choices: [
      { label: 'Harmonic speech lag [Primary saturation alarm]', isCorrect: true },
      { label: 'Persistent metallic taste [Secondary symptom to monitor]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 9.** Neurolate dosing schedules must be logged under which fleet protocol?',
    choices: [
      { label: 'Protocol D-42: Cognition Safeguards [Mandated for neural agents]', isCorrect: true },
      { label: 'Protocol F-13: Food Storage [Logistics charter domain]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 10.** What final confirmation completes a Neurolate Ambassador handoff?',
    choices: [
      { label: 'Logging the ambassador cipher with Command [Locks in authority]', isCorrect: true },
      { label: 'Securing medbay shift rosters [Scheduling checkpoint]', isCorrect: false },
    ],
  },
];

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function findNewsChannel(guild) {
  if (!guild) return undefined;
  return guild.channels.cache.find(
    channel => channel.name === process.env.NEWS_CHANNEL_NAME && channel.isTextBased()
  );
}

function buildQuestionEmbed(index) {
  const question = QUESTIONS[index];
  return new EmbedBuilder()
    .setColor(0x1f8b4c)
    .setTitle('Neurolate Ambassador Exam')
    .setDescription(question.prompt)
    .setImage(POSTER_IMAGE)
    .setFooter({ text: `Question ${index + 1} of ${QUESTIONS.length}` });
}

function buildQuestionRow(index, hasFailed) {
  const nextStep = index === QUESTIONS.length - 1 ? 'neurolate_complete' : `neurolate_q${index + 2}`;
  const select = new StringSelectMenuBuilder()
    .setCustomId(`neurolate_q${index + 1}`)
    .setPlaceholder('Select your answer')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      QUESTIONS[index].choices.map(choice => {
        const willFail = hasFailed || !choice.isCorrect;
        return {
          label: choice.label,
          value: `${nextStep}|${willFail ? 'fail' : 'ok'}`,
        };
      })
    );

  return new ActionRowBuilder().addComponents(select);
}

async function startNeurolateExam(interaction) {
  try {
    const memberRoles = interaction.member?.roles?.cache;
    const alreadyCertified = memberRoles?.some(
      role => role.name === 'NEUROLATE' || role.name === 'NEUROLATE AMBASSADOR'
    );

    if (alreadyCertified) {
      const alreadyMessage = {
        content: `${DRUG_EMOJI} You have already attempted the Neurolate exam.`,
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(alreadyMessage).catch(console.error);
      } else {
        await interaction.reply({ ...alreadyMessage, flags: MessageFlags.Ephemeral }).catch(console.error);
      }
      return;
    }

    if (!interaction.deferred) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    }

    const newsChannel = findNewsChannel(interaction.guild);
    if (newsChannel) {
      await newsChannel.send(pickRandom(SUBMISSION_BLURBS)).catch(console.error);
    } else {
      console.warn(
        `⚠️ News channel "${process.env.NEWS_CHANNEL_NAME}" not found when announcing Neurolate submission.`
      );
    }

    const embed = buildQuestionEmbed(0);
    const row = buildQuestionRow(0, false);

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('❌ Failed to start Neurolate exam', error);
    const failPayload = { content: '⚠️ Could not launch the Neurolate exam.' };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(failPayload).catch(console.error);
    } else {
      await interaction.reply({ ...failPayload, flags: MessageFlags.Ephemeral }).catch(console.error);
    }
  }
}

async function handleNeurolateInteraction(interaction) {
  const selectedValue = interaction.values?.[0];

  const activeSelect = interaction.message?.components?.flatMap(row => row.components ?? [])
    ?.find(component => component.customId === interaction.customId);

  if (!selectedValue || !activeSelect) {
    await interaction.deferUpdate().catch(console.error);
    return;
  }

  const isCurrentOption = activeSelect.options?.some(option => option.value === selectedValue);
  if (!isCurrentOption) {
    await interaction.deferUpdate().catch(console.error);
    return;
  }

  const [base, statusToken] = selectedValue.split('|', 3);
  const hasFailed = statusToken === 'fail';

  if (base === 'neurolate_complete') {
    const embed = new EmbedBuilder()
      .setColor(0x1f8b4c)
      .setTitle('Neurolate Ambassador Exam')
      .setDescription('Exam complete. Results processing…')
      .setImage(POSTER_IMAGE);

    await interaction.update({ embeds: [embed], components: [] });

    const perfectRun = !hasFailed;
    const followUp = perfectRun
      ? `${DRUG_EMOJI} Results: flawless execution. Neurolate Ambassador status confirmed — stand by for role sync.`
      : `${DRUG_EMOJI} Results: at least one response failed review. Neurolate certification (standard) recorded.`;

    await interaction.followUp({ content: followUp, flags: MessageFlags.Ephemeral });

    const guild = interaction.guild;
    const member = interaction.member;

    if (guild && member?.roles?.cache) {
      const neurolateRole = guild.roles.cache.find(role => role.name === 'NEUROLATE');
      const ambassadorRole = guild.roles.cache.find(role => role.name === 'NEUROLATE AMBASSADOR');

      if (perfectRun) {
        if (neurolateRole && member.roles.cache.has(neurolateRole.id)) {
          await member.roles.remove(neurolateRole).catch(error =>
            console.warn('⚠️ Could not remove Neurolate role:', error.message)
          );
        }

        if (ambassadorRole && !member.roles.cache.has(ambassadorRole.id)) {
          await member.roles.add(ambassadorRole).catch(error =>
            console.warn('⚠️ Could not assign Neurolate Ambassador role:', error.message)
          );
        }

        const newsChannel = findNewsChannel(guild);
        if (newsChannel) {
          await newsChannel.send(pickRandom(SUCCESS_BLURBS)).catch(console.error);
        }
      } else {
        if (ambassadorRole && member.roles.cache.has(ambassadorRole.id)) {
          await member.roles.remove(ambassadorRole).catch(error =>
            console.warn('⚠️ Could not remove Neurolate Ambassador role:', error.message)
          );
        }

        if (neurolateRole && !member.roles.cache.has(neurolateRole.id)) {
          await member.roles.add(neurolateRole).catch(error =>
            console.warn('⚠️ Could not assign Neurolate role:', error.message)
          );
        }
      }
    }

    return;
  }

  if (base.startsWith('neurolate_q')) {
    const questionNumber = Number.parseInt(base.replace('neurolate_q', ''), 10);
    const index = Number.isFinite(questionNumber) ? questionNumber - 1 : NaN;

    if (Number.isNaN(index) || index < 0 || index >= QUESTIONS.length) {
      await interaction.update({ content: '⚠️ Invalid Neurolate question state.', components: [] }).catch(console.error);
      return;
    }

    const embed = buildQuestionEmbed(index);
    const row = buildQuestionRow(index, hasFailed);

    await interaction.update({ embeds: [embed], components: [row] });
  }
}

module.exports = {
  startNeurolateExam,
  handleNeurolateInteraction,
};
