// =============================================================================
// THEME CONFIG — $10k Ultra-Premium Configuration Schema
// =============================================================================
// Ini adalah kontrak JSON yang mengatur SELURUH tampilan tema.
// Setiap tenant menyimpan ini di field `themeConfig` (Prisma Json).
// ThemeEngine membaca ini dan menginjeksi CSS custom properties.
// =============================================================================

export interface ThemeColors {
  /** Primary brand color — hex or CSS gradient string */
  primary: string;
  /** Secondary accent color */
  secondary: string;
  /** Background — hex or gradient string like "linear-gradient(135deg, #0a0a0a, #1a1a2e)" */
  background: string;
  /** Surface color for cards, panels */
  surface: string;
  /** Text color on background */
  text: string;
  /** Muted text color */
  textMuted: string;
  /** Border/separator color */
  border: string;
  /** Accent for CTAs, highlights */
  accent: string;
}

export interface ThemeTypography {
  /** Font family category: 'serif' | 'sans' | 'mono' | or a specific Google Font name */
  fontFamily: string;
  /** Display/heading font (can differ from body) */
  displayFont: string;
  /** Base font size in px */
  baseFontSize: number;
  /** Font weight for body text: 300-900 */
  bodyWeight: number;
  /** Font weight for headings: 300-900 */
  headingWeight: number;
  /** Letter spacing for headings in em */
  headingTracking: number;
  /** Line height ratio for body text */
  bodyLineHeight: number;
  /** Text transform for headings: 'none' | 'uppercase' | 'capitalize' */
  headingTransform: 'none' | 'uppercase' | 'capitalize';
}

export interface ThemeShadows {
  /** Shadow preset: 'none' | 'soft' | 'sharp' | 'deep3d' | 'glow' | 'brutalist' */
  type: 'none' | 'soft' | 'sharp' | 'deep3d' | 'glow' | 'brutalist';
  /** Shadow color — hex with alpha or rgba */
  color: string;
  /** Shadow intensity 0-100 */
  intensity: number;
}

export interface ThemeAnimations {
  /** Animation level: 'none' | 'subtle' | 'moderate' | 'high-tech' | 'cinematic' */
  level: 'none' | 'subtle' | 'moderate' | 'high-tech' | 'cinematic';
  /** Easing curve name or array [x1,y1,x2,y2] */
  easing: string | number[];
  /** Duration multiplier — 1.0 = normal, 0.5 = fast, 2.0 = slow */
  durationScale: number;
  /** Enable scroll-triggered animations */
  scrollTrigger: boolean;
  /** Enable hover micro-interactions */
  hoverEffects: boolean;
}

export interface ThemeLayout {
  /** Border radius preset in px */
  borderRadius: number;
  /** Border thickness in px */
  borderWidth: number;
  /** Content max width in px */
  maxWidth: number;
  /** Spacing scale multiplier — 1.0 = normal */
  spacingScale: number;
  /** Card style: 'flat' | 'elevated' | 'outlined' | 'glass' */
  cardStyle: 'flat' | 'elevated' | 'outlined' | 'glass';
  /** Header style: 'fixed' | 'static' | 'floating' */
  headerStyle: 'fixed' | 'static' | 'floating';
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
  layout: ThemeLayout;
}

export const THEME_PRESET_ALIASES: Record<string, string> = {
  heritage: 'vintage',
  neomodern: 'bauhaus',
  cyber: 'cyberpunk',
  botanical: 'organic',
  editorial: 'magazine',
  liquid: 'glass',
  industrial: 'industrial',
  club: 'organic',
  luxury: 'cinematic',
  playful: 'neobrutalism',
  classic: 'cinematic',
  futuristic: 'cyberpunk',
  minimalist: 'bauhaus',
  modern: 'bauhaus',
  bento: 'bauhaus',
};

