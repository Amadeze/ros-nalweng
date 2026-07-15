const fs = require("fs");
const path = require("path");

const filePath = path.resolve("f:/Roastery Operating System/ros-app/src/app/tenant/[subdomain]/_components/TenantPortalClient.tsx");
let content = fs.readFileSync(filePath, "utf-8");

// Fix nested ternaries
content = content.replace(/\$\{isDark \? '\$\{isDark \? 'text-zinc-400' : 'text-zinc-500'\} hover:text-white' : 'text-zinc-500 hover:text-black'\}/g, 
  "${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}");

// Fix literal strings that have ${isDark} in them
content = content.replace(/className="([^"]*\$\{isDark[^"]*)"/g, "className={`$1`}");

fs.writeFileSync(filePath, content, "utf-8");
console.log("Fixed syntax errors");
