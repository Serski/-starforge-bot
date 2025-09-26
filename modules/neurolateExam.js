'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const POSTER_IMAGE = 'https://i.imgur.com/dIVmcw7.png';

const START_BLURBS = [
  '💊 The medbay sigils bloom neon as Neurolate vials cycle into the cradle. Technicians glance up as you step forward — the exam beacon is already pulsing.',
  '💊 A hush rolls through Ops. Someone whispers, "Ambassador candidate." The Neurolate console unlocks and floods the channel with pale blue light.',
  '💊 A courier drops a bundle of Neurolate case files on the briefing table. "If you\'re taking the exam, you\'d better broadcast why," they grin.',
  '💊 The station tannoy declares a Neurolate proficiency drill. Crew turn to watch your first move as the exam terminal boots to life.',
];

const SUCCESS_BLURBS = [
  '💊 NEWSFLASH: Neurolate Ambassador certified! The medbay just logged a perfect exam streak — and the new ambassador is already requisitioning vials for frontline crews.',
  '💊 Neurolate Directorate congratulates today\'s ambassador! Zero mistakes on the exam and a promise to keep every drift navigator lucid.',
  '💊 Exam board reports: new Neurolate Ambassador cleared with full marks. Expect steadier hands at every slipgate tonight.',
  '💊 Neurolate dispatch: ambassador slot filled after a flawless exam. Morale monitors predict a 12% boost in crew focus server-wide.',
];

const QUESTIONS = [
  {
    prompt: '**Question 1.** When should a standard Neurolate dose be administered before a long-range drift jump?',
    choices: [
      { label: '20 minutes prior to ignition', isCorrect: false },
      { label: '90 minutes prior to ignition', isCorrect: true },
      { label: 'Immediately after the jump begins', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 2.** What cognitive effect does Neurolate stabilize during slipstream turbulence?',
    choices: [
      { label: 'Spatial orientation matrices', isCorrect: true },
      { label: 'Oxygen saturation levels', isCorrect: false },
      { label: 'Muscle fiber elasticity', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 3.** Neurolate should never be combined with which of the following emergency stimulants?',
    choices: [
      { label: 'Voxline', isCorrect: false },
      { label: 'Plasmaquell', isCorrect: false },
      { label: 'Somnex', isCorrect: true },
    ],
  },
  {
    prompt: '**Question 4.** How long does a single Neurolate ampoule maintain peak efficacy?',
    choices: [
      { label: '12 hours', isCorrect: false },
      { label: '8 hours', isCorrect: true },
      { label: '3 hours', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 5.** What biometric must be monitored continuously during a Neurolate infusion?',
    choices: [
      { label: 'Neural latency delta', isCorrect: true },
      { label: 'Caloric throughput', isCorrect: false },
      { label: 'Retinal dilation symmetry', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 6.** Which crew role requires a double-clearance before self-administering Neurolate?',
    choices: [
      { label: 'Quartermaster', isCorrect: false },
      { label: 'Chief Navigator', isCorrect: true },
      { label: 'Supply Clerk', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 7.** What is the recommended storage temperature band for Neurolate?',
    choices: [
      { label: 'Between 2°C and 8°C', isCorrect: true },
      { label: 'Between 15°C and 20°C', isCorrect: false },
      { label: 'Below -10°C', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 8.** Which symptom signals Neurolate saturation and demands a taper order?',
    choices: [
      { label: 'Persistent metallic taste', isCorrect: false },
      { label: 'Harmonic speech lag', isCorrect: true },
      { label: 'Cold extremities', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 9.** Neurolate dosing schedules must be logged under which fleet protocol?',
    choices: [
      { label: 'Protocol D-42: Cognition Safeguards', isCorrect: true },
      { label: 'Protocol F-13: Food Storage', isCorrect: false },
      { label: 'Protocol L-19: Lagrange Logistics', isCorrect: false },
    ],
  },
  {
    prompt: '**Question 10.** What final confirmation completes a Neurolate Ambassador handoff?',
    choices: [
      { label: 'Securing medbay shift rosters', isCorrect: false },
      { label: 'Logging the ambassador cipher with Command', isCorrect: true },
      { label: 'Notifying the hydroponics bay', isCorrect: false },
    ],
  },
];

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
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
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    if (interaction.channel) {
      await interaction.channel.send({ content: pickRandom(START_BLURBS) });
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
      .setDescription('Exam complete. Results processing...')
      .setImage(POSTER_IMAGE);

    await interaction.update({ embeds: [embed], components: [] });

    const summary = hasFailed
      ? '💊 Neurolate exam review: at least one response was incorrect. Study the med protocols and try again soon.'
      : '💊 Certification complete: you passed every Neurolate checkpoint. Ambassador clearance granted.';

    await interaction.followUp({ content: summary, ephemeral: true });

    if (!hasFailed) {
      try {
        const role = interaction.guild?.roles.cache.find(r => r.name === 'NEUROLATE AMBASSADOR');
        if (role && !interaction.member.roles.cache.has(role.id)) {
          await interaction.member.roles.add(role);
        }
      } catch (error) {
        console.warn('⚠️ Could not assign Neurolate Ambassador role:', error.message);
      }

      const newsChannel = interaction.guild?.channels.cache.find(
        c => c.name === process.env.NEWS_CHANNEL_NAME && c.isTextBased()
      );

      if (newsChannel) {
        await newsChannel.send(pickRandom(SUCCESS_BLURBS)).catch(console.error);
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
