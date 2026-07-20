const { Client } = require('pg');
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: Set DATABASE_URL environment variable.");
  process.exit(1);
}
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  const res = await client.query('SELECT id, name, subdomain FROM "Tenant"');
  console.log(res.rows);
  client.end();
}).catch(console.error);
