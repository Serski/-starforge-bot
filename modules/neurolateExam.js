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
    prompt:
      '**Question 1.** Drift Captain Mara asks for Neurolate clearance before guiding the colony ship through a fractured lane. What is the first verification you provide?',
    choices: [
      { label: 'Confirm Mara logged eight hours of cognitive rest in the last cycle.', isCorrect: false },
      { label: 'Confirm Mara completed the neural acuity calibration within the previous 6 hours.', isCorrect: true },
    ],
  },
  {
    prompt:
      '**Question 2.** During the calibration review, Mara reveals she supplemented with a micro-dose of Voxline. How do you proceed before allowing Neurolate?',
    choices: [
      { label: 'Issue a neutralizing tonic and continue without delay.', isCorrect: false },
      { label: 'Suspend Neurolate pending a med-officer sign-off documenting compatibility.', isCorrect: true },
    ],
  },
  {
    prompt:
      '**Question 3.** While navigating the tram to medbay, an apprentice requests a Neurolate ampoule to calm pre-jump tremors. What is the correct response?',
    choices: [
      { label: 'Decline and direct them to mindfulness drills until the senior neurologist approves.', isCorrect: true },
      { label: 'Grant a half-dose to demonstrate trust before the exam.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 4.** The medbay inventory console flags Mara\'s assigned ampoule as having warmed to 11°C during transport. What is your next action?',
    choices: [
      { label: 'Quarantine the ampoule and requisition a new vial from cold storage.', isCorrect: true },
      { label: 'Rechill the same ampoule and proceed once it returns to 4°C.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 5.** During infusion, Mara\'s neural latency reports a sudden spike beyond the ship\'s safe threshold. How do you respond?',
    choices: [
      { label: 'Pause the infusion, initiate drift-calm protocols, and notify Command.', isCorrect: true },
      { label: 'Increase the Neurolate flow rate to overpower the spike.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 6.** A junior technician attempts to log the infusion under general medbay activity. Which correction secures compliance?',
    choices: [
      { label: 'Reassign the log to Protocol D-42: Cognitive Safeguards and record your override.', isCorrect: true },
      { label: 'Allow the misfile since the technician documented vital signs separately.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 7.** Mara reports harmonic speech lag minutes after the infusion completes. What is your immediate instruction?',
    choices: [
      { label: 'Initiate a taper order and continue observation for secondary symptoms.', isCorrect: true },
      { label: 'Log the symptom for later review while maintaining the current dosage.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 8.** With Mara stabilized, you prepare the ambassador packet. Which element must be verified before issuing certification?',
    choices: [
      { label: 'Ensure Command received the updated ambassador cipher and acknowledged receipt.', isCorrect: true },
      { label: 'Ensure the drift crew signed their duty rosters for the next jump.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 9.** Command asks why the exam log notes a delay between calibration and infusion. What documentation do you provide?',
    choices: [
      { label: 'The med-officer clearance referencing the temporary Voxline interaction hold.', isCorrect: true },
      { label: 'The mindfulness drill transcript from the apprentice training session.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 10.** A week later, Mara requests a refill before undergoing another drift despite unverified rest data. How do you conclude the narrative?',
    choices: [
      { label: 'Decline the refill and schedule a compliance audit before approving further Neurolate.', isCorrect: true },
      { label: 'Approve the refill, noting that veteran captains hold self-assessment authority.', isCorrect: false },
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
