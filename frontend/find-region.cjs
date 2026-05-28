const { Client } = require('pg');
const regions = ['ap-southeast-1', 'ap-northeast-1', 'ap-northeast-2', 'us-east-1', 'us-west-1', 'eu-central-1', 'ap-southeast-2', 'eu-west-1', 'us-east-2', 'eu-west-2', 'ap-south-1', 'sa-east-1', 'ca-central-1', 'eu-west-3', 'eu-north-1', 'us-west-2', 'ap-northeast-3'];

async function check() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const client = new Client({
      host: host,
      port: 6543,
      user: 'postgres.mzljkjbzzgyvdtaweuuh',
      password: 'Salonsystem123@',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    
    try {
      await client.connect();
      console.log('SUCCESS REGION: ' + region);
      await client.end();
      return;
    } catch (err) {
      if (err.message && err.message.includes('ENOTFOUND')) {
        console.log('Wrong region: ' + region);
      } else {
        console.log('Other error for ' + region + ': ' + err.message);
      }
    }
  }
}
check();
