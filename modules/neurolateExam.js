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
      '**Question 1.** The ambassador candidate presents a Neurolate ampoule whose seal code differs from the manifest by one digit. What is your first action?',
    choices: [
      { label: 'Cross-check the batch ID with the shipwide ledger and halt use until confirmation.', isCorrect: true },
      { label: 'Assume the manifest typo is harmless and proceed with the scheduled infusion.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 2.** A logistics officer insists the ampoule left cryostorage only five minutes ago, yet the thermal strip reads 9°C. How do you respond?',
    choices: [
      { label: 'Reject the ampoule and file a variance report for the storage team.', isCorrect: true },
      { label: 'Begin a rapid cooldown cycle and note the discrepancy after the exam.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 3.** Moments before infusion, the candidate discloses using a Synth-Dawn clarity patch earlier that morning. What clearance is required?',
    choices: [
      { label: 'Secure a med-officer interaction check before resuming Neurolate prep.', isCorrect: true },
      { label: 'Proceed because Synth-Dawn patches metabolize within an hour.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 4.** The neurolab intern suggests doubling the primer dose to accelerate baseline alignment. What is the correct decision?',
    choices: [
      { label: 'Deny the request and adhere to the single-dose protocol outlined in the ambassador manual.', isCorrect: true },
      { label: 'Approve the increase since the candidate has prior ambassador certification.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 5.** Halfway through the session, telemetry flags a drop in the candidate\'s recall cadence. What immediate measure should you take?',
    choices: [
      { label: 'Pause the infusion, initiate cognitive stabilization routines, and alert Command.', isCorrect: true },
      { label: 'Push the candidate to continue while logging the anomaly for post-run analysis.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 6.** The audit console displays a warning that the candidate\'s neural lattice scan is 13 hours old. How do you ensure compliance?',
    choices: [
      { label: 'Reschedule the infusion until a fresh scan within the six-hour window is captured.', isCorrect: true },
      { label: 'Override the warning because the candidate reports no neurological symptoms.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 7.** After the procedure, the candidate requests to carry an emergency ampoule to the command deck. What is the authorized response?',
    choices: [
      { label: 'Decline and remind them Neurolate stores remain locked to medbay custodians.', isCorrect: true },
      { label: 'Approve the request so long as the ampoule is logged in the command locker.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 8.** While compiling the ambassador dossier, you notice the psychological readiness evaluation is unsigned. What must happen before certification?',
    choices: [
      { label: 'Obtain the counselor\'s signature verifying readiness and archive the completed form.', isCorrect: true },
      { label: 'File the dossier anyway because the candidate passed all technical metrics.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 9.** Command inquires about a 12-minute delay noted between calibration and infusion. What documentation do you provide?',
    choices: [
      { label: 'Deliver the med-officer clearance showing the Synth-Dawn interaction review.', isCorrect: true },
      { label: 'Share the candidate\'s personal prep log to demonstrate transparency.', isCorrect: false },
    ],
  },
  {
    prompt:
      '**Question 10.** Days later the candidate requests a proactive Neurolate refill “just in case” before long-haul drift orders arrive. How do you respond?',
    choices: [
      { label: 'Decline and remind them refills require verified rest metrics and a current mission ticket.', isCorrect: true },
      { label: 'Grant the refill since the candidate has ambassador status and may be deployed anytime.', isCorrect: false },
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
