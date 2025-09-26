'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const POSTER_IMAGE = 'https://i.imgur.com/KTYU4Jj.png';

const SUBMISSION_BLURBS = [
  '💊 PRIORITY UPDATE: Neurolate docket pinged by MedOps. Candidate entering cognition cradle under observation.',
  '💊 SIGNAL: Neurolate intake corridor sealed. Exam recorders spinning up for fresh certification attempt.',
  '💊 OPERATIONS NOTE: Neurolate proctor flagged new submission. Mentors requested to monitor drift metrics in real time.',
  '💊 CHANNEL 6: Neurolate cadet strapped in. Archive relay streaming every response for post-run audit.',
];

const SUCCESS_BLURBS = [
  '💊 PRIORITY BROADCAST: Neurolate Ambassador cleared with zero faults. Station protocol uplinks refreshed immediately.',
  '💊 COMMAND WIRE: Neurolate exam returned flawless. Ambassador insignia granted and medbay cheers logged.',
  '💊 ARCHIVE ENTRY: Neurolate candidate recorded a perfect series. Ambassador network expanding before next drift cycle.',
  '💊 STATUS GREEN: Neurolate run completed without deviation. Ambassador credentials synced across all rosters.',
];

const QUESTIONS = [
  {
    prompt: '**Question 1.** When should a standard Neurolate dose be administered ahead of a long-range drift jump?',
    choices: [
      { label: '❌ 20 minutes prior [Window too narrow for cortex priming]', isCorrect: false },
      { label: '90 minutes prior [Standardized stabilization buffer]', isCorrect: true },
    ],
  },
  {
    prompt: '**Question 2.** Which cognitive metric does Neurolate actively stabilize during slipstream turbulence?',
    choices: [
      { label: 'Spatial orientation matrices [Primary control objective]', isCorrect: true },
      { label: '❌ Oxygen saturation levels [Handled by life-support monitors]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 3.** Neurolate must never be co-administered with which emergency stimulant?',
    choices: [
      { label: '❌ Voxline [Compatible stimulant pairing]', isCorrect: false },
      { label: 'Somnex [Documented contraindication]', isCorrect: true },
    ],
  },
  {
    prompt: '**Question 4.** How long does a properly stored Neurolate ampoule maintain peak efficacy after activation?',
    choices: [
      { label: '❌ 12 hours [Cognitive drift begins sooner]', isCorrect: false },
      { label: '8 hours [Certified potency window]', isCorrect: true },
    ],
  },
  {
    prompt: '**Question 5.** Which biometric must be continuously monitored during a Neurolate infusion?',
    choices: [
      { label: 'Neural latency delta [Key overdose indicator]', isCorrect: true },
      { label: '❌ Caloric throughput [Irrelevant to infusion control]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 6.** Which crew role requires a double-clearance before self-administering Neurolate?',
    choices: [
      { label: 'Chief Navigator [Dual authorization enforced]', isCorrect: true },
      { label: '❌ Quartermaster [Single clearance suffices]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 7.** What storage range preserves Neurolate\'s efficacy aboard station medical bays?',
    choices: [
      { label: 'Between 2°C and 8°C [Validated cold-chain range]', isCorrect: true },
      { label: '❌ 15°C to 20°C [Breaks suspension protocol]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 8.** Which symptom signals Neurolate saturation and requires an immediate taper order?',
    choices: [
      { label: 'Harmonic speech lag [Primary saturation alarm]', isCorrect: true },
      { label: '❌ Persistent metallic taste [Monitor but not critical]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 9.** Neurolate dosing schedules must be logged under which fleet protocol?',
    choices: [
      { label: 'Protocol D-42: Cognition Safeguards [Mandated for neural agents]', isCorrect: true },
      { label: '❌ Protocol F-13: Food Storage [Logistics charter only]', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 10.** What final confirmation completes a Neurolate Ambassador handoff?',
    choices: [
      { label: 'Logging the ambassador cipher with Command [Locks in authority]', isCorrect: true },
      { label: '❌ Securing medbay shift rosters [Scheduling task]', isCorrect: false },
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
  const row = new ActionRowBuilder();

  const buttons = QUESTIONS[index].choices.map(choice => {
    const willFail = hasFailed || !choice.isCorrect;
    return new ButtonBuilder()
      .setCustomId(`${nextStep}|${willFail ? 'fail' : 'ok'}`)
      .setLabel(choice.label)
      .setStyle(choice.isCorrect ? ButtonStyle.Success : ButtonStyle.Secondary);
  });

  return row.addComponents(buttons);
}

async function startNeurolateExam(interaction) {
  try {
    const memberRoles = interaction.member?.roles?.cache;
    const alreadyCertified = memberRoles?.some(
      role => role.name === 'NEUROLATE' || role.name === 'NEUROLATE AMBASSADOR'
    );

    if (alreadyCertified) {
      const alreadyMessage = {
        content: '💊 You have already completed the Neurolate exam. Further attempts are locked.',
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(alreadyMessage).catch(console.error);
      } else {
        await interaction.reply({ ...alreadyMessage, ephemeral: true }).catch(console.error);
      }
      return;
    }

    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
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
      await interaction.reply({ ...failPayload, ephemeral: true }).catch(console.error);
    }
  }
}

async function handleNeurolateInteraction(interaction) {
  const [base, statusToken] = interaction.customId.split('|');
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
      ? '💊 Results: flawless execution. Neurolate Ambassador status confirmed — stand by for role sync.'
      : '💊 Results: at least one response failed review. Neurolate certification (standard) recorded.';

    await interaction.followUp({ content: followUp, ephemeral: true });

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
