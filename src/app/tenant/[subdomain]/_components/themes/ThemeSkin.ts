// =============================================================================
// THEME SKIN — Interface for theme-specific visual styling
// =============================================================================
// Each theme defines a skin object that controls visual appearance.
// The layout components consume these skins instead of switch statements.
// =============================================================================

export interface ThemeSkin {
  /** Outermost wrapper — background, text color, font family */
  containerClass: string;
  /** Card surfaces — background, border, shadow, radius */
  cardClass: string;
  /** Primary CTA button */
  buttonPrimaryClass: string;
  /** Secondary/outline button */
  buttonSecondaryClass: string;
  /** Hero image frame — border, shadow, radius treatment */
  heroImageClass: string;
  /** Optional decorative overlay (heritage texture, cyber scanlines) */
  overlay?: React.ReactNode;
  /** Optional hero badge (e.g. cyber terminal status) */
  heroBadge?: React.ReactNode;
  /** Input field styling */
  inputClass: string;
  /** Badge/chip styling */
  badgeClass: string;
  /** Section divider style */
  dividerClass: string;
  /** Price highlight color */
  priceClass: string;
  /** Accent color for icons and highlights */
  accentClass: string;
}
