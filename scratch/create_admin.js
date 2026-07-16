require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const tenantRes = await pool.query("SELECT id FROM tenants WHERE subdomain = 'beanslab'");
  if (tenantRes.rows.length === 0) {
    console.error("Tenant 'beanslab' not found.");
    return;
  }
  const tenantId = tenantRes.rows[0].id;

  const email = 'admin@beanslab.com';
  const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (userRes.rows.length > 0) {
    console.log("User admin@beanslab.com already exists!");
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Generate CUID for ID (we can just use a random string or a simple generator, but Postgres UUID might be better, wait prisma uses cuid)
  // I will just use a simple random string for CUID since Prisma accepts string ID
  const cuid = 'c' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);

  await pool.query(
    "INSERT INTO users (id, \"tenantId\", name, email, password, role, \"updatedAt\") VALUES ($1, $2, $3, $4, $5, $6, NOW())",
    [cuid, tenantId, 'Beanslab Admin', email, hashedPassword, 'SUPERADMIN']
  );

  console.log('Successfully created SUPERADMIN for beanslab:', email);
}

main()
  .catch(console.error)
  .finally(() => pool.end());
