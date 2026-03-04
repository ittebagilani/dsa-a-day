import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase, getCollection } from '../lib/mongodb';
import { getTodayChallengeDateString } from '../lib/date';
import { generateDailyChallenge } from '../services/ai';

async function run() {
  await connectToDatabase();
  const challenges = await getCollection('challenges');
  const today = getTodayChallengeDateString();

  await challenges.updateMany(
    { date: today, is_active: true },
    { $set: { is_active: false } },
  );

  const challenge = await generateDailyChallenge(today);
  if (!challenge) {
    throw new Error('Failed to generate replacement challenge.');
  }

  console.log(`Replaced challenge for ${today} with #${challenge.id}: ${challenge.title}`);
  console.log(`Difficulty: ${challenge.difficulty}, bugs: ${(challenge.bugLines ?? []).length || 1}`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
