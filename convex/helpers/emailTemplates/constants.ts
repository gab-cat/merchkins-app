/**
 * Email Template Constants
 * PREMIUM DARK MODE DESIGN SYSTEM - Merchkins
 * Features: Dark backgrounds, neon accents, glassmorphism, premium typography
 */

// =============================================================================
// BRAND COLORS - Dark Mode Premium Aesthetic
// =============================================================================

export const EMAIL_COLORS = {
  // Primary brand color - Electric Blue
  primary: '#3b82f6',
  primaryHover: '#60a5fa',
  primaryLight: 'rgba(59, 130, 246, 0.15)',
  primaryLighter: 'rgba(59, 130, 246, 0.08)',
  primaryDark: '#2563eb',
  primaryDeep: '#1d4ed8',

  // Accent color - Signature Neon Lime (the Merchkins signature!)
  accent: '#adfc04',
  accentHover: '#c4ff3d',
  accentDark: '#8bd000',
  accentDeep: '#6ba300',
  accentGlow: 'rgba(173, 252, 4, 0.25)',
  accentSubtle: 'rgba(173, 252, 4, 0.12)',

  // Status colors - Vibrant neons that pop on dark
  success: '#22c55e',
  successLight: 'rgba(34, 197, 94, 0.15)',
  successDark: '#16a34a',
  successGlow: 'rgba(34, 197, 94, 0.25)',

  warning: '#fbbf24',
  warningLight: 'rgba(251, 191, 36, 0.15)',
  warningDark: '#f59e0b',
  warningGlow: 'rgba(251, 191, 36, 0.25)',

  error: '#f43f5e',
  errorLight: 'rgba(244, 63, 94, 0.15)',
  errorDark: '#e11d48',
  errorGlow: 'rgba(244, 63, 94, 0.25)',

  info: '#06b6d4',
  infoLight: 'rgba(6, 182, 212, 0.15)',
  infoDark: '#0891b2',

  // Dark mode base (primary palette)
  white: '#ffffff',
  offWhite: '#f8fafc',
  background: '#0a0a0b',
  backgroundAlt: '#111113',
  backgroundWarm: '#0d0d0f',
  surface: '#18181b',
  surfaceElevated: '#1f1f23',
  surfaceGlass: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderSubtle: 'rgba(255, 255, 255, 0.03)',
  borderAccent: 'rgba(173, 252, 4, 0.3)',

  // Dark mode colors
  dark: {
    background: '#0a0a0b',
    backgroundAlt: '#111113',
    surface: '#18181b',
    surfaceElevated: '#1f1f23',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    text: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
  },

  // Text colors - Optimized for dark backgrounds
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  textLight: '#52525b',
  textOnDark: '#fafafa',
  textOnAccent: '#0a1d66',
} as const;

// =============================================================================
// GRADIENTS - Premium Dark Mode Effects
// =============================================================================

export const EMAIL_GRADIENTS = {
  // Hero gradients - Dark & dramatic
  heroDark: 'linear-gradient(180deg, #0a0a0b 0%, #18181b 100%)',
  heroGlow: 'linear-gradient(135deg, #0a0a0b 0%, #1a1a2e 50%, #0a0a0b 100%)',
  heroAccent: 'linear-gradient(135deg, rgba(173, 252, 4, 0.1) 0%, transparent 50%, rgba(59, 130, 246, 0.1) 100%)',

  // Card backgrounds with subtle depth
  cardDark: 'linear-gradient(180deg, #18181b 0%, #111113 100%)',
  cardGlow: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)',
  cardAccent: 'linear-gradient(135deg, rgba(173, 252, 4, 0.05) 0%, transparent 50%)',

  // Status gradients - Subtle glow effects
  successGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
  warningGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
  errorGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.05) 100%)',
  primaryGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',

  // Neon accent glow
  accentGlow: 'radial-gradient(ellipse at top, rgba(173, 252, 4, 0.15) 0%, transparent 60%)',
  primaryGlow: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',

  // Mesh background
  meshDark:
    'radial-gradient(at 40% 20%, rgba(173, 252, 4, 0.08) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(59, 130, 246, 0.08) 0px, transparent 50%)',
} as const;

// =============================================================================
// TYPOGRAPHY - Premium & Distinctive
// =============================================================================

export const EMAIL_FONTS = {
  // Headings - Geist for ultra-modern feel
  heading: "'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  // Body - Geist Sans for clean readability
  body: "'Geist Sans', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  // Mono - For codes, prices, and emphasis
  mono: "'Geist Mono', 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
  // Display - For hero text
  display: "'Geist', 'SF Pro Display', -apple-system, sans-serif",
} as const;

export const EMAIL_FONT_SIZES = {
  xs: '11px',
  sm: '13px',
  base: '15px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '26px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '52px',
  hero: '48px',
} as const;

export const EMAIL_FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// =============================================================================
// SPACING - Generous & Breathing
// =============================================================================

export const EMAIL_SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '56px',
  '4xl': '72px',
  section: '64px',
} as const;

// =============================================================================
// BORDER RADIUS - Modern & Smooth
// =============================================================================

export const EMAIL_RADIUS = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '28px',
  full: '9999px',
} as const;

// =============================================================================
// SHADOWS - Subtle Depth for Dark Mode
// =============================================================================

export const EMAIL_SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
  glow: '0 0 40px rgba(59, 130, 246, 0.3)',
  accentGlow: '0 0 30px rgba(173, 252, 4, 0.4)',
  successGlow: '0 0 20px rgba(34, 197, 94, 0.3)',
  inner: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  card: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
} as const;

// =============================================================================
// LUCIDE ICONS - SVG Paths for inline use
// =============================================================================

export const LUCIDE_ICONS = {
  // Shopping & Orders
  shoppingBag:
    '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>',
  package:
    '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
  truck:
    '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
  mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',

  // Status & Feedback
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  alertCircle: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
  xCircle: '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',
  clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',

  // Money & Payments
  creditCard: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>',
  wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4z"></path>',
  banknote: '<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 17.5v-11"></path>',
  gift: '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
  ticket:
    '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path>',

  // Communication
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
  messageCircle:
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>',
  send: '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',

  // User & Account
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  userPlus:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
  sparkles:
    '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path>',

  // Navigation
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>',
  externalLink:
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',

  // Store & Shopping
  store:
    '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><rect x="2" y="7" width="20" height="5"></rect>',
  tag: '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',

  // Misc
  refresh:
    '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
  info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
  award: '<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>',
  thumbsUp:
    '<path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>',
  building:
    '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>',
} as const;

// =============================================================================
// BRAND ASSETS
// =============================================================================

export const EMAIL_ASSETS = {
  logoUrl: 'https://app.merchkins.com/images/logo.png',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com',
  supportEmail: 'support@merchkins.com',
  companyName: 'Merchkins',
  tagline: 'Your merch, your way.',
  socialLinks: {
    twitter: 'https://twitter.com/merchkins',
    instagram: 'https://instagram.com/merchkins',
    facebook: 'https://facebook.com/merchkins',
  },
} as const;

// =============================================================================
// EMAIL LAYOUT CONSTANTS
// =============================================================================

export const EMAIL_LAYOUT = {
  maxWidth: '600px',
  mobileBreakpoint: '480px',
  headerHeight: '180px',
  footerPadding: '48px',
} as const;
