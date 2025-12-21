'use node';

// Chatwoot Order Flow - Send OTP Email Action
// Node.js runtime for Mailgun email sending

import { v } from 'convex/values';
import { internalAction } from '../../_generated/server';
import { sendEmail, getNotificationsFromAddress } from '../../helpers/emailTemplates/mailgunClient';
import { EMAIL_COLORS, EMAIL_SPACING, EMAIL_FONT_SIZES, EMAIL_FONTS, EMAIL_RADIUS } from '../../helpers/emailTemplates/constants';
import { createEmailWrapper, createEmailHeader, createEmailBody, createEmailFooter } from '../../helpers/emailTemplates/builders';

export const sendOTPEmailArgs = {
  email: v.string(),
  code: v.string(),
};

/**
 * Generate OTP email HTML using the existing email template system
 */
function generateOTPEmail(code: string): { subject: string; html: string } {
  const subject = `Your Merchkins verification code: ${code}`;

  const bodyContent = `
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Verify your email
    </p>
    
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.base};">
      To complete your Messenger order, please enter this verification code:
    </p>
    
    <div style="background: ${EMAIL_COLORS.surfaceElevated}; padding: ${EMAIL_SPACING.xl}; text-align: center; border-radius: ${EMAIL_RADIUS.lg}; margin: ${EMAIL_SPACING.lg} 0; border: 1px solid ${EMAIL_COLORS.border};">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: ${EMAIL_COLORS.accent}; font-family: ${EMAIL_FONTS.mono};">${code}</span>
    </div>
    
    <p style="margin: 0 0 ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.sm};">
      This code expires in 10 minutes.
    </p>
    
    <p style="margin: 0; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.sm};">
      If you didn't request this code, you can safely ignore this email.
    </p>
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: 'Verification Code',
      subtitle: 'Confirm your email address',
      statusType: 'primary',
      showLogo: true,
    })}
    ${createEmailBody(bodyContent)}
    ${createEmailFooter({ showSupportEmail: true })}
    `,
    subject
  );

  return { subject, html };
}

export const sendOTPEmail = internalAction({
  args: sendOTPEmailArgs,
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const { email, code } = args;

    try {
      const { subject, html } = generateOTPEmail(code);

      const result = await sendEmail({
        to: email,
        subject,
        html,
        from: getNotificationsFromAddress(),
        fromName: 'Merchkins',
      });

      if (!result.success) {
        console.error('[Email Verification] Failed to send OTP email:', result.error);
      } else {
        console.log('[Email Verification] OTP email sent to:', email);
      }
    } catch (error) {
      console.error('[Email Verification] Error sending OTP email:', error);
    }

    return null;
  },
});
