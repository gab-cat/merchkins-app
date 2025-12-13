/**
 * Email Template Builders
 * PREMIUM DARK MODE DESIGN - Sleek, modern, distinctive
 * Features: Dark backgrounds, neon accents, glassmorphism effects
 */

import {
  EMAIL_COLORS,
  EMAIL_FONTS,
  EMAIL_FONT_SIZES,
  EMAIL_SPACING,
  EMAIL_RADIUS,
  EMAIL_ASSETS,
  EMAIL_LAYOUT,
  EMAIL_GRADIENTS,
  EMAIL_SHADOWS,
} from './constants';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type EmailStatusType = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

export interface EmailButton {
  text: string;
  url: string;
  variant?: EmailStatusType;
}

export interface EmailHeader {
  title: string;
  subtitle?: string;
  statusType?: EmailStatusType;
  showLogo?: boolean;
}

export interface EmailCard {
  title?: string;
  content: string;
  statusType?: EmailStatusType;
  showBorder?: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format currency to Philippine Peso
 */
export const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date to readable format
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date to short format
 */
export const formatDateShort = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get color based on status type
 */
const getStatusColor = (statusType: EmailStatusType): string => {
  switch (statusType) {
    case 'success':
      return EMAIL_COLORS.success;
    case 'warning':
      return EMAIL_COLORS.warning;
    case 'error':
      return EMAIL_COLORS.error;
    case 'neutral':
      return EMAIL_COLORS.textMuted;
    case 'primary':
    default:
      return EMAIL_COLORS.accent;
  }
};

/**
 * Get light background color based on status type (for dark mode)
 */
const getStatusLightColor = (statusType: EmailStatusType): string => {
  switch (statusType) {
    case 'success':
      return EMAIL_COLORS.successLight;
    case 'warning':
      return EMAIL_COLORS.warningLight;
    case 'error':
      return EMAIL_COLORS.errorLight;
    case 'neutral':
      return EMAIL_COLORS.surfaceElevated;
    case 'primary':
    default:
      return EMAIL_COLORS.primaryLight;
  }
};

/**
 * Get glow shadow based on status type
 */
const getStatusGlow = (statusType: EmailStatusType): string => {
  switch (statusType) {
    case 'success':
      return EMAIL_SHADOWS.successGlow;
    case 'warning':
      return `0 0 20px rgba(251, 191, 36, 0.3)`;
    case 'error':
      return `0 0 20px rgba(244, 63, 94, 0.3)`;
    case 'neutral':
      return 'none';
    case 'primary':
    default:
      return EMAIL_SHADOWS.accentGlow;
  }
};

// =============================================================================
// EMAIL COMPONENT BUILDERS
// =============================================================================

/**
 * Create the email wrapper with proper HTML structure - PREMIUM DARK MODE
 */
export const createEmailWrapper = (content: string, title: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Load Geist font */
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');
    
    /* Dark mode preference */
    :root { color-scheme: dark; }
    
    /* Reset styles */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${EMAIL_COLORS.background} !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    
    /* Premium accent glow animation */
    @keyframes subtleGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }
    
