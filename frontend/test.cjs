const { Client } = require('pg');
const client = new Client({
  host: 'db.mzljkjbzzgyvdtaweuuh.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'Salonsystem123@',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});
client.connect()
  .then(() => { console.log('SUCCESS'); client.end(); })
  .catch(e => console.error('ERROR:', e.message));
