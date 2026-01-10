/**
 * Welcome Email Template
 * Merchkins brand design - First impression with brand gradients and neon accents
 */

import { EMAIL_ASSETS, EMAIL_COLORS, EMAIL_SPACING, EMAIL_FONT_SIZES } from './constants';
import {
  createEmailWrapper,
  createBrandHeader,
  createEmailBody,
  createEmailFooter,
  createParagraph,
  createCenteredButton,
  createBrandGradientBox,
  createDivider,
  createFeatureRow,
} from './builders';

export interface WelcomeEmailData {
  firstName: string;
  email: string;
}

/**
 * Generate the welcome email HTML - Premium dark mode design
 */
export const generateWelcomeEmail = (data: WelcomeEmailData): { subject: string; html: string } => {
  const subject = `Welcome to Merchkins, ${data.firstName}! ⚡`;

  const bodyContent = `
    <!-- Personalized greeting -->
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Hey ${data.firstName} 👋
    </p>
    
    ${createParagraph('Welcome to <strong style="color: #4f7df9; background: linear-gradient(135deg, #1d43d8 0%, #4f7df9 50%, #adfc04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Merchkins</strong> — where creators and organizations sell their merch, and fans discover unique drops.')}
    
    ${createParagraph("You're now part of a community that values authentic merchandise and seamless shopping. Here's what you can do:")}
    
    ${createFeatureRow('🛍️', 'Discover Unique Drops', 'Shop exclusive merchandise from your favorite creators and organizations.')}
    
    ${createFeatureRow('📦', 'Real-time Tracking', 'Know exactly where your order is, from checkout to doorstep.')}
    
    ${createFeatureRow('🔒', 'Secure Payments', 'Multiple payment options with bank-grade security.')}
    
    ${createFeatureRow('⭐', 'Share Your Experience', 'Review products and help the community make better choices.')}
    
    ${createDivider()}
    
    ${createBrandGradientBox('💡 <strong>Pro tip:</strong> Follow your favorite stores to get notified when they drop new merch!')}
    
    ${createCenteredButton({
      text: 'Start Exploring',
      url: EMAIL_ASSETS.appUrl,
      variant: 'primary',
    })}
    
    ${createParagraph("Questions? We're always here to help.", { muted: true, centered: true })}
    
    <p style="margin: ${EMAIL_SPACING.lg} 0 0; text-align: center; color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.base};">
      Happy shopping! 🎉<br>
      <strong style="color: ${EMAIL_COLORS.textPrimary};">The Merchkins Team</strong>
    </p>
  `;

  const html = createEmailWrapper(
    `
    ${createBrandHeader({
      title: 'Welcome to Merchkins',
      subtitle: 'Your merch journey starts now',
      statusType: 'primary',
      showLogo: true,
      useNeonAccent: false,
    })}
    ${createEmailBody(bodyContent)}
    ${createEmailFooter({ showSupportEmail: true })}
    `,
    subject
  );

  return { subject, html };
};