    /* Mobile styles */
    @media only screen and (max-width: 480px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
      .mobile-full-width { width: 100% !important; }
      .hero-title { font-size: 32px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_COLORS.background}; font-family: ${EMAIL_FONTS.body};">
  <!-- Outer wrapper with mesh gradient effect -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${EMAIL_COLORS.background};">
    <tr>
      <td style="padding: ${EMAIL_SPACING['2xl']} ${EMAIL_SPACING.md};">
        <!-- Main container with glassmorphism -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="${EMAIL_LAYOUT.maxWidth}" align="center" class="email-container" style="max-width: ${EMAIL_LAYOUT.maxWidth}; margin: 0 auto; background-color: ${EMAIL_COLORS.surface}; border-radius: ${EMAIL_RADIUS.xl}; overflow: hidden; border: 1px solid ${EMAIL_COLORS.border}; box-shadow: ${EMAIL_SHADOWS.xl};">
          ${content}
        </table>
        
        <!-- Footer branding outside card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="${EMAIL_LAYOUT.maxWidth}" align="center" style="max-width: ${EMAIL_LAYOUT.maxWidth}; margin: ${EMAIL_SPACING.lg} auto 0;">
          <tr>
            <td style="text-align: center; padding: ${EMAIL_SPACING.md};">
              <p style="margin: 0; color: ${EMAIL_COLORS.textLight}; font-size: ${EMAIL_FONT_SIZES.xs}; letter-spacing: 0.5px;">
                Powered by <span style="color: ${EMAIL_COLORS.accent}; font-weight: 600;">MERCHKINS</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Create email header with premium dark design
 */
export const createEmailHeader = (options: EmailHeader): string => {
  const { title, subtitle, statusType = 'primary', showLogo = true } = options;
  const accentColor = getStatusColor(statusType);
  const glowEffect = getStatusGlow(statusType);

  return `
<tr>
  <td style="background: ${EMAIL_COLORS.surfaceElevated}; position: relative; overflow: hidden;">
    <!-- Gradient overlay for depth -->
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 100%; background: radial-gradient(ellipse at top, ${accentColor}15 0%, transparent 70%); pointer-events: none;"></div>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: ${EMAIL_SPACING['2xl']} ${EMAIL_SPACING.xl}; text-align: center; position: relative;">
          ${
            showLogo
              ? `
          <!-- Logo with glow effect -->
          <div style="margin: 0 auto ${EMAIL_SPACING.lg}; width: 56px; height: 56px; background: ${EMAIL_COLORS.surface}; border-radius: ${EMAIL_RADIUS.lg}; display: inline-block; border: 1px solid ${EMAIL_COLORS.border}; box-shadow: ${glowEffect};">
            <img src="${EMAIL_ASSETS.logoUrl}" alt="${EMAIL_ASSETS.companyName}" width="56" height="56" style="display: block; border-radius: ${EMAIL_RADIUS.lg};" />
          </div>
          `
              : ''
          }
          
          <!-- Title with accent underline -->
          <h1 class="hero-title" style="margin: 0 0 ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.textPrimary}; font-family: ${EMAIL_FONTS.heading}; font-size: ${EMAIL_FONT_SIZES['2xl']}; font-weight: 700; line-height: 1.2; letter-spacing: -0.5px;">
            ${title}
          </h1>
          
          <!-- Accent line -->
          <div style="width: 48px; height: 3px; background: ${accentColor}; margin: ${EMAIL_SPACING.md} auto; border-radius: ${EMAIL_RADIUS.full};"></div>
          
          ${
            subtitle
              ? `
          <p style="margin: 0; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.base}; font-weight: 400; letter-spacing: 0.3px;">
            ${subtitle}
          </p>
          `
              : ''
          }
        </td>
      </tr>
    </table>
  </td>
</tr>`;
};

/**
 * Create email body wrapper
 */
export const createEmailBody = (content: string): string => {
  return `
<tr>
  <td class="mobile-padding" style="padding: ${EMAIL_SPACING.xl} ${EMAIL_SPACING.xl}; background-color: ${EMAIL_COLORS.surface};">
    ${content}
  </td>
</tr>`;
};

/**
 * Create a paragraph
 */
export const createParagraph = (text: string, options?: { muted?: boolean; centered?: boolean }): string => {
  const color = options?.muted ? EMAIL_COLORS.textMuted : EMAIL_COLORS.textSecondary;
  const align = options?.centered ? 'center' : 'left';

  return `
<p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${color}; font-size: ${EMAIL_FONT_SIZES.base}; line-height: 1.7; text-align: ${align};">
  ${text}
</p>`;
};

/**
 * Create a CTA button - Premium neon style
 */
export const createButton = (button: EmailButton): string => {
  const isAccent = button.variant === 'primary' || button.variant === 'success';
  const bgColor = isAccent ? EMAIL_COLORS.accent : getStatusColor(button.variant || 'primary');
  const textColor = isAccent ? EMAIL_COLORS.textOnAccent : EMAIL_COLORS.white;
  const glow = getStatusGlow(button.variant || 'primary');

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: ${EMAIL_SPACING.lg} 0;">
  <tr>
    <td style="border-radius: ${EMAIL_RADIUS.md}; background-color: ${bgColor}; box-shadow: ${glow};">
      <a href="${button.url}" target="_blank" style="display: inline-block; padding: 14px ${EMAIL_SPACING.xl}; color: ${textColor}; font-family: ${EMAIL_FONTS.body}; font-size: ${EMAIL_FONT_SIZES.sm}; font-weight: 600; text-decoration: none; border-radius: ${EMAIL_RADIUS.md}; letter-spacing: 0.3px;">
        ${button.text} →
      </a>
    </td>
  </tr>
</table>`;
};

/**
 * Create centered button - Premium neon style
 */
export const createCenteredButton = (button: EmailButton): string => {
  const isAccent = button.variant === 'primary' || button.variant === 'success';
  const bgColor = isAccent ? EMAIL_COLORS.accent : getStatusColor(button.variant || 'primary');
  const textColor = isAccent ? EMAIL_COLORS.textOnAccent : EMAIL_COLORS.white;
  const glow = getStatusGlow(button.variant || 'primary');

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${EMAIL_SPACING.xl} 0;">
  <tr>
    <td align="center">
      <a href="${button.url}" target="_blank" style="display: inline-block; padding: 16px ${EMAIL_SPACING['2xl']}; background-color: ${bgColor}; color: ${textColor}; font-family: ${EMAIL_FONTS.body}; font-size: ${EMAIL_FONT_SIZES.base}; font-weight: 600; text-decoration: none; border-radius: ${EMAIL_RADIUS.md}; letter-spacing: 0.3px; box-shadow: ${glow};">
        ${button.text} →
      </a>
    </td>
  </tr>
</table>`;
};

/**
 * Create an info card - Glassmorphism style
 */
export const createCard = (options: EmailCard): string => {
  const { title, content, statusType = 'neutral', showBorder = true } = options;
  const borderColor = getStatusColor(statusType);
  const borderStyle = showBorder ? `border-left: 3px solid ${borderColor};` : '';

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 ${EMAIL_SPACING.md};">
  <tr>
    <td style="background-color: ${EMAIL_COLORS.surfaceElevated}; padding: ${EMAIL_SPACING.lg}; border-radius: ${EMAIL_RADIUS.md}; border: 1px solid ${EMAIL_COLORS.border}; ${borderStyle}">
      ${
        title
          ? `
      <h3 style="margin: 0 0 ${EMAIL_SPACING.sm}; color: ${borderColor}; font-family: ${EMAIL_FONTS.heading}; font-size: ${EMAIL_FONT_SIZES.base}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        ${title}
      </h3>
      `
          : ''
      }
      <div style="color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.sm}; line-height: 1.7;">
        ${content}
      </div>
    </td>
  </tr>
</table>`;
};

/**
 * Create a highlighted box (for important information) - Neon glow style
 */
export const createHighlightBox = (content: string, statusType: EmailStatusType = 'primary'): string => {
  const bgColor = getStatusLightColor(statusType);
  const borderColor = getStatusColor(statusType);

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${EMAIL_SPACING.md} 0;">
  <tr>
    <td style="background-color: ${bgColor}; padding: ${EMAIL_SPACING.md} ${EMAIL_SPACING.lg}; border-radius: ${EMAIL_RADIUS.md}; border: 1px solid ${borderColor}30;">
      <div style="color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.sm}; line-height: 1.7;">
        ${content}
      </div>
    </td>
  </tr>
</table>`;
};

/**
 * Create a large amount display (for payments/refunds) - Premium glassmorphism
 */
export const createAmountDisplay = (label: string, amount: string, statusType: EmailStatusType = 'primary'): string => {
  const accentColor = getStatusColor(statusType);
  const glow = getStatusGlow(statusType);

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${EMAIL_SPACING.md} 0 ${EMAIL_SPACING.xl};">
  <tr>
    <td style="background: ${EMAIL_COLORS.surfaceElevated}; padding: ${EMAIL_SPACING.xl} ${EMAIL_SPACING.lg}; border-radius: ${EMAIL_RADIUS.lg}; text-align: center; border: 1px solid ${EMAIL_COLORS.border}; position: relative; overflow: hidden;">
      <!-- Subtle glow effect -->
      <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 200px; height: 100px; background: radial-gradient(ellipse at center, ${accentColor}20 0%, transparent 70%); pointer-events: none;"></div>
      
      <p style="margin: 0 0 ${EMAIL_SPACING.xs}; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.xs}; text-transform: uppercase; letter-spacing: 2px; font-weight: 500; position: relative;">
        ${label}
      </p>
      <p style="margin: 0; color: ${accentColor}; font-family: ${EMAIL_FONTS.mono}; font-size: ${EMAIL_FONT_SIZES['4xl']}; font-weight: 700; letter-spacing: -1px; position: relative; text-shadow: ${glow};">
        ${amount}
      </p>
    </td>
  </tr>
</table>`;
};

/**
 * Create a voucher code display - Premium neon ticket style
 */
export const createVoucherCode = (code: string, value: string): string => {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${EMAIL_SPACING.md} 0 ${EMAIL_SPACING.xl};">
  <tr>
    <td style="background: linear-gradient(135deg, ${EMAIL_COLORS.successLight} 0%, ${EMAIL_COLORS.surfaceElevated} 100%); padding: ${EMAIL_SPACING.xl}; border-radius: ${EMAIL_RADIUS.lg}; text-align: center; border: 2px dashed ${EMAIL_COLORS.success}; position: relative;">
      <p style="margin: 0 0 ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.success}; font-size: ${EMAIL_FONT_SIZES.xs}; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
        🎫 Your Voucher Code
      </p>
      
      <!-- Code box with glow -->
      <div style="background: ${EMAIL_COLORS.surface}; padding: ${EMAIL_SPACING.md} ${EMAIL_SPACING.lg}; border-radius: ${EMAIL_RADIUS.md}; margin: ${EMAIL_SPACING.md} 0; display: inline-block; border: 1px solid ${EMAIL_COLORS.border}; box-shadow: ${EMAIL_SHADOWS.successGlow};">
        <p style="margin: 0; color: ${EMAIL_COLORS.success}; font-family: ${EMAIL_FONTS.mono}; font-size: ${EMAIL_FONT_SIZES['2xl']}; font-weight: 700; letter-spacing: 3px;">
          ${code}
        </p>
      </div>
      
      <p style="margin: ${EMAIL_SPACING.sm} 0 0; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 700;">
        Value: <span style="color: ${EMAIL_COLORS.success};">${value}</span>
      </p>
    </td>
  </tr>
</table>`;
};

/**
 * Create a detail row (label: value) - Clean dark mode style
 */
export const createDetailRow = (label: string, value: string): string => {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: ${EMAIL_SPACING.sm};">
  <tr>
    <td width="40%" style="color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.sm}; padding: ${EMAIL_SPACING.xs} 0; vertical-align: top;">
      ${label}
    </td>
    <td width="60%" style="color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.sm}; font-weight: 500; padding: ${EMAIL_SPACING.xs} 0; text-align: right; vertical-align: top;">
      ${value}
    </td>
  </tr>
</table>`;
};

/**
 * Create a horizontal divider - Subtle gradient line
 */
export const createDivider = (): string => {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${EMAIL_SPACING.xl} 0;">
  <tr>
    <td style="height: 1px; background: linear-gradient(90deg, transparent 0%, ${EMAIL_COLORS.border} 20%, ${EMAIL_COLORS.border} 80%, transparent 100%);"></td>
  </tr>
</table>`;
};

/**
 * Create stat boxes (for showing metrics) - Premium glassmorphism
 */
export const createStatBoxes = (stats: Array<{ label: string; value: string; statusType?: EmailStatusType }>): string => {
  const statCells = stats
    .map((stat, index) => {
      const accentColor = getStatusColor(stat.statusType || 'primary');
      const padding = index < stats.length - 1 ? `padding-right: ${EMAIL_SPACING.sm};` : '';

      return `
    <td width="${Math.floor(100 / stats.length)}%" style="${padding}" class="mobile-stack">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="background-color: ${EMAIL_COLORS.surfaceElevated}; padding: ${EMAIL_SPACING.lg}; border-radius: ${EMAIL_RADIUS.md}; text-align: center; border: 1px solid ${EMAIL_COLORS.border};">
            <p style="margin: 0; color: ${accentColor}; font-family: ${EMAIL_FONTS.mono}; font-size: ${EMAIL_FONT_SIZES.xl}; font-weight: 700;">
              ${stat.value}
            </p>
            <p style="margin: ${EMAIL_SPACING.xs} 0 0; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.xs}; text-transform: uppercase; letter-spacing: 1px;">
              ${stat.label}
            </p>
          </td>
        </tr>
      </table>
    </td>`;
    })
    .join('');

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 ${EMAIL_SPACING.lg};">
  <tr>
    ${statCells}
  </tr>
</table>`;
};

/**
 * Create email footer - Minimal dark mode style
 */
export const createEmailFooter = (options?: { showSupportEmail?: boolean }): string => {
  const { showSupportEmail = true } = options || {};

  return `
<tr>
  <td style="background-color: ${EMAIL_COLORS.backgroundAlt}; padding: ${EMAIL_SPACING.xl}; border-top: 1px solid ${EMAIL_COLORS.border};">
    ${
      showSupportEmail
        ? `
    <p style="margin: 0 0 ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.xs}; text-align: center;">
      Questions? Reach out at <a href="mailto:${EMAIL_ASSETS.supportEmail}" style="color: ${EMAIL_COLORS.accent}; text-decoration: none; font-weight: 500;">${EMAIL_ASSETS.supportEmail}</a>
    </p>
    `
        : `
    <p style="margin: 0 0 ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.xs}; text-align: center;">
      This is an automated message from ${EMAIL_ASSETS.companyName}
    </p>
    `
    }
    <p style="margin: 0; color: ${EMAIL_COLORS.textLight}; font-size: ${EMAIL_FONT_SIZES.xs}; text-align: center;">
      © ${new Date().getFullYear()} ${EMAIL_ASSETS.companyName} — All rights reserved
    </p>
  </td>
</tr>`;
};

/**
 * Create an ordered list - Clean numbered style
 */
export const createOrderedList = (items: string[]): string => {
  const listItems = items
    .map(
      (item, index) => `
    <tr>
      <td style="width: 28px; vertical-align: top; padding: ${EMAIL_SPACING.sm} 0;">
        <span style="display: inline-block; width: 22px; height: 22px; background: ${EMAIL_COLORS.surfaceElevated}; border-radius: ${EMAIL_RADIUS.sm}; text-align: center; line-height: 22px; color: ${EMAIL_COLORS.accent}; font-size: ${EMAIL_FONT_SIZES.xs}; font-weight: 600; border: 1px solid ${EMAIL_COLORS.border};">
          ${index + 1}
        </span>
      </td>
      <td style="vertical-align: top; padding: ${EMAIL_SPACING.sm} 0; padding-left: ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.sm}; line-height: 1.6;">
        ${item}
      </td>
    </tr>`
    )
    .join('');

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 ${EMAIL_SPACING.md};">
  ${listItems}
</table>`;
};

/**
 * Create an unordered list - Accent bullet style
 */
export const createUnorderedList = (items: string[]): string => {
  const listItems = items
    .map(
      (item) => `
    <tr>
      <td style="width: 20px; vertical-align: top; padding: ${EMAIL_SPACING.sm} 0;">
        <span style="display: inline-block; width: 6px; height: 6px; background: ${EMAIL_COLORS.accent}; border-radius: ${EMAIL_RADIUS.full}; margin-top: 6px;"></span>
      </td>
      <td style="vertical-align: top; padding: ${EMAIL_SPACING.sm} 0; padding-left: ${EMAIL_SPACING.xs}; color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.sm}; line-height: 1.6;">
        ${item}
      </td>
    </tr>`
    )
    .join('');

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 ${EMAIL_SPACING.md};">
  ${listItems}
</table>`;
};

/**
 * Create a section title - Premium typography
 */
export const createSectionTitle = (title: string): string => {
  return `
<h2 style="margin: ${EMAIL_SPACING.lg} 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-family: ${EMAIL_FONTS.heading}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 600; letter-spacing: -0.3px;">
  ${title}
</h2>`;
};

/**
 * Add spacing
 */
export const createSpacer = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string => {
  const height = EMAIL_SPACING[size];
  return `<div style="height: ${height};"></div>`;
};

/**
 * Create a feature row with icon - For welcome emails and feature showcases
 */
export const createFeatureRow = (icon: string, title: string, description: string): string => {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: ${EMAIL_SPACING.md};">
  <tr>
    <td style="background-color: ${EMAIL_COLORS.surfaceElevated}; padding: ${EMAIL_SPACING.md}; border-radius: ${EMAIL_RADIUS.md}; border: 1px solid ${EMAIL_COLORS.border};">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="48" style="vertical-align: top;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${EMAIL_COLORS.accentSubtle} 0%, transparent 100%); border-radius: ${EMAIL_RADIUS.md}; text-align: center; line-height: 40px; font-size: 20px; border: 1px solid ${EMAIL_COLORS.borderAccent};">
              ${icon}
            </div>
          </td>
          <td style="padding-left: ${EMAIL_SPACING.md}; vertical-align: top;">
            <p style="margin: 0 0 2px; font-weight: 600; color: ${EMAIL_COLORS.textPrimary}; font-family: ${EMAIL_FONTS.heading}; font-size: ${EMAIL_FONT_SIZES.base};">${title}</p>
            <p style="margin: 0; font-size: ${EMAIL_FONT_SIZES.sm}; color: ${EMAIL_COLORS.textMuted}; line-height: 1.5;">${description}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
};

/**
 * Create a status badge - For shipping status, order status, etc.
 */
export const createStatusBadge = (text: string, statusType: EmailStatusType = 'primary'): string => {
  const color = getStatusColor(statusType);
  const bgColor = getStatusLightColor(statusType);

  return `<span style="display: inline-block; padding: 4px 12px; background-color: ${bgColor}; color: ${color}; font-size: ${EMAIL_FONT_SIZES.xs}; font-weight: 600; border-radius: ${EMAIL_RADIUS.full}; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${color}30;">${text}</span>`;
};
