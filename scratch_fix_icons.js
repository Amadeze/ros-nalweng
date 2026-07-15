const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('f:/Roastery Operating System/ros-app/src/app/tenant/[subdomain]/_components/TenantPortalClient.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const icons = ['Package', 'Coffee', 'ShoppingCart', 'CaretRight', 'Phone', 'X', 'Plus', 'Minus', 'At', 'EnvelopeSimple', 'MapPin', 'ArrowRight'];

// Using simple string replacement since negative lookbehind/lookahead in RegExp via string might be tricky to escape.
// We will simply replace `<IconName ` with `<IconName {...iconProps} `
// and `<IconName>` with `<IconName {...iconProps}>`
// Then, to prevent duplicates like `{...iconProps} {...iconProps}`, we'll just run a cleanup step at the end.

icons.forEach(icon => {
  content = content.replace(new RegExp("<" + icon + " ", "g"), "<" + icon + " {...iconProps} ");
  content = content.replace(new RegExp("<" + icon + ">", "g"), "<" + icon + " {...iconProps}>");
});

// Clean up double applications
content = content.replace(/\{\.\.\.iconProps\} \{\.\.\.iconProps\}/g, "{...iconProps}");
content = content.replace(/\{\.\.\.iconProps\} \{\.\.\.iconProps\}/g, "{...iconProps}");
content = content.replace(/\{\.\.\.iconProps\} \{\.\.\.iconProps\}/g, "{...iconProps}");

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Injected iconProps safely!");
