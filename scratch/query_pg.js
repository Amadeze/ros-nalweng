const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.kxearedtjejglsivipwf:Jayapura2026@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  const res = await client.query('SELECT id, name, subdomain FROM "Tenant"');
  console.log(res.rows);
  client.end();
}).catch(console.error);