// =============================================================================
// PRESET CONFIGURATIONS — 10 Premium Themes
// =============================================================================

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  // ─── 1. VINTAGE ───────────────────────────────────────────────────────
  vintage: {
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      background: '#F4EBD0',
      surface: '#E8DCC8',
      text: '#3B2F2F',
      textMuted: '#6B5B4F',
      border: '#C4A882',
      accent: '#C0392B',
    },
    typography: {
      fontFamily: 'Playfair Display',
      displayFont: 'Playfair Display',
      baseFontSize: 17,
      bodyWeight: 400,
      headingWeight: 700,
      headingTracking: 0.08,
      bodyLineHeight: 1.75,
      headingTransform: 'uppercase',
    },
    shadows: { type: 'soft', color: 'rgba(59,47,47,0.15)', intensity: 40 },
    animations: { level: 'subtle', easing: [0.25, 0.1, 0.25, 1], durationScale: 1.3, scrollTrigger: true, hoverEffects: true },
    layout: { borderRadius: 0, borderWidth: 2, maxWidth: 1200, spacingScale: 1.2, cardStyle: 'outlined', headerStyle: 'static' },
  },

  // ─── 2. CYBERPUNK ─────────────────────────────────────────────────────
  cyberpunk: {
    colors: {
      primary: '#00FF41',
      secondary: '#FF00FF',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0d001a 100%)',
      surface: 'rgba(0,255,65,0.05)',
      text: '#00FF41',
      textMuted: 'rgba(0,255,65,0.6)',
      border: 'rgba(0,255,65,0.2)',
      accent: '#FF00FF',
    },
    typography: {
      fontFamily: 'JetBrains Mono',
      displayFont: 'Orbitron',
      baseFontSize: 15,
      bodyWeight: 400,
      headingWeight: 900,
      headingTracking: 0.15,
      bodyLineHeight: 1.6,
      headingTransform: 'uppercase',
    },
    shadows: { type: 'glow', color: 'rgba(0,255,65,0.4)', intensity: 70 },
    animations: { level: 'high-tech', easing: [0.77, 0, 0.175, 1], durationScale: 0.8, scrollTrigger: true, hoverEffects: true },
    layout: { borderRadius: 2, borderWidth: 1, maxWidth: 1400, spacingScale: 1.0, cardStyle: 'outlined', headerStyle: 'fixed' },
  },

  // ─── 3. BAUHAUS ───────────────────────────────────────────────────────
  bauhaus: {
    colors: {
      primary: '#E53935',
      secondary: '#1565C0',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#212121',
      textMuted: '#757575',
      border: '#212121',
      accent: '#FFD600',
    },
    typography: {
      fontFamily: 'DM Sans',
      displayFont: 'DM Sans',
      baseFontSize: 16,
      bodyWeight: 400,
      headingWeight: 800,
      headingTracking: -0.02,
      bodyLineHeight: 1.6,
      headingTransform: 'uppercase',
    },
    shadows: { type: 'sharp', color: '#212121', intensity: 100 },
    animations: { level: 'moderate', easing: [0.16, 1, 0.3, 1], durationScale: 0.9, scrollTrigger: true, hoverEffects: true },
    layout: { borderRadius: 0, borderWidth: 3, maxWidth: 1200, spacingScale: 1.1, cardStyle: 'outlined', headerStyle: 'static' },
  },

  // ─── 4. MAGAZINE ──────────────────────────────────────────────────────
  magazine: {
    colors: {
      primary: '#1A1A1A',
      secondary: '#C5A47E',
      background: '#FEFCF6',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textMuted: '#8E8E8E',
      border: '#E5E1DA',
      accent: '#C5A47E',
    },
    typography: {
      fontFamily: 'Source Serif 4',
      displayFont: 'Source Serif 4',
      baseFontSize: 18,
      bodyWeight: 400,
      headingWeight: 700,
      headingTracking: -0.03,
      bodyLineHeight: 1.8,
      headingTransform: 'none',
    },
    shadows: { type: 'soft', color: 'rgba(0,0,0,0.06)', intensity: 30 },
    animations: { level: 'subtle', easing: [0.22, 1, 0.36, 1], durationScale: 1.2, scrollTrigger: true, hoverEffects: true },
    layout: { borderRadius: 4, borderWidth: 1, maxWidth: 1100, spacingScale: 1.3, cardStyle: 'flat', headerStyle: 'static' },
  },

  // ─── 5. ORGANIC ───────────────────────────────────────────────────────
  organic: {
    colors: {
      primary: '#4A7C59',
      secondary: '#8B6914',
      background: '#F5F0E8',
      surface: '#FFFDF7',
      text: '#2D3A2D',
      textMuted: '#6B7B6B',
      border: '#D4CBB8',
      accent: '#D4A03C',
    },
    typography: {
      fontFamily: 'Nunito',
      displayFont: 'Nunito',
      baseFontSize: 17,
      bodyWeight: 400,
      headingWeight: 700,
      headingTracking: -0.01,
      bodyLineHeight: 1.7,
      headingTransform: 'none',
    },
    shadows: { type: 'soft', color: 'rgba(74,124,89,0.12)', intensity: 35 },
    animations: { level: 'moderate', easing: [0.34, 1.56, 0.64, 1], durationScale: 1.1, scrollTrigger: true, hoverEffects: true },
    layout: { borderRadius: 24, borderWidth: 2, maxWidth: 1200, spacingScale: 1.15, cardStyle: 'elevated', headerStyle: 'floating' },
  },

  // ─── 6. INDUSTRIAL ────────────────────────────────────────────────────
  industrial: {
    colors: {
      primary: '#E8E8E8',
      secondary: '#FFD600',
      background: '#1A1A1A',
      surface: '#242424',
      text: '#E8E8E8',
      textMuted: '#888888',
      border: '#333333',
      accent: '#FFD600',
    },
    typography: {
      fontFamily: 'Space Mono',
      displayFont: 'Space Grotesk',
      baseFontSize: 15,
      bodyWeight: 400,
      headingWeight: 700,
      headingTracking: 0.05,
      bodyLineHeight: 1.6,
      headingTransform: 'uppercase',
    },
    shadows: { type: 'none', color: 'transparent', intensity: 0 },
    animations: { level: 'moderate', easing: [0.16, 1, 0.3, 1], durationScale: 0.7, scrollTrigger: true, hoverEffects: true },
    layout: { borderRadius: 0, borderWidth: 1, maxWidth: 1400, spacingScale: 1.0, cardStyle: 'outlined', headerStyle: 'fixed' },
  },

  // ─── 7. GLASSMORPHISM ─────────────────────────────────────────────────
  glass: {
    colors: {
      primary: '#818CF8',
      secondary: '#F472B6',
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A0A2E 50%, #0F172A 100%)',
      surface: 'rgba(255,255,255,0.05)',
      text: '#F8FAFC',
      textMuted: 'rgba(248,250,252,0.6)',
      border: 'rgba(255,255,255,0.1)',
      accent: '#A78BFA',
    },
    typography: {
      fontFamily: 'Inter',
      displayFont: 'Inter',
      baseFontSize: 16,
      bodyWeight: 400,
      headingWeight: 600,
      headingTracking: -0.03,
      bodyLineHeight: 1.6,
      headingTransform: 'none',
    },
    shadows: { type: 'glow', color: 'rgba(129,140,248,0.2)', intensity: 50 },
    animations: { level: 'moderate', easing: [0.16, 1, 0.3, 1], durationScale: 1.0, scrollTrigger: true, hoverEffects: true },
    layout: { borderRadius: 24, borderWidth: 1, maxWidth: 1200, spacingScale: 1.1, cardStyle: 'glass', headerStyle: 'floating' },
  },

  // ─── 8. CINEMATIC DARK ────────────────────────────────────────────────
  cinematic: {
    colors: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0',
      background: '#000000',
      surface: '#0A0A0A',
      text: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.4)',
      border: 'rgba(255,255,255,0.08)',
      accent: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter',
      displayFont: 'Inter',
      baseFontSize: 17,
      bodyWeight: 300,
      headingWeight: 300,
      headingTracking: -0.04,
      bodyLineHeight: 1.7,
      headingTransform: 'none',
    },
    shadows: { type: 'none', color: 'transparent', intensity: 0 },
    animations: { level: 'cinematic', easing: [0.16, 1, 0.3, 1], durationScale: 2.0, scrollTrigger: true, hoverEffects: true },
    layout: { borderRadius: 0, borderWidth: 0, maxWidth: 1400, spacingScale: 1.5, cardStyle: 'flat', headerStyle: 'static' },
  },

  // ─── 9. ZEN MINIMALIST ────────────────────────────────────────────────
  zen: {
    colors: {
      primary: '#2C2C2C',
      secondary: '#9CA3AF',
      background: '#F9F7F2',
      surface: '#FFFFFF',
      text: '#2C2C2C',
      textMuted: '#9CA3AF',
      border: '#E8E4DD',
      accent: '#2C2C2C',
    },
    typography: {
      fontFamily: 'EB Garamond',
      displayFont: 'EB Garamond',
      baseFontSize: 18,
      bodyWeight: 400,
      headingWeight: 400,
      headingTracking: 0.08,
      bodyLineHeight: 1.85,
      headingTransform: 'uppercase',
    },
    shadows: { type: 'none', color: 'transparent', intensity: 0 },
    animations: { level: 'subtle', easing: [0.22, 1, 0.36, 1], durationScale: 1.5, scrollTrigger: true, hoverEffects: false },
    layout: { borderRadius: 0, borderWidth: 1, maxWidth: 900, spacingScale: 1.5, cardStyle: 'flat', headerStyle: 'static' },
  },

  // ─── 10. NEO-BRUTALISM ────────────────────────────────────────────────
  neobrutalism: {
    colors: {
      primary: '#111111',
      secondary: '#4ECDC4',
      background: '#FFE873',
      surface: '#FFFFFF',
      text: '#111111',
      textMuted: '#333333',
      border: '#111111',
      accent: '#FF5C5C',
    },
    typography: {
      fontFamily: 'Space Grotesk',
      displayFont: 'Space Grotesk',
      baseFontSize: 16,
      bodyWeight: 500,
      headingWeight: 900,
      headingTracking: -0.04,
      bodyLineHeight: 1.5,
      headingTransform: 'uppercase',
    },
    shadows: { type: 'brutalist', color: '#111111', intensity: 100 },
    animations: { level: 'moderate', easing: [0.34, 1.56, 0.64, 1], durationScale: 0.6, scrollTrigger: true, hoverEffects: true },
    layout: { borderRadius: 0, borderWidth: 4, maxWidth: 1300, spacingScale: 1.0, cardStyle: 'outlined', headerStyle: 'fixed' },
  },
};

// =============================================================================
// DEFAULT CONFIG
// =============================================================================
export const DEFAULT_THEME_CONFIG: ThemeConfig = THEME_PRESETS.glass;

export function getThemePreset(layoutStyle?: string | null): ThemeConfig {
  const normalized = layoutStyle?.toLowerCase() || 'neomodern';
  const presetId = THEME_PRESET_ALIASES[normalized] || normalized;
  return THEME_PRESETS[presetId] || THEME_PRESETS.bauhaus;
}
