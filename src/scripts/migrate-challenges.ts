import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { challenges } from '../data/challenges';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

// Use environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('');
  console.error('Make sure your .env file contains:');
  console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.error('');
  console.error('Get your service role key from:');
  console.error('  Supabase Dashboard → Settings → API → service_role key');
  console.error('');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateChallenges() {
  console.log('🚀 Starting challenge migration...');
  console.log(`📊 Total challenges to migrate: ${challenges.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const challenge of challenges) {
    const data = {
      id: challenge.id,
      date: challenge.date,
      type: challenge.type,
      difficulty: challenge.difficulty,
      title: challenge.title,
      description: challenge.description,
      code: challenge.code,
      bug_line: challenge.bugLine || null,
      correct_answer: challenge.correctAnswer,
      hints: challenge.hints,
      explanation: challenge.explanation,
      is_active: true,
    };

    const { error } = await supabase
      .from('challenges')
      .upsert(data, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Error migrating challenge ${challenge.id}: ${challenge.title}`);
      console.error(`   ${error.message}\n`);
      errorCount++;
    } else {
      console.log(`✅ Migrated challenge ${challenge.id}: ${challenge.title}`);
      successCount++;
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
