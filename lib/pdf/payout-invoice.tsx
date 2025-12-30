import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Svg, Circle, Path } from '@react-pdf/renderer';

// Font URLs - Updated with correct Google Fonts URLs
const FONT_URLS = {
  'Plus Jakarta Sans': {
    400: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU7NSg.ttf',
    500: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_m07NSg.ttf',
    600: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_d0nNSg.ttf',
    700: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_TknNSg.ttf',
  },
  'JetBrains Mono': {
    400: 'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf',
    700: 'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8L6tjPQ.ttf',
  },
  Genty: {
    400: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com'}/fonts/genty.woff`,
  },
};

// Cache for font registration to avoid re-fetching on every request
let fontsRegistered = false;
let useCustomFonts = true; // Track if custom fonts are available

/**
 * Fetch font file from URL and return as base64 data URL string
 * @react-pdf/renderer requires data URL strings for font sources, not Buffer objects
 */
async function fetchFontAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font from ${url}: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // Convert Buffer to base64 data URL - required format for @react-pdf/renderer
  return `data:font/truetype;base64,${buffer.toString('base64')}`;
}

/**
 * Register custom fonts by fetching them and converting to data URLs
 * @react-pdf/renderer requires data URL strings, not Buffer objects
 * Falls back to built-in fonts (Helvetica, Courier) if custom font loading fails
 */
export async function registerFonts(): Promise<void> {
  if (fontsRegistered) {
    return;
  }

  try {
    // Register Plus Jakarta Sans
    const plusJakartaFonts = await Promise.all([
      fetchFontAsDataUrl(FONT_URLS['Plus Jakarta Sans'][400]),
      fetchFontAsDataUrl(FONT_URLS['Plus Jakarta Sans'][500]),
      fetchFontAsDataUrl(FONT_URLS['Plus Jakarta Sans'][600]),
      fetchFontAsDataUrl(FONT_URLS['Plus Jakarta Sans'][700]),
    ]);

    Font.register({
      family: 'Plus Jakarta Sans',
      fonts: [
        {
          src: plusJakartaFonts[0],
          fontWeight: 400,
        },
        {
          src: plusJakartaFonts[1],
          fontWeight: 500,
        },
        {
          src: plusJakartaFonts[2],
          fontWeight: 600,
        },
        {
          src: plusJakartaFonts[3],
          fontWeight: 700,
        },
      ],
    });

    // Register JetBrains Mono
    const jetbrainsFonts = await Promise.all([
      fetchFontAsDataUrl(FONT_URLS['JetBrains Mono'][400]),
      fetchFontAsDataUrl(FONT_URLS['JetBrains Mono'][700]),
    ]);

    Font.register({
      family: 'JetBrains Mono',
      fonts: [
        {
          src: jetbrainsFonts[0],
          fontWeight: 400,
        },
        {
          src: jetbrainsFonts[1],
          fontWeight: 700,
        },
      ],
    });

    // Register Genty font (fetch from public URL)
    try {
      const gentyFontDataUrl = await fetchFontAsDataUrl(FONT_URLS.Genty[400]);
      Font.register({
        family: 'Genty',
        fonts: [
          {
            src: gentyFontDataUrl,
            fontWeight: 400,
          },
        ],
      });
    } catch (gentyError) {
      console.warn('Failed to load Genty font, brand name will use fallback:', gentyError);
    }

    // Disable hyphenation for cleaner text
    Font.registerHyphenationCallback((word) => [word]);

    fontsRegistered = true;
    useCustomFonts = true;
  } catch (error) {
    console.error('Failed to register custom fonts, falling back to built-in fonts:', error);
    // Don't throw - allow PDF generation with built-in fonts
    useCustomFonts = false;
    fontsRegistered = true; // Mark as registered to prevent retry loops
  }
}

// Brand Colors
const COLORS = {
  primary: '#1d43d8',
  accent: '#adfc04',
  dark: '#0f172a',
  darkGray: '#334155',
  mediumGray: '#64748b',
  lightGray: '#94a3b8',
  paleGray: '#e2e8f0',
  veryPaleGray: '#f1f5f9',
  white: '#ffffff',
  success: '#10b981',
  successLight: '#d1fae5',
  error: '#ef4444',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
};

/**
 * Get font family names with fallback to built-in fonts
 * Built-in fonts: Helvetica (sans-serif), Times-Roman (serif), Courier (monospace)
 */
const getFontFamily = {
  sans: () => (useCustomFonts ? 'Plus Jakarta Sans' : 'Helvetica'),
  mono: () => (useCustomFonts ? 'JetBrains Mono' : 'Courier'),
  genty: () => (useCustomFonts ? 'Genty' : 'Helvetica'),
};

/**
 * Create styles with dynamic font fallback
 * Styles are created after fonts are registered to ensure correct fallback
 */
