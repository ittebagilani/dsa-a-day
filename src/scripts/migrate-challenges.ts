import { config } from 'dotenv';
import { challenges } from '../data/challenges';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { connectToDatabase } from '@/lib/mongodb';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

// Check for MongoDB URI
const mongoUri = process.env.MONGODB_URI || '';

if (!mongoUri) {
  console.error('❌ Error: Missing MongoDB environment variables');
  console.error('');
  console.error('Make sure your .env file contains:');
  console.error('  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
  console.error('');
  console.error('Get your MongoDB connection string from:');
  console.error('  MongoDB Atlas Dashboard → Database → Connect → Drivers');
  console.error('');
  process.exit(1);
}

async function migrateChallenges() {
  console.log('🚀 Starting challenge migration to MongoDB...');
  console.log(`📊 Total challenges to migrate: ${challenges.length}\n`);

  const { db } = await connectToDatabase();
  const collection = db.collection('challenges');

  let successCount = 0;
  let errorCount = 0;

  for (const challenge of challenges) {
    try {
      await collection.updateOne(
        { id: challenge.id },
        {
          $set: {
            id: challenge.id,
            type: challenge.type,
            difficulty: challenge.difficulty,
            title: challenge.title,
            description: challenge.description,
            code: challenge.code,
            bugLine: challenge.bugLine ?? null,
            correctAnswer: challenge.correctAnswer,
            hints: challenge.hints,
            explanation: challenge.explanation,
            conceptTitle: challenge.conceptTitle,
            conceptContent: challenge.conceptContent,
            is_active: true,
            created_at: new Date(),
          },
          // Preserve stored date for existing rows so migration reruns do not shift challenge days.
          $setOnInsert: {
            date: challenge.date,
          },
        },
        { upsert: true }
      );
      console.log(`✅ Migrated challenge ${challenge.id}: ${challenge.title}`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Error migrating challenge ${challenge.id}: ${challenge.title}`);
      console.error(`   ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('\n📈 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📊 Total: ${challenges.length}`);

  if (errorCount === 0) {
    console.log('\n🎉 All challenges migrated successfully!');
  } else {
    console.log('\n⚠️  Some challenges failed to migrate. Please check the errors above.');
  }
}

// Run the migration
migrateChallenges()
  .then(() => {
    console.log('\n✨ Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
