const FONT_STACKS: Record<string, string> = {
  "Playfair Display": "var(--font-playfair-display), Georgia, serif",
  "JetBrains Mono": "var(--font-jetbrains-mono), var(--font-geist-mono), monospace",
  Orbitron: "var(--font-orbitron), var(--font-geist-sans), sans-serif",
  "DM Sans": "var(--font-dm-sans), var(--font-geist-sans), sans-serif",
  "Source Serif 4": "var(--font-source-serif), Georgia, serif",
  Nunito: "var(--font-nunito), var(--font-geist-sans), sans-serif",
  "Space Mono": "var(--font-space-mono), var(--font-geist-mono), monospace",
  "Space Grotesk": "var(--font-space-grotesk), var(--font-geist-sans), sans-serif",
  Inter: "var(--font-inter), var(--font-geist-sans), sans-serif",
  "EB Garamond": "var(--font-eb-garamond), Georgia, serif",
  serif: "var(--font-playfair-display), Georgia, serif",
  sans: "var(--font-inter), var(--font-geist-sans), sans-serif",
  mono: "var(--font-jetbrains-mono), var(--font-geist-mono), monospace",
};

export function resolveThemeFontFamily(name: string) {
  return FONT_STACKS[name] || "var(--font-geist-sans), Arial, sans-serif";
}
