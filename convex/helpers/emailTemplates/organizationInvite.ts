/**
 * Organization Invite Email Template
 * Merchkins brand design - Invitation with brand gradients
 */

import { EMAIL_COLORS, EMAIL_SPACING, EMAIL_FONT_SIZES } from './constants';
import {
  createEmailWrapper,
  createEmailHeader,
  createEmailBody,
  createEmailFooter,
  createParagraph,
  createCenteredButton,
  createCard,
  createDivider,
  formatDate,
} from './builders';

export interface OrganizationInviteEmailData {
  recipientEmail: string;
  organizationName: string;
  organizationLogo?: string;
  creatorName: string;
  inviteLinkUrl: string;
  expiresAt?: number;
  usageLimit?: number;
  usedCount: number;
}

/**
 * Generate the organization invite email HTML
 */
export const generateOrganizationInviteEmail = (data: OrganizationInviteEmailData): { subject: string; html: string } => {
  const subject = `You're invited to join ${data.organizationName} on Merchkins 🎉`;

  // Format expiration info
  const expirationInfo = data.expiresAt ? `This invitation expires on ${formatDate(data.expiresAt)}.` : 'This invitation does not expire.';

  // Format usage limit info
  const remainingUses = data.usageLimit ? data.usageLimit - data.usedCount : null;
  const usageInfo =
    remainingUses !== null
      ? remainingUses > 0
        ? `This link can be used ${remainingUses} more time${remainingUses === 1 ? '' : 's'}.`
        : 'This invitation link has been fully used.'
      : 'This link has unlimited uses.';

  const bodyContent = `
    <!-- Personalized greeting -->
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Hello! 👋
    </p>
    
    ${createParagraph(`${data.creatorName} has invited you to join <strong style="color: ${EMAIL_COLORS.primary}; font-weight: 600;">${data.organizationName}</strong> on Merchkins.`)}
    
    ${createParagraph('Join this organization to collaborate, manage products, and grow your business together.')}
    
    ${createDivider()}
    
    ${createCard({
      title: 'Invitation Details',
      content: `
        <p style="margin: 0 0 ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.sm};">
          <strong style="color: ${EMAIL_COLORS.textPrimary};">Organization:</strong> ${data.organizationName}
        </p>
        <p style="margin: 0 0 ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.sm};">
          <strong style="color: ${EMAIL_COLORS.textPrimary};">Invited by:</strong> ${data.creatorName}
        </p>
        <p style="margin: 0 0 ${EMAIL_SPACING.sm}; color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.sm};">
          ${expirationInfo}
        </p>
        <p style="margin: 0; color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.sm};">
          ${usageInfo}
        </p>
      `,
      statusType: 'primary',
      showBorder: true,
    })}
    
    ${createDivider()}
    
    ${createCenteredButton({
      text: 'Accept Invitation',
      url: data.inviteLinkUrl,
      variant: 'primary',
    })}
    
    ${createParagraph('Or copy and paste this link into your browser:', { muted: true, centered: true })}
    
    <p style="margin: ${EMAIL_SPACING.sm} 0 ${EMAIL_SPACING.lg}; text-align: center;">
      <a href="${data.inviteLinkUrl}" style="color: ${EMAIL_COLORS.accent}; text-decoration: underline; word-break: break-all; font-size: ${EMAIL_FONT_SIZES.sm};">
        ${data.inviteLinkUrl}
      </a>
    </p>
    
    ${createDivider()}
    
    ${createParagraph("If you didn't expect this invitation, you can safely ignore this email.", { muted: true, centered: true })}
    
    <p style="margin: ${EMAIL_SPACING.lg} 0 0; text-align: center; color: ${EMAIL_COLORS.textSecondary}; font-size: ${EMAIL_FONT_SIZES.base};">
      Looking forward to having you on board! 🚀<br>
      <strong style="color: ${EMAIL_COLORS.textPrimary};">The Merchkins Team</strong>
    </p>
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: 'Organization Invitation',
      subtitle: `Join ${data.organizationName}`,
      statusType: 'primary',
      showLogo: true,
    })}
    ${createEmailBody(bodyContent)}
    ${createEmailFooter({ showSupportEmail: true })}
    `,
    subject
  );

  return { subject, html };
};
