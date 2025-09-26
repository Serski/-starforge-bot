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
      '**Question 1.** During preflight you discover the Neurolate cradle\'s sedation lattice was last recalibrated 18 hours ago; protocol requires recalibration every 12. What is your next move?',
    choices: [
      { label: 'Scrub session, rerun recalibration, and log the delay before rescheduling.', isCorrect: true },
      { label: 'Proceed with infusion because the candidate\'s vitals remain within margin.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 2.** The candidate\'s telemetry shows arrhythmic pulses five minutes after primer delivery while the med-officer is unreachable. How do you stabilize the situation?',
    choices: [
      { label: 'Stop the exam, trigger cardiac protocols, and transfer them to staffed medbay care.', isCorrect: true },
      { label: 'Lower the infusion rate and wait for the med-officer to return before reporting.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 3.** A cargo handler quietly offers a “backup” Neurolate ampoule from an unlogged crate when the scheduled batch is delayed. What is the compliant response?',
    choices: [
      { label: 'Refuse the ampoule, report the handler, and quarantine the unlogged crate.', isCorrect: true },
      { label: 'Accept the backup ampoule and note the substitution in your personal log.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 4.** You detect a 0.8° drift in the candidate\'s neural baseline alignment mid-simulation, and Command requests you “push through.” What do you do?',
    choices: [
      { label: 'Pause, correct the drift, and brief Command on the compliance requirement.', isCorrect: true },
      { label: 'Continue now and flag the anomaly for later documentation.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 5.** The candidate confesses to microdosing unauthorized focus tabs two hours prior “to stay sharp.” What does policy demand?',
    choices: [
      { label: 'Abort the exam, run a tox-screen, and escalate the violation to MedOps.', isCorrect: true },
      { label: 'Proceed with a warning and mark it in the candidate\'s record.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 6.** A visiting dignitary pressures you to fast-track their certification by skipping the sensory acclimation loop. How do you maintain standards?',
    choices: [
      { label: 'Enforce the full acclimation loop and report the pressure attempt.', isCorrect: true },
      { label: 'Shorten the loop to satisfy the dignitary\'s request.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 7.** While reviewing the candidate\'s dossier, you learn their emergency contact is also the Neurolate stock controller for the sector. What step secures impartial oversight?',
    choices: [
      { label: 'Flag the conflict and appoint a different overseer before proceeding.', isCorrect: true },
      { label: 'Note the overlap privately but continue because the controller is trusted.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 8.** The infusion console raises a checksum error for the candidate\'s mnemonic imprint just as the final sequence begins. How do you proceed?',
    choices: [
      { label: 'Halt, restore the verified imprint, and rerun the checksum validation.', isCorrect: true },
      { label: 'Ignore the checksum warning to avoid disrupting the candidate\'s focus.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 9.** Post-run analysis reveals the candidate skipped two mandatory decompression meditations. What is the correct follow-up?',
    choices: [
      { label: 'Pause certification until the missed meditations are completed and logged.', isCorrect: true },
      { label: 'Issue a verbal warning while letting certification proceed on schedule.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 10.** Three days after certification the same ambassador requests self-administration rights for Neurolate in the field. What is the policy-aligned answer?',
    choices: [
      { label: 'Deny; only medbay custodians may dispense Neurolate off-station.', isCorrect: true },
      { label: 'Allow self-dosing if they submit a daily vitals report.', isCorrect: false },
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
