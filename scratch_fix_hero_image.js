const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('f:/Roastery Operating System/ros-app/src/app/tenant/[subdomain]/_components/TenantPortalClient.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Replace all instances of tenant.backgroundImageUrl with (tenant.backgroundImageUrl || tenant.heroImageUrl)
// but be careful not to nest it if it's already there.

content = content.replace(/tenant\.backgroundImageUrl/g, '(tenant.backgroundImageUrl || tenant.heroImageUrl)');

// Clean up double replacements if I run this multiple times by accident
content = content.replace(/\(\(tenant\.backgroundImageUrl \|\| tenant\.heroImageUrl\)\)/g, '(tenant.backgroundImageUrl || tenant.heroImageUrl)');
content = content.replace(/\(tenant\.backgroundImageUrl \|\| tenant\.heroImageUrl\) \|\| tenant\.heroImageUrl/g, '(tenant.backgroundImageUrl || tenant.heroImageUrl)');

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Replaced backgroundImageUrl with fallback!");
