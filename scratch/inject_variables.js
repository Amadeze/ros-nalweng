const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

const colors = {
    "on-error": "#690005",
    "surface": "#17130f",
    "inverse-primary": "#7d562d",
    "on-primary-container": "#3a2512",
    "glow-amber": "rgba(212, 163, 115, 0.15)",
    "on-surface": "#eae1db",
    "roast-amber": "#A67C52",
    "surface-container-lowest": "#110d0a",
    "surface-container-high": "#2e2925",
    "on-primary-fixed": "#2c1600",
    "on-background": "#fdfbf9",
    "primary-fixed": "#ffdcbd",
    "error": "#ffb4ab",
    "outline": "#9c8e82",
    "on-secondary-fixed": "#1b1b1e",
    "deep-obsidian": "#0e0c0a",
    "on-tertiary": "#06344c",
    "tertiary-fixed-dim": "#a6cbe9",
    "on-secondary-fixed-variant": "#47464a",
    "surface-dim": "#17130f",
    "inverse-on-surface": "#342f2c",
    "on-primary-fixed-variant": "#623f18",
    "primary-fixed-dim": "#f0bd8b",
    "vapor-silver": "#E2E2E2",
    "surface-container": "#1c1815",
    "tertiary-fixed": "#c9e6ff",
    "on-secondary-container": "#b6b4b8",
    "error-container": "#93000a",
    "tertiary": "#a7ccea",
    "secondary": "#c8c6ca",
    "on-tertiary-fixed": "#001e2f",
    "inverse-surface": "#eae1db",
    "surface-container-low": "#1f1b17",
    "tertiary-container": "#8cb1ce",
    "on-error-container": "#ffdad6",
    "primary-container": "#d4a373",
    "secondary-container": "#47464a",
    "on-secondary": "#303033",
    "on-tertiary-container": "#1d445d",
    "surface-container-highest": "#393430",
    "surface-bright": "#3d3834",
    "surface-variant": "#2b2520",
    "on-surface-variant": "#d4c4b7"
};

const spacing = {
    "container-margin": "32px",
    "stack-lg": "80px",
    "gutter": "32px",
    "base": "8px",
    "stack-sm": "16px",
    "stack-md": "40px"
};

let themeInject = '';
for (const [k, v] of Object.entries(colors)) {
    themeInject += `  --color-${k}: ${v};\n`;
}
for (const [k, v] of Object.entries(spacing)) {
    themeInject += `  --spacing-${k}: ${v};\n`;
}

// Fonts and font sizes
themeInject += `  --font-body-lg: "DM Sans";
  --font-headline-lg: "DM Sans";
  --font-label-caps: "DM Sans";
  --font-display-lg: "DM Sans";
  --font-metric-xl: "DM Sans";
  --font-headline-lg-mobile: "DM Sans";
  --font-headline-md: "DM Sans";
  --font-body-md: "DM Sans";

  --text-body-lg: 18px;
  --text-body-lg--line-height: 28px;
  
  --text-headline-lg: 48px;
  --text-headline-lg--line-height: 56px;
  
  --text-label-caps: 13px;
  --text-label-caps--line-height: 16px;
  
  --text-display-lg: 72px;
  --text-display-lg--line-height: 80px;
  
  --text-metric-xl: 56px;
  --text-metric-xl--line-height: 64px;
  
  --text-headline-md: 28px;
  --text-headline-md--line-height: 36px;
  
  --text-body-md: 16px;
  --text-body-md--line-height: 24px;
`;

if (!css.includes('--color-deep-obsidian')) {
    css = css.replace('@theme inline {', `@theme inline {\n${themeInject}`);
}

// Add the custom CSS
const customCss = `
@layer utilities {
    .glass-panel {
        background: rgba(28, 24, 21, 0.4);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(212, 163, 115, 0.1);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .glass-panel:hover {
        border-color: rgba(212, 163, 115, 0.3);
        background: rgba(28, 24, 21, 0.6);
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(212, 163, 115, 0.05);
    }

    @keyframes smoothFadeUp {
        0% {
            opacity: 0;
            transform: translateY(30px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-up {
        opacity: 0;
        animation: smoothFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-400 { animation-delay: 400ms; }

    .reveal-on-scroll {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal-on-scroll.is-visible {
        opacity: 1;
        transform: translateY(0);
    }

    .nav-blur {
        background: rgba(14, 12, 10, 0.6);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
}
`;

if (!css.includes('.glass-panel')) {
    css += customCss;
}

fs.writeFileSync(cssPath, css);
console.log('Injected tailwind values to globals.css');
