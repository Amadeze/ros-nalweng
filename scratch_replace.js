const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/keuangan/actions.ts', 'utf8');

const regex = /const user = await prisma\.user\.upsert\(\{\r?\n\s*where: \{ email: "system@ros\.internal" \},\r?\n\s*update: \{\},\r?\n\s*create: \{ name: "System", email: "system@ros\.internal", password: "system", role: "OWNER" \},\r?\n\s*\}\);/g;

content = content.replace(regex, 'const userId = await getSystemUserId();');

fs.writeFileSync('src/app/(dashboard)/keuangan/actions.ts', content);