const createStyles = () =>
  StyleSheet.create({
    page: {
      backgroundColor: COLORS.white,
      fontFamily: getFontFamily.sans(),
      fontSize: 10,
      color: COLORS.dark,
      paddingBottom: 60,
    },
    header: {
      backgroundColor: COLORS.primary,
      padding: 24,
      paddingBottom: 36,
      position: 'relative',
    },
    headerPattern: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 200,
      height: 120,
      opacity: 0.1,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    brandSection: {
      flexDirection: 'column',
    },
    brandNameContainer: {
      flexDirection: 'row',
    },
    brandNameWhite: {
      fontFamily: getFontFamily.genty(),
      fontWeight: 400,
      fontSize: 24,
      color: COLORS.white,
      letterSpacing: 0,
    },
    brandNameAccent: {
      fontFamily: getFontFamily.genty(),
      fontWeight: 400,
      fontSize: 24,
      color: COLORS.accent,
      letterSpacing: 0,
    },
    brandTagline: {
      fontFamily: getFontFamily.sans(),
      fontSize: 9,
      color: COLORS.white,
      marginTop: 2,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    invoiceTitle: {
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    invoiceTitleText: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 700,
      fontSize: 20,
      color: COLORS.white,
      letterSpacing: 1,
    },
    invoiceNumber: {
      fontFamily: getFontFamily.mono(),
      fontSize: 10,
      color: COLORS.white,
      marginTop: 2,
    },
    invoiceCard: {
      marginHorizontal: 24,
      marginTop: -18,
      backgroundColor: COLORS.white,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: COLORS.paleGray,
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 0,
    },
    cardColumn: {
      flex: 1,
    },
    cardLabel: {
      fontFamily: getFontFamily.sans(),
      fontSize: 8,
      color: COLORS.mediumGray,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    cardValue: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 10,
      color: COLORS.dark,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusPending: {
      backgroundColor: COLORS.warningLight,
    },
    statusPaid: {
      backgroundColor: COLORS.successLight,
    },
    statusText: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statusTextPending: {
      color: COLORS.warning,
    },
    statusTextPaid: {
      color: COLORS.success,
    },
    mainContent: {
      padding: 24,
      paddingTop: 16,
    },
    section: {
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionAccent: {
      width: 2,
      height: 12,
      backgroundColor: COLORS.primary,
      marginRight: 6,
      borderRadius: 1,
    },
    sectionTitle: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 10,
      color: COLORS.dark,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    payeeContent: {
      marginBottom: 10,
    },
    payeeOrgSection: {
      marginBottom: 10,
    },
    payeeName: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 700,
      fontSize: 14,
      color: COLORS.dark,
      marginBottom: 2,
    },
    payeeSlug: {
      fontFamily: getFontFamily.mono(),
      fontSize: 9,
      color: COLORS.mediumGray,
    },
    payeeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    payeeGridItem: {
      width: '45%',
      marginBottom: 8,
    },
    payeeGridLabel: {
      fontFamily: getFontFamily.sans(),
      fontSize: 7,
      color: COLORS.mediumGray,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    payeeGridValue: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 500,
      fontSize: 10,
      color: COLORS.darkGray,
    },
    payeeRow: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    payeeLabel: {
      width: 100,
      fontSize: 9,
      color: COLORS.mediumGray,
    },
    payeeValue: {
      flex: 1,
      fontFamily: getFontFamily.sans(),
      fontWeight: 500,
      fontSize: 10,
      color: COLORS.darkGray,
    },
    financialSummary: {
      backgroundColor: COLORS.veryPaleGray,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.paleGray,
    },
    financialHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    financialTitle: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 10,
      color: COLORS.dark,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    financialRows: {
      marginBottom: 10,
    },
    financialRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.paleGray,
    },
    financialLabel: {
      fontFamily: getFontFamily.sans(),
      fontSize: 10,
      color: COLORS.mediumGray,
    },
    financialValue: {
      fontFamily: getFontFamily.mono(),
      fontWeight: 600,
      fontSize: 10,
      color: COLORS.dark,
    },
    financialValueNegative: {
      color: COLORS.error,
    },
    netAmountSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 10,
      borderTopWidth: 2,
      borderTopColor: COLORS.primary,
    },
    netLabel: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 10,
      color: COLORS.dark,
    },
    netAmount: {
      fontFamily: getFontFamily.mono(),
      fontWeight: 700,
      fontSize: 20,
      color: COLORS.primary,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 0,
    },
    statCard: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.paleGray,
      borderRadius: 6,
      padding: 8,
      alignItems: 'center',
      backgroundColor: COLORS.white,
    },
    statValue: {
      fontFamily: getFontFamily.mono(),
      fontWeight: 700,
      fontSize: 12,
      color: COLORS.primary,
      marginBottom: 1,
    },
    statLabel: {
      fontFamily: getFontFamily.sans(),
      fontSize: 6,
      color: COLORS.mediumGray,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableContainer: {
      borderWidth: 1,
      borderColor: COLORS.paleGray,
      borderRadius: 8,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: COLORS.primary,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    tableHeaderCell: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 9,
      color: COLORS.white,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.paleGray,
    },
    tableRowAlt: {
      backgroundColor: COLORS.veryPaleGray,
    },
    tableCell: {
      fontFamily: getFontFamily.sans(),
      fontSize: 9,
      color: COLORS.darkGray,
    },
    tableCellBold: {
      fontFamily: getFontFamily.mono(),
      fontWeight: 700,
      color: COLORS.dark,
    },
    colOrder: { width: '22%' },
    colDate: { width: '20%' },
    colCustomer: { width: '28%' },
    colItems: { width: '10%', textAlign: 'center' },
    colAmount: { width: '20%', textAlign: 'right' },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.veryPaleGray,
      padding: 14,
      paddingHorizontal: 24,
    },
    footerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerText: {
      fontFamily: getFontFamily.sans(),
      fontSize: 8,
      color: COLORS.mediumGray,
    },
    footerBrand: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    footerLogo: {
      fontFamily: getFontFamily.genty(),
      fontWeight: 400,
      fontSize: 12,
      color: COLORS.primary,
      marginRight: 8,
    },
    footerContact: {
      fontFamily: getFontFamily.sans(),
      fontSize: 8,
      color: COLORS.mediumGray,
    },
    paymentPage: {
      padding: 32,
    },
    successBanner: {
      backgroundColor: COLORS.success,
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
    },
    successIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    successTitle: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 700,
      fontSize: 16,
      color: COLORS.white,
      marginBottom: 2,
    },
    successSubtitle: {
      fontFamily: getFontFamily.sans(),
      fontSize: 9,
      color: 'rgba(255,255,255,0.8)',
    },
    paymentDetails: {
      backgroundColor: COLORS.veryPaleGray,
      borderRadius: 8,
      padding: 20,
    },
    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.paleGray,
    },
    paymentLabel: {
      fontFamily: getFontFamily.sans(),
      fontSize: 10,
      color: COLORS.mediumGray,
    },
    paymentValue: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 500,
      fontSize: 10,
      color: COLORS.dark,
    },
    moreOrders: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: COLORS.veryPaleGray,
    },
    moreOrdersText: {
      fontFamily: getFontFamily.sans(),
      fontSize: 9,
      color: COLORS.mediumGray,
      fontStyle: 'italic',
    },
    // Reminders section
    remindersSection: {
      marginTop: 12,
      padding: 12,
      backgroundColor: COLORS.veryPaleGray,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: COLORS.paleGray,
    },
    remindersTitle: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 8,
      color: COLORS.dark,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    reminderItem: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    reminderBullet: {
      fontFamily: getFontFamily.sans(),
      fontSize: 7,
      color: COLORS.primary,
      marginRight: 6,
      width: 8,
    },
    reminderText: {
      fontFamily: getFontFamily.sans(),
      fontSize: 7,
      color: COLORS.mediumGray,
      flex: 1,
      lineHeight: 1.4,
    },
    // Terms page styles
    termsPage: {
      paddingTop: 32,
      paddingBottom: 60,
      paddingHorizontal: 32,
    },
    termsHeader: {
      marginBottom: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.paleGray,
    },
    termsTitle: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 700,
      fontSize: 16,
      color: COLORS.dark,
      marginBottom: 4,
    },
    termsSubtitle: {
      fontFamily: getFontFamily.sans(),
      fontSize: 9,
      color: COLORS.mediumGray,
    },
    termsSection: {
      marginBottom: 12,
    },
    termsSectionTitle: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 10,
      color: COLORS.dark,
      marginBottom: 6,
    },
    termsText: {
      fontFamily: getFontFamily.sans(),
      fontSize: 8,
      color: COLORS.darkGray,
      lineHeight: 1.5,
      marginBottom: 4,
    },
    termsList: {
      marginLeft: 8,
    },
    termsListItem: {
      flexDirection: 'row',
      marginBottom: 3,
    },
    termsListBullet: {
      fontFamily: getFontFamily.sans(),
      fontSize: 8,
      color: COLORS.primary,
      marginRight: 6,
      width: 10,
    },
    termsListText: {
      fontFamily: getFontFamily.sans(),
      fontSize: 8,
      color: COLORS.darkGray,
      flex: 1,
      lineHeight: 1.4,
    },
    faqItem: {
      marginBottom: 6,
      padding: 8,
      backgroundColor: COLORS.veryPaleGray,
      borderRadius: 4,
    },
    faqQuestion: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 8,
      color: COLORS.dark,
      marginBottom: 4,
    },
    faqAnswer: {
      fontFamily: getFontFamily.sans(),
      fontSize: 8,
      color: COLORS.darkGray,
      lineHeight: 1.4,
    },
    // Page 2+ styles with padding
    orderSummaryPage: {
      paddingTop: 48,
      paddingBottom: 60,
      paddingHorizontal: 32,
    },
    orderSummaryPageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.paleGray,
    },
    pageHeaderBrand: {
      fontFamily: getFontFamily.genty(),
      fontWeight: 400,
      fontSize: 16,
      color: COLORS.primary,
    },
    pageHeaderInvoice: {
      fontFamily: getFontFamily.mono(),
      fontSize: 10,
      color: COLORS.mediumGray,
    },
    separatorLine: {
      height: 1,
      backgroundColor: COLORS.paleGray,
      marginVertical: 10,
    },
    // Voucher badge styles
    voucherBadge: {
      backgroundColor: '#fef3c7', // amber-100
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 8,
      marginLeft: 4,
    },
    voucherBadgeText: {
      fontFamily: getFontFamily.sans(),
      fontSize: 6,
      color: '#b45309', // amber-700
      fontWeight: 600,
    },
    amountCell: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    // Product Summary styles
    productSummaryContainer: {
      marginBottom: 16,
    },
    productCard: {
      borderWidth: 1,
      borderColor: COLORS.paleGray,
      borderRadius: 6,
      marginBottom: 8,
      overflow: 'hidden',
    },
    productHeader: {
      backgroundColor: '#f0f4ff', // primary/5
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    productTitle: {
      fontFamily: getFontFamily.sans(),
      fontWeight: 600,
      fontSize: 9,
      color: COLORS.dark,
      flex: 1,
    },
    productStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    productQty: {
      fontFamily: getFontFamily.mono(),
      fontSize: 8,
      color: COLORS.primary,
      fontWeight: 700,
    },
    productQtyLabel: {
      fontFamily: getFontFamily.sans(),
      fontSize: 7,
      color: COLORS.mediumGray,
    },
    productAmount: {
      fontFamily: getFontFamily.mono(),
      fontSize: 9,
      fontWeight: 700,
      color: COLORS.dark,
    },
    variantRow: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.veryPaleGray,
      borderTopWidth: 1,
      borderTopColor: COLORS.paleGray,
    },
    variantName: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 8,
    },
    variantDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: COLORS.primary,
      marginRight: 6,
    },
    variantText: {
      fontFamily: getFontFamily.sans(),
      fontSize: 8,
      color: COLORS.darkGray,
    },
    variantStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    variantQty: {
      fontFamily: getFontFamily.mono(),
      fontSize: 7,
      color: COLORS.darkGray,
      fontWeight: 600,
    },
    variantAmount: {
      fontFamily: getFontFamily.mono(),
      fontSize: 8,
      fontWeight: 600,
      color: COLORS.darkGray,
    },
    sizeRow: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9', // very light border
    },
    sizeName: {
      paddingLeft: 24,
    },
    sizeText: {
      fontFamily: getFontFamily.sans(),
      fontSize: 7,
      color: COLORS.mediumGray,
    },
    sizeStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    sizeQty: {
      fontFamily: getFontFamily.mono(),
      fontSize: 7,
      color: COLORS.lightGray,
    },
    sizeAmount: {
      fontFamily: getFontFamily.mono(),
      fontSize: 7,
      color: COLORS.lightGray,
    },
  });

