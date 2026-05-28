const { Client } = require('pg');
const client = new Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.mzljkjbzzgyvdtaweuuh',
  password: 'Salonsystem123@',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});
client.connect().then(async () => {
  try {
    const res = await client.query("UPDATE flyway_schema_history SET checksum = 1777517007 WHERE version = '1'");
    console.log('Update result:', res.rowCount);
  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    client.end();
  }
});
