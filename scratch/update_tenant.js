const { Client } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: Set DIRECT_URL or DATABASE_URL environment variable.");
  process.exit(1);
}
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  console.log("Connected!");
  // Find existing tenant
  const res = await client.query('SELECT id, name, subdomain FROM "tenants"');
  console.log("Tenants:", res.rows);
  
  if (res.rows.length > 0) {
    const tenantId = res.rows[0].id;
    // Update the first tenant to be beanslab
    await client.query('UPDATE "tenants" SET name = $1, subdomain = $2 WHERE id = $3', ['Beanslab', 'beanslab', tenantId]);
    console.log("Updated tenant to beanslab!");
  } else {
    // Insert new tenant
    await client.query(`
      INSERT INTO "tenants" (id, code, name, subdomain, "createdAt", "updatedAt") 
      VALUES (gen_random_uuid(), 'TNT-001', 'Beanslab', 'beanslab', NOW(), NOW())
    `);
    console.log("Inserted new tenant beanslab!");
  }
  
  client.end();
}).catch(console.error);
