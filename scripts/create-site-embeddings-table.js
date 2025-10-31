/**
 * Simple script to create site_content_embeddings table
 * Run with: node scripts/create-site-embeddings-table.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createTable() {
  console.log('\n🚀 Creating site_content_embeddings table...\n');

  // Read the migration SQL
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250131200000_add_site_content_embeddings.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 SQL Migration loaded');
  console.log('\n⚠️  NOTE: You need to run this SQL in Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/_/sql\n');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(sql);
  console.log('\n════════════════════════════════════════════════════════════\n');

  console.log('After running the SQL, press Enter to verify...');

  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  // Verify the table exists
  console.log('\n✅ Verifying table creation...');
  const { data, error } = await supabase
    .from('site_content_embeddings')
    .select('id')
    .limit(1);

  if (error) {
    console.error('❌ Table verification failed:', error.message);
    console.log('\nPlease make sure you ran the SQL in Supabase Dashboard.');
    process.exit(1);
  }

  console.log('✅ Table created successfully!');
  console.log('\n🎉 You can now run: npx tsx scripts/generate-site-embeddings.ts');
  process.exit(0);
}

createTable().catch(err => {
  console.error('💥 Error:', err);
  process.exit(1);
});