// Initialize styles with fallback fonts (will be recreated after font registration if custom fonts are available)
let styles: ReturnType<typeof createStyles> = createStyles();

// Helper functions
export const formatCurrency = (amount: number) => `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const formatShortDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// SVG Components
const _HeaderPattern = () => (
  <Svg viewBox="0 0 200 120" style={styles.headerPattern}>
    <Circle cx="180" cy="20" r="60" fill="white" />
    <Circle cx="150" cy="80" r="40" fill="white" />
    <Circle cx="200" cy="100" r="30" fill="white" />
  </Svg>
);

const CheckmarkIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 32, height: 32 }}>
    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white" />
  </Svg>
);

// Types
export interface OrderSummary {
  orderId: string;
  orderNumber: string;
  orderDate: number;
  customerName: string;
  itemCount: number;
  totalAmount: number;
  // Voucher info for display
  voucherDiscount?: number;
  voucherCode?: string;
  hasRefundVoucher?: boolean;
}

export interface ProductSizeBreakdown {
  size: string;
  quantity: number;
  amount: number;
}

export interface ProductVariantBreakdown {
  variantId: string;
  variantName: string;
  totalQuantity: number;
  totalAmount: number;
  sizes?: ProductSizeBreakdown[];
}

export interface ProductSummaryItem {
  productId: string;
  productTitle: string;
  totalQuantity: number;
  totalAmount: number;
  variants: ProductVariantBreakdown[];
}

export interface InvoiceData {
  invoiceNumber: string;
  organizationInfo: {
    name: string;
    slug: string;
    bankDetails?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    };
  };
  periodStart: number;
  periodEnd: number;
  grossAmount: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  netAmount: number;
  totalAdjustmentAmount?: number;
  adjustmentCount?: number;
  adjustmentSummary?: Array<{
    adjustmentId: string;
    orderId: string;
    orderNumber: string;
    type: 'REFUND' | 'CANCELLATION';
    amount: number;
    reason: string;
  }>;
  totalVoucherDiscount?: number; // Non-refund voucher discounts (seller absorbs)
  orderCount: number;
  itemCount: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'CANCELLED';
  paidAt?: number;
  paidByInfo?: {
    firstName?: string;
    lastName?: string;
  };
  paymentReference?: string;
  paymentNotes?: string;
  createdAt: number;
  orderSummary: OrderSummary[];
  productSummary?: ProductSummaryItem[];
}

/**
 * Get styles instance (recreates styles after font registration)
 */
export function getStyles(): ReturnType<typeof createStyles> {
  styles = createStyles();
  return styles;
}

// Invoice Document Component
export const PayoutInvoiceDocument: React.FC<{ invoice: InvoiceData }> = ({ invoice }) => {
  const isPaid = invoice.status === 'PAID';
  const displayOrders = invoice.orderSummary.slice(0, 25);
  const hasMoreOrders = invoice.orderSummary.length > 25;

  // Get fresh styles (in case fonts were registered)
  const currentStyles = getStyles();

  return (
    <Document>
      {/* Page 1: Header, Invoice Details, Payee, Financial Summary, Stats */}
      <Page size="A4" style={currentStyles.page}>
        <View style={currentStyles.header}>
          <View style={currentStyles.headerContent}>
            <View style={currentStyles.brandSection}>
              <View style={currentStyles.brandNameContainer}>
                <Text style={currentStyles.brandNameWhite}>Merch</Text>
                <Text style={currentStyles.brandNameAccent}>kins</Text>
              </View>
              <Text style={currentStyles.brandTagline}>Payout Invoice</Text>
            </View>
            <View style={currentStyles.invoiceTitle}>
              <Text style={currentStyles.invoiceTitleText}>INVOICE</Text>
              <Text style={currentStyles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            </View>
          </View>
        </View>

        <View style={currentStyles.invoiceCard}>
          <View style={currentStyles.cardRow}>
            <View style={currentStyles.cardColumn}>
              <Text style={currentStyles.cardLabel}>Invoice Date</Text>
              <Text style={currentStyles.cardValue}>{formatDate(invoice.createdAt)}</Text>
            </View>
            <View style={currentStyles.cardColumn}>
              <Text style={currentStyles.cardLabel}>Period Covered</Text>
              <Text style={currentStyles.cardValue}>
                {formatShortDate(invoice.periodStart)} — {formatShortDate(invoice.periodEnd)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={currentStyles.cardLabel}>Status</Text>
              <View style={[currentStyles.statusBadge, isPaid ? currentStyles.statusPaid : currentStyles.statusPending]}>
                <Text style={[currentStyles.statusText, isPaid ? currentStyles.statusTextPaid : currentStyles.statusTextPending]}>
                  {invoice.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={currentStyles.mainContent}>
          {/* Payee Details - No background card */}
          <View style={currentStyles.section}>
            <View style={currentStyles.sectionHeader}>
              <View style={currentStyles.sectionAccent} />
              <Text style={currentStyles.sectionTitle}>Payee Details</Text>
            </View>
            <View style={currentStyles.payeeContent}>
              <View style={currentStyles.payeeOrgSection}>
                <Text style={currentStyles.payeeName}>{invoice.organizationInfo.name}</Text>
                <Text style={currentStyles.payeeSlug}>@{invoice.organizationInfo.slug}</Text>
              </View>
              {invoice.organizationInfo.bankDetails && (
                <View style={currentStyles.payeeGrid}>
                  <View style={currentStyles.payeeGridItem}>
                    <Text style={currentStyles.payeeGridLabel}>Bank Name</Text>
                    <Text style={currentStyles.payeeGridValue}>{invoice.organizationInfo.bankDetails.bankName}</Text>
                  </View>
                  <View style={currentStyles.payeeGridItem}>
                    <Text style={currentStyles.payeeGridLabel}>Account Name</Text>
                    <Text style={currentStyles.payeeGridValue}>{invoice.organizationInfo.bankDetails.accountName}</Text>
                  </View>
                  <View style={currentStyles.payeeGridItem}>
                    <Text style={currentStyles.payeeGridLabel}>Account Number</Text>
                    <Text style={[currentStyles.payeeGridValue, { fontFamily: getFontFamily.mono() }]}>
                      {invoice.organizationInfo.bankDetails.accountNumber}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <View style={currentStyles.separatorLine} />
          </View>

          {/* Financial Summary - Light theme */}
          <View style={currentStyles.financialSummary}>
            <View style={currentStyles.financialHeader}>
              <Text style={currentStyles.financialTitle}>Financial Summary</Text>
            </View>
            <View style={currentStyles.financialRows}>
              {invoice.totalVoucherDiscount && invoice.totalVoucherDiscount > 0 ? (
                <>
                  <View style={currentStyles.financialRow}>
                    <Text style={currentStyles.financialLabel}>Original Sales Total</Text>
                    <Text style={currentStyles.financialValue}>{formatCurrency(invoice.grossAmount + invoice.totalVoucherDiscount)}</Text>
                  </View>
                  <View style={currentStyles.financialRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={currentStyles.financialLabel}>Voucher Discounts </Text>
                      <View style={currentStyles.voucherBadge}>
                        <Text style={currentStyles.voucherBadgeText}>Seller</Text>
                      </View>
                    </View>
                    <Text style={[currentStyles.financialValue, { color: '#d97706' }]}>-{formatCurrency(invoice.totalVoucherDiscount)}</Text>
                  </View>
                  <View style={[currentStyles.financialRow, { backgroundColor: COLORS.veryPaleGray, marginHorizontal: -16, paddingHorizontal: 16 }]}>
                    <Text style={[currentStyles.financialLabel, { fontWeight: 600 }]}>Gross Sales Amount</Text>
                    <Text style={currentStyles.financialValue}>{formatCurrency(invoice.grossAmount)}</Text>
                  </View>
                </>
              ) : (
                <View style={currentStyles.financialRow}>
                  <Text style={currentStyles.financialLabel}>Gross Sales Amount</Text>
                  <Text style={currentStyles.financialValue}>{formatCurrency(invoice.grossAmount)}</Text>
                </View>
              )}
              <View style={currentStyles.financialRow}>
                <Text style={currentStyles.financialLabel}>Platform Fee ({invoice.platformFeePercentage}%)</Text>
                <Text style={[currentStyles.financialValue, currentStyles.financialValueNegative]}>-{formatCurrency(invoice.platformFeeAmount)}</Text>
              </View>
              {invoice.totalAdjustmentAmount && invoice.totalAdjustmentAmount < 0 && (
                <View style={currentStyles.financialRow}>
                  <Text style={currentStyles.financialLabel}>
                    Adjustments ({invoice.adjustmentCount} {invoice.adjustmentCount === 1 ? 'refund/cancellation' : 'refunds/cancellations'})
                  </Text>
                  <Text style={[currentStyles.financialValue, currentStyles.financialValueNegative]}>
                    {formatCurrency(invoice.totalAdjustmentAmount)}
                  </Text>
                </View>
              )}
            </View>
            <View style={currentStyles.netAmountSection}>
              <Text style={currentStyles.netLabel}>Net Payout</Text>
              <Text style={currentStyles.netAmount}>{formatCurrency(invoice.netAmount)}</Text>
            </View>
          </View>

          {/* Stats Grid - Compact */}
          <View style={currentStyles.statsGrid}>
            <View style={currentStyles.statCard}>
              <Text style={currentStyles.statValue}>{invoice.orderCount}</Text>
              <Text style={currentStyles.statLabel}>Orders</Text>
            </View>
            <View style={currentStyles.statCard}>
              <Text style={currentStyles.statValue}>{invoice.itemCount}</Text>
              <Text style={currentStyles.statLabel}>Items Sold</Text>
            </View>
            <View style={currentStyles.statCard}>
              <Text style={currentStyles.statValue}>{formatCurrency(invoice.grossAmount)}</Text>
              <Text style={currentStyles.statLabel}>Total Revenue</Text>
            </View>
          </View>

          {/* Reminders Section */}
          <View style={currentStyles.remindersSection}>
            <Text style={currentStyles.remindersTitle}>Important Reminders</Text>
            <View style={currentStyles.reminderItem}>
              <Text style={currentStyles.reminderBullet}>•</Text>
              <Text style={currentStyles.reminderText}>
                Payouts are processed every Friday. You will receive an email confirmation once payment has been sent.
              </Text>
            </View>
            <View style={currentStyles.reminderItem}>
              <Text style={currentStyles.reminderBullet}>•</Text>
              <Text style={currentStyles.reminderText}>
                Only orders with PAID status during the payout period are included. Refunded orders are excluded.
              </Text>
            </View>
            <View style={currentStyles.reminderItem}>
              <Text style={currentStyles.reminderBullet}>•</Text>
              <Text style={currentStyles.reminderText}>
                Ensure your bank details are up to date in your Organization Settings to avoid payment delays.
              </Text>
            </View>
            <View style={currentStyles.reminderItem}>
              <Text style={currentStyles.reminderBullet}>•</Text>
              <Text style={currentStyles.reminderText}>
                For questions or discrepancies, contact support@merchkins.com within 7 days of invoice generation.
              </Text>
            </View>
          </View>
        </View>

        <View style={currentStyles.footer} fixed>
          <View style={currentStyles.footerContent}>
            <View>
              <Text style={currentStyles.footerText}>This is a computer-generated invoice. No signature required.</Text>
              <Text style={currentStyles.footerText}>Generated by Merchkins Payout System</Text>
            </View>
            <View style={currentStyles.footerBrand}>
              <Text style={currentStyles.footerLogo}>merchkins</Text>
              <Text style={currentStyles.footerContact}>support@merchkins.com</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Page 2: Order Summary */}
      <Page size="A4" style={currentStyles.page}>
        <View style={currentStyles.orderSummaryPage}>
          {/* Page Header */}
          <View style={currentStyles.orderSummaryPageHeader}>
            <Text style={currentStyles.pageHeaderBrand}>Merchkins</Text>
            <Text style={currentStyles.pageHeaderInvoice}>{invoice.invoiceNumber}</Text>
          </View>

          {/* Order Summary Table */}
          <View style={currentStyles.section}>
            <View style={currentStyles.sectionHeader}>
              <View style={currentStyles.sectionAccent} />
              <Text style={currentStyles.sectionTitle}>Order Summary</Text>
            </View>
            <View style={currentStyles.tableContainer}>
              <View style={currentStyles.tableHeader}>
                <Text style={[currentStyles.tableHeaderCell, currentStyles.colOrder]}>Order #</Text>
                <Text style={[currentStyles.tableHeaderCell, currentStyles.colDate]}>Date</Text>
                <Text style={[currentStyles.tableHeaderCell, currentStyles.colCustomer]}>Customer</Text>
                <Text style={[currentStyles.tableHeaderCell, currentStyles.colItems]}>Items</Text>
                <Text style={[currentStyles.tableHeaderCell, currentStyles.colAmount]}>Amount</Text>
              </View>
              {displayOrders.map((order, index) => (
                <View key={order.orderId} style={[currentStyles.tableRow, index % 2 === 1 ? currentStyles.tableRowAlt : {}]}>
                  <Text style={[currentStyles.tableCell, currentStyles.tableCellBold, currentStyles.colOrder]}>{order.orderNumber.slice(0, 12)}</Text>
                  <Text style={[currentStyles.tableCell, currentStyles.colDate]}>{formatShortDate(order.orderDate)}</Text>
                  <Text style={[currentStyles.tableCell, currentStyles.colCustomer]}>{order.customerName.slice(0, 22)}</Text>
                  <Text style={[currentStyles.tableCell, currentStyles.colItems]}>{order.itemCount}</Text>
                  <View style={[currentStyles.colAmount, currentStyles.amountCell]}>
                    <Text style={[currentStyles.tableCell, currentStyles.tableCellBold]}>{formatCurrency(order.totalAmount)}</Text>
                    {order.hasRefundVoucher && (
                      <View style={currentStyles.voucherBadge}>
                        <Text style={currentStyles.voucherBadgeText}>V</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
              {hasMoreOrders && (
                <View style={currentStyles.moreOrders}>
                  <Text style={currentStyles.moreOrdersText}>... and {invoice.orderSummary.length - 25} more orders</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={currentStyles.footer} fixed>
          <View style={currentStyles.footerContent}>
            <View>
              <Text style={currentStyles.footerText}>This is a computer-generated invoice. No signature required.</Text>
              <Text style={currentStyles.footerText}>Generated by Merchkins Payout System</Text>
            </View>
            <View style={currentStyles.footerBrand}>
              <Text style={currentStyles.footerLogo}>merchkins</Text>
              <Text style={currentStyles.footerContact}>support@merchkins.com</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Product Summary Page - Only show if data exists */}
      {invoice.productSummary && invoice.productSummary.length > 0 && (
        <Page size="A4" style={currentStyles.page}>
          <View style={currentStyles.orderSummaryPage}>
            {/* Page Header */}
            <View style={currentStyles.orderSummaryPageHeader}>
              <Text style={currentStyles.pageHeaderBrand}>Merchkins</Text>
              <Text style={currentStyles.pageHeaderInvoice}>{invoice.invoiceNumber}</Text>
            </View>

            {/* Product Summary */}
            <View style={currentStyles.section}>
              <View style={currentStyles.sectionHeader}>
                <View style={currentStyles.sectionAccent} />
                <Text style={currentStyles.sectionTitle}>Product Summary</Text>
              </View>
              <View style={currentStyles.productSummaryContainer}>
                {invoice.productSummary.map((product) => (
                  <View key={product.productId} style={currentStyles.productCard}>
                    {/* Product Header */}
                    <View style={currentStyles.productHeader}>
                      <Text style={currentStyles.productTitle}>{product.productTitle}</Text>
                      <View style={currentStyles.productStats}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={currentStyles.productQty}>{product.totalQuantity}</Text>
                          <Text style={currentStyles.productQtyLabel}> items</Text>
                        </View>
                        <Text style={currentStyles.productAmount}>{formatCurrency(product.totalAmount)}</Text>
                      </View>
                    </View>

                    {/* Variants */}
                    {product.variants.map((variant) => (
                      <View key={variant.variantId}>
                        {/* Variant Row */}
                        <View style={currentStyles.variantRow}>
                          <View style={currentStyles.variantName}>
                            <View style={currentStyles.variantDot} />
                            <Text style={currentStyles.variantText}>{variant.variantName}</Text>
                          </View>
                          <View style={currentStyles.variantStats}>
                            <Text style={currentStyles.variantQty}>{variant.totalQuantity} items</Text>
                            <Text style={currentStyles.variantAmount}>{formatCurrency(variant.totalAmount)}</Text>
                          </View>
                        </View>

                        {/* Sizes */}
                        {variant.sizes &&
                          variant.sizes.length > 0 &&
                          variant.sizes.map((size) => (
                            <View key={size.size} style={currentStyles.sizeRow}>
                              <View style={currentStyles.sizeName}>
                                <Text style={currentStyles.sizeText}>{size.size}</Text>
                              </View>
                              <View style={currentStyles.sizeStats}>
                                <Text style={currentStyles.sizeQty}>{size.quantity}</Text>
                                <Text style={currentStyles.sizeAmount}>{formatCurrency(size.amount)}</Text>
                              </View>
                            </View>
                          ))}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={currentStyles.footer} fixed>
            <View style={currentStyles.footerContent}>
              <View>
                <Text style={currentStyles.footerText}>This is a computer-generated invoice. No signature required.</Text>
                <Text style={currentStyles.footerText}>Generated by Merchkins Payout System</Text>
              </View>
              <View style={currentStyles.footerBrand}>
                <Text style={currentStyles.footerLogo}>merchkins</Text>
                <Text style={currentStyles.footerContact}>support@merchkins.com</Text>
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Page 3+: Payment Confirmation (if paid) */}
      {isPaid && invoice.paidAt && (
        <Page size="A4" style={currentStyles.page}>
          <View style={currentStyles.orderSummaryPage}>
            {/* Page Header */}
            <View style={currentStyles.orderSummaryPageHeader}>
              <Text style={currentStyles.pageHeaderBrand}>Merchkins</Text>
              <Text style={currentStyles.pageHeaderInvoice}>{invoice.invoiceNumber}</Text>
            </View>

            <View style={currentStyles.successBanner}>
              <View style={currentStyles.successIcon}>
                <CheckmarkIcon />
              </View>
              <Text style={currentStyles.successTitle}>Payment Confirmed</Text>
              <Text style={currentStyles.successSubtitle}>Your payout has been successfully processed</Text>
            </View>

            <View style={currentStyles.section}>
              <View style={currentStyles.sectionHeader}>
                <View style={currentStyles.sectionAccent} />
                <Text style={currentStyles.sectionTitle}>Payment Details</Text>
              </View>
              <View style={currentStyles.paymentDetails}>
                <View style={currentStyles.paymentRow}>
                  <Text style={currentStyles.paymentLabel}>Invoice Number</Text>
                  <Text style={currentStyles.paymentValue}>{invoice.invoiceNumber}</Text>
                </View>
                <View style={currentStyles.paymentRow}>
                  <Text style={currentStyles.paymentLabel}>Amount Paid</Text>
                  <Text style={[currentStyles.paymentValue, { color: COLORS.success }]}>{formatCurrency(invoice.netAmount)}</Text>
                </View>
                <View style={currentStyles.paymentRow}>
                  <Text style={currentStyles.paymentLabel}>Payment Date</Text>
                  <Text style={currentStyles.paymentValue}>{formatDate(invoice.paidAt)}</Text>
                </View>
                {invoice.paidByInfo && (
                  <View style={currentStyles.paymentRow}>
                    <Text style={currentStyles.paymentLabel}>Processed By</Text>
                    <Text style={currentStyles.paymentValue}>
                      {invoice.paidByInfo.firstName || ''} {invoice.paidByInfo.lastName || ''}
                    </Text>
                  </View>
                )}
                {invoice.paymentReference && (
                  <View style={currentStyles.paymentRow}>
                    <Text style={currentStyles.paymentLabel}>Reference</Text>
                    <Text style={currentStyles.paymentValue}>{invoice.paymentReference}</Text>
                  </View>
                )}
                {invoice.paymentNotes && (
                  <View style={[currentStyles.paymentRow, { borderBottomWidth: 0 }]}>
                    <Text style={currentStyles.paymentLabel}>Notes</Text>
                    <Text style={currentStyles.paymentValue}>{invoice.paymentNotes}</Text>
                  </View>
                )}
              </View>
            </View>

            {invoice.organizationInfo.bankDetails && (
              <View style={currentStyles.section}>
                <View style={currentStyles.sectionHeader}>
                  <View style={currentStyles.sectionAccent} />
                  <Text style={currentStyles.sectionTitle}>Receiving Account</Text>
                </View>
                <View style={currentStyles.paymentDetails}>
                  <View style={currentStyles.paymentRow}>
                    <Text style={currentStyles.paymentLabel}>Bank</Text>
                    <Text style={currentStyles.paymentValue}>{invoice.organizationInfo.bankDetails.bankName}</Text>
                  </View>
                  <View style={currentStyles.paymentRow}>
                    <Text style={currentStyles.paymentLabel}>Account Name</Text>
                    <Text style={currentStyles.paymentValue}>{invoice.organizationInfo.bankDetails.accountName}</Text>
                  </View>
                  <View style={[currentStyles.paymentRow, { borderBottomWidth: 0 }]}>
                    <Text style={currentStyles.paymentLabel}>Account Number</Text>
                    <Text style={currentStyles.paymentValue}>{invoice.organizationInfo.bankDetails.accountNumber}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={currentStyles.footer} fixed>
            <View style={currentStyles.footerContent}>
              <View>
                <Text style={currentStyles.footerText}>This is a computer-generated invoice. No signature required.</Text>
                <Text style={currentStyles.footerText}>Generated by Merchkins Payout System</Text>
              </View>
              <View style={currentStyles.footerBrand}>
                <Text style={currentStyles.footerLogo}>merchkins</Text>
                <Text style={currentStyles.footerContact}>support@merchkins.com</Text>
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* Terms & FAQ Page */}
      <Page size="A4" style={currentStyles.page}>
        <View style={currentStyles.termsPage}>
          {/* Terms Header */}
          <View style={currentStyles.termsHeader}>
            <Text style={currentStyles.termsTitle}>Payout Terms & Information</Text>
            <Text style={currentStyles.termsSubtitle}>Understanding how your payouts work on Merchkins</Text>
          </View>

          {/* Payout Schedule */}
          <View style={currentStyles.termsSection}>
            <Text style={currentStyles.termsSectionTitle}>Payout Schedule</Text>
            <Text style={currentStyles.termsText}>
              Merchkins processes payouts on a weekly cycle. Invoices are automatically generated every Wednesday at 00:05 UTC, covering all paid
              orders from the previous week (Wednesday 00:00 UTC to Tuesday 23:59:59 UTC). Payments are processed by our team every Friday via bank
              transfer.
            </Text>
          </View>

          {/* Platform Fee */}
          <View style={currentStyles.termsSection}>
            <Text style={currentStyles.termsSectionTitle}>Platform Fee</Text>
            <Text style={currentStyles.termsText}>
              The platform fee is deducted from your gross sales to cover payment processing, platform maintenance, and customer support services.
              Your organization's fee rate is shown on this invoice. The net payout amount is calculated as: Gross Sales - Platform Fee = Net Payout.
            </Text>
          </View>

          {/* Order Inclusion */}
          <View style={currentStyles.termsSection}>
            <Text style={currentStyles.termsSectionTitle}>Order Inclusion Policy</Text>
            <View style={currentStyles.termsList}>
              <View style={currentStyles.termsListItem}>
                <Text style={currentStyles.termsListBullet}>•</Text>
                <Text style={currentStyles.termsListText}>Only orders with PAID payment status are included in payouts</Text>
              </View>
              <View style={currentStyles.termsListItem}>
                <Text style={currentStyles.termsListBullet}>•</Text>
                <Text style={currentStyles.termsListText}>Refunded orders are automatically excluded from payout calculations</Text>
              </View>
              <View style={currentStyles.termsListItem}>
                <Text style={currentStyles.termsListBullet}>•</Text>
                <Text style={currentStyles.termsListText}>Pending or cancelled orders are not included until payment is confirmed</Text>
              </View>
              <View style={currentStyles.termsListItem}>
                <Text style={currentStyles.termsListBullet}>•</Text>
                <Text style={currentStyles.termsListText}>Orders are counted based on the date payment was received</Text>
              </View>
            </View>
          </View>

          {/* Bank Details */}
          <View style={currentStyles.termsSection}>
            <Text style={currentStyles.termsSectionTitle}>Bank Details & Payments</Text>
            <Text style={currentStyles.termsText}>
              Ensure your bank details are correctly configured in your Organization Settings. Payments are sent via bank transfer to the account on
              file. Changes to bank details apply to future payouts only. Please allow 1-3 business days for bank transfers to reflect in your
              account.
            </Text>
          </View>

          {/* FAQ Section */}
          <View style={currentStyles.termsSection}>
            <Text style={currentStyles.termsSectionTitle}>Frequently Asked Questions</Text>

            <View style={currentStyles.faqItem}>
              <Text style={currentStyles.faqQuestion}>Q: When will I receive my payout?</Text>
              <Text style={currentStyles.faqAnswer}>
                A: Payments are processed every Friday. You will receive an email confirmation once payment has been sent. Bank transfers typically
                take 1-3 business days to reflect.
              </Text>
            </View>

            <View style={currentStyles.faqItem}>
              <Text style={currentStyles.faqQuestion}>Q: Why is my order count different from what I expected?</Text>
              <Text style={currentStyles.faqAnswer}>
                A: Only orders with confirmed PAID status during the payout period are included. Refunded, cancelled, or pending orders are excluded
                from the calculation.
              </Text>
            </View>

            <View style={currentStyles.faqItem}>
              <Text style={currentStyles.faqQuestion}>Q: What if I notice an error in my invoice?</Text>
              <Text style={currentStyles.faqAnswer}>
                A: Contact our support team at support@merchkins.com within 7 days of invoice generation. Please include your invoice number and a
                description of the discrepancy.
              </Text>
            </View>

            <View style={currentStyles.faqItem}>
              <Text style={currentStyles.faqQuestion}>Q: Can I change my bank details?</Text>
              <Text style={currentStyles.faqAnswer}>
                A: Yes, you can update your bank details anytime in Organization Settings → Payouts. Changes will apply to future payouts only.
                Current pending invoices use existing details.
              </Text>
            </View>
          </View>

          {/* Contact */}
          <View style={currentStyles.termsSection}>
            <Text style={currentStyles.termsSectionTitle}>Need Help?</Text>
            <Text style={currentStyles.termsText}>
              For questions, concerns, or assistance with your payouts, please contact our support team at support@merchkins.com. We're here to help
              ensure you have a smooth payout experience.
            </Text>
          </View>
        </View>

        <View style={currentStyles.footer} fixed>
          <View style={currentStyles.footerContent}>
            <View>
              <Text style={currentStyles.footerText}>This is a computer-generated invoice. No signature required.</Text>
              <Text style={currentStyles.footerText}>Generated by Merchkins Payout System</Text>
            </View>
            <View style={currentStyles.footerBrand}>
              <Text style={currentStyles.footerLogo}>merchkins</Text>
              <Text style={currentStyles.footerContact}>support@merchkins.com</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
