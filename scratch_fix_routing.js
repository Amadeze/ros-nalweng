const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('f:/Roastery Operating System/ros-app/src/app/tenant/[subdomain]/_components/TenantPortalClient.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const imports = `import { VintageTheme } from "./themes/VintageTheme";
import { CyberpunkTheme } from "./themes/CyberpunkTheme";
import { BauhausTheme } from "./themes/BauhausTheme";
import { MagazineTheme } from "./themes/MagazineTheme";
import { OrganicTheme } from "./themes/OrganicTheme";
import { IndustrialTheme } from "./themes/IndustrialTheme";
`;

content = content.replace('import { useState, useEffect, useRef } from "react";', 'import { useState, useEffect, useRef } from "react";\n' + imports);

// We need to find the start of the `if (layoutStyle === "vintage")` block.
const splitIndex = content.indexOf('  // ==========================================\n  // RENDER: RETRO (BRUTALIST)');
if (splitIndex === -1) {
  console.log("Could not find split point");
  process.exit(1);
}

// We need to find the start of `  else {` block which is the fallback.
// In the file, the final fallback is `  else {\n    return (\n      <div className={\`min-h-screen`
const fallbackIndex = content.lastIndexOf('  else {\n    return (\n      <div className={`min-h-screen');

if (fallbackIndex === -1) {
  console.log("Could not find fallback point");
  process.exit(1);
}

const before = content.substring(0, splitIndex);
const fallback = content.substring(fallbackIndex);

const newRouting = `  const themeProps = {
    tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
    customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
    catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
  };

  if (layoutStyle === "vintage" || layoutStyle === "retro") {
    return <VintageTheme {...themeProps} />;
  } else if (layoutStyle === "cyberpunk" || layoutStyle === "futuristic") {
    return <CyberpunkTheme {...themeProps} />;
  } else if (layoutStyle === "bauhaus" || layoutStyle === "minimalist") {
    return <BauhausTheme {...themeProps} />;
  } else if (layoutStyle === "magazine" || layoutStyle === "editorial") {
    return <MagazineTheme {...themeProps} />;
  } else if (layoutStyle === "organic") {
    return <OrganicTheme {...themeProps} />;
  } else if (layoutStyle === "industrial") {
    return <IndustrialTheme {...themeProps} />;
  }
`;

const finalContent = before + newRouting + '\n' + fallback;

fs.writeFileSync(targetPath, finalContent);
console.log("Updated TenantPortalClient.tsx successfully. Removed " + (content.length - finalContent.length) + " bytes.");
