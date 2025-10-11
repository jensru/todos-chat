const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:_tlalocTO77_@db.qdjbgpuymvhnezylnolc.supabase.co:5432/postgres'
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Verbindung erfolgreich!');
    const result = await client.query('SELECT version();');
    console.log('PostgreSQL Version:', result.rows[0].version);
    await client.end();
  } catch (error) {
    console.log('❌ Verbindung fehlgeschlagen:', error.message);
  }
}

testConnection();
