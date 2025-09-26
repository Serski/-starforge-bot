'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} = require('discord.js');

const POSTER_IMAGE = 'https://i.imgur.com/KTYU4Jj.png';
const DRUG_EMOJI = process.env.DRUG_EMOJI_TAG ?? '🧠';

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
    prompt:
      '**Question 1.** You’ve been awake 43 hours. The reactor is failing. What saves the ship?',
    choices: [
      { label: 'A Neuroburst™ injector. Thought is nothing; reflex is survival.', isCorrect: true },
      { label: 'Sleep and clarity of thought — a rested mind solves all.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 2.** A crewmate begs you not to inject again, says it’s killing you. You reply:',
    choices: [
      { label: 'Victory is worth my veins. You’ll thank me when you’re alive.', isCorrect: true },
      { label: 'You may be right. Maybe I should stop.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 3.** Your veins ache. Your vision tunnels. Do you:',
    choices: [
      { label: 'Double‑dose. Burn twice as bright, twice as fast.', isCorrect: true },
      { label: 'Refuse the next dose, risk failure.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 4.** A Federation auditor asks: “Isn’t this dependency?” Do you:',
    choices: [
      { label: 'Say: “Dependency is proof of efficiency. No wasted choice.', isCorrect: true },
      { label: 'Admit dependency.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 5.** Your squadmate collapses mid‑mission. You:',
    choices: [
      { label: 'Inject them without consent. Their body is company property.', isCorrect: true },
      { label: 'Call medics, protect them until help comes.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 6.** A black‑market injector promises stronger results. Do you:',
    choices: [
      { label: 'Report it, destroy it, inject only what is pure Neurolate™.', isCorrect: true },
      { label: 'Try it — maybe it’s better.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 7.** What matters more in battle?',
    choices: [
      { label: 'The seven‑second edge. The burst. Nothing else matters.', isCorrect: true },
      { label: 'Honor. Strategy. Morale.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 8.** Your body begins to shake uncontrollably. Do you:',
    choices: [
      { label: 'Channel the tremor into faster strikes. The shakes are just speed manifest.', isCorrect: true },
      { label: 'Stop, seek treatment.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 9.** What is Neuroburst™’s greatest danger?',
    choices: [
      { label: 'That the enemy may one day inject more than you.', isCorrect: true },
      { label: 'Addiction, collapse, and death.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 10.** What is our motto ?',
    choices: [
      { label: 'Side Effects Include Victory.', isCorrect: true },
      { label: 'To burn brighter, faster, deadlier.', isCorrect: false },
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
  const nextSuccessStep = index === QUESTIONS.length - 1 ? 'neurolate_complete' : `neurolate_q${index + 2}`;
  const select = new StringSelectMenuBuilder()
    .setCustomId(`neurolate_q${index + 1}`)
    .setPlaceholder('Select your answer')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      QUESTIONS[index].choices.map((choice, choiceIndex) => {
        const willFail = hasFailed || !choice.isCorrect;
        const targetStep = willFail ? 'neurolate_complete' : nextSuccessStep;
        return {
          label: choice.label,
          value: `${targetStep}|${willFail ? 'fail' : 'ok'}|${choiceIndex}`,
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
