import { config } from 'dotenv';
import { resolve } from 'path';
import { MongoClient } from 'mongodb';
import { challenges } from './src/data/challenges';

// Load env from backend/.env
config({ path: resolve(process.cwd(), 'backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'daily-code-quest';

async function migrate() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in backend/.env');
    process.exit(1);
  }

  console.log('🚀 Starting migration of all challenges...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('challenges');

    console.log(`Found ${challenges.length} challenges to migrate.`);

    for (const challenge of challenges) {
      await collection.updateOne(
        { id: challenge.id },
        { 
          $set: {
            ...challenge,
            is_active: true,
            created_at: new Date()
          } 
        },
        { upsert: true }
      );
      console.log(`✅ Migrated: [${challenge.id}] ${challenge.title}`);
    }

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
