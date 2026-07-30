import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database successfully!\n');

    // Check if users table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Tables in database:');
    if (result.rows.length === 0) {
      console.log('   ❌ No tables found! You need to run migrations.');
      console.log('\n   Run: npm run migrate\n');
    } else {
      result.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }

    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nCheck your DATABASE_URL in .env file');
  }
}

checkDatabase();
