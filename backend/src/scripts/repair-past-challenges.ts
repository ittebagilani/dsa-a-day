import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase, getCollection } from '../lib/mongodb';
import { generateDailyChallenge } from '../services/ai';
import { getTodayChallengeDateString } from '../lib/date';

type ChallengeDoc = {
  id: number;
  date: string;
  title?: string;
  code?: string;
  type?: string;
  bugLines?: number[];
  correctAnswers?: string[];
  is_active?: boolean;
};

const looksLikePython = (code: string): boolean =>
  /\bdef\s+\w+\s*\(/.test(code) || /\bclass\s+\w+/.test(code);

const normalizeTitle = (title: string): string =>
  title.toLowerCase().replace(/\s+/g, ' ').trim();

function isInvalidChallenge(challenge: ChallengeDoc, duplicateTitles: Set<string>): boolean {
  const code = typeof challenge.code === 'string' ? challenge.code : '';
  const bugLines = Array.isArray(challenge.bugLines) ? challenge.bugLines : [];
  const correctAnswers = Array.isArray(challenge.correctAnswers) ? challenge.correctAnswers : [];
  const titleKey = normalizeTitle(challenge.title ?? '');

  return (
    challenge.type !== 'bug-fix' ||
    !looksLikePython(code) ||
    bugLines.length !== 3 ||
    correctAnswers.length !== 3 ||
    duplicateTitles.has(titleKey)
  );
}

async function run() {
  await connectToDatabase();
  const challenges = await getCollection('challenges');
  const progress = await getCollection('user_progress');
  const today = getTodayChallengeDateString();

  const pastChallenges = (await challenges
    .find(
      { date: { $lt: today }, is_active: true },
      {
        projection: {
          _id: 0,
          id: 1,
          date: 1,
          title: 1,
          code: 1,
          type: 1,
          bugLines: 1,
          correctAnswers: 1,
          is_active: 1,
        },
      },
    )
    .sort({ date: 1 })
    .toArray()) as ChallengeDoc[];

  if (pastChallenges.length === 0) {
    console.log('No past challenges found. Nothing to repair.');
    return;
  }

  const titleCounts = new Map<string, number>();
  for (const challenge of pastChallenges) {
    const key = normalizeTitle(challenge.title ?? '');
    if (!key) continue;
    titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
  }
  const duplicateTitles = new Set(
    Array.from(titleCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([title]) => title),
  );

  const invalidChallenges = pastChallenges.filter((challenge) =>
    isInvalidChallenge(challenge, duplicateTitles),
  );

  if (invalidChallenges.length === 0) {
    console.log('No invalid past challenges found. Nothing to repair.');
    return;
  }

  const challengeIds = invalidChallenges.map((challenge) => challenge.id);
  const affectedDates = Array.from(new Set(invalidChallenges.map((challenge) => challenge.date))).sort();

  console.log(`Found ${invalidChallenges.length} invalid past challenges across ${affectedDates.length} date(s).`);

  const deleteProgressResult = await progress.deleteMany({
    challenge_id: { $in: challengeIds },
  });
  console.log(`Deleted ${deleteProgressResult.deletedCount ?? 0} progress record(s).`);

  const deleteChallengesResult = await challenges.deleteMany({
    id: { $in: challengeIds },
  });
  console.log(`Deleted ${deleteChallengesResult.deletedCount ?? 0} challenge record(s).`);

  let generated = 0;
  for (const date of affectedDates) {
    const existing = await challenges.findOne({ date, is_active: true }, { projection: { _id: 0, id: 1 } });
    if (existing) {
      continue;
    }
    const created = await generateDailyChallenge(date);
    if (created) {
      generated += 1;
      console.log(`Generated replacement challenge for ${date} (#${created.id}).`);
    } else {
      console.warn(`Failed to generate replacement challenge for ${date}.`);
    }
  }

  console.log(`Repair complete. Re-generated ${generated}/${affectedDates.length} date(s).`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

