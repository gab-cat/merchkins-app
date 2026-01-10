'use node';

import { action } from '../../_generated/server';
import { v } from 'convex/values';
import { api } from '../../_generated/api';
import { generateOrganizationInviteEmail } from '../../helpers/emailTemplates/organizationInvite';
import { sendEmail, getNotificationsFromAddress } from '../../helpers/emailTemplates/mailgunClient';

/**
 * Send invitation emails to multiple recipients
 */
export const sendInviteEmail = action({
  args: {
    inviteLinkId: v.id('organizationInviteLinks'),
    emailAddresses: v.array(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    results: v.array(
      v.object({
        email: v.string(),
        success: v.boolean(),
        error: v.optional(v.string()),
      })
    ),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; results: Array<{ email: string; success: boolean; error?: string }> }> => {
    const { inviteLinkId, emailAddresses } = args;

    const MAX_RECIPIENTS = 50;

    // Validate email addresses
    if (emailAddresses.length === 0) {
      return {
        success: false,
        results: [],
      };
    }

    if (emailAddresses.length > MAX_RECIPIENTS) {
      return {
        success: false,
        results: emailAddresses.map((email) => ({
          email,
          success: false,
          error: `Cannot send to more than ${MAX_RECIPIENTS} recipients at once`,
        })),
      };
    }

    // Fetch the invite link from the database
    const targetInviteLink = await ctx.runQuery(api.organizations.queries.index.getInviteLinkById, {
      inviteLinkId,
    });

    if (!targetInviteLink) {
      return {
        success: false,
        results: emailAddresses.map((email) => ({
          email,
          success: false,
          error: 'Invite link not found',
        })),
      };
    }

    // Validate invite link is active
    if (!targetInviteLink.isActive) {
      return {
        success: false,
        results: emailAddresses.map((email) => ({
          email,
          success: false,
          error: 'Invite link is not active',
        })),
      };
    }

    // Check expiration
    if (targetInviteLink.expiresAt && targetInviteLink.expiresAt < Date.now()) {
      return {
        success: false,
        results: emailAddresses.map((email) => ({
          email,
          success: false,
          error: 'Invite link has expired',
        })),
      };
    }

    // Check usage limit
    if (targetInviteLink.usageLimit && targetInviteLink.usedCount >= targetInviteLink.usageLimit) {
      return {
        success: false,
        results: emailAddresses.map((email) => ({
          email,
          success: false,
          error: 'Invite link usage limit reached',
        })),
      };
    }

    // Build the invite link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';
    const inviteLinkUrl = `${baseUrl}/invite/${targetInviteLink.code}`;

    // Build creator name
    const creatorName =
      [targetInviteLink.creatorInfo?.firstName, targetInviteLink.creatorInfo?.lastName].filter(Boolean).join(' ') ||
      targetInviteLink.creatorInfo?.email ||
      'Someone';

    // Send emails to all recipients
    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const emailAddress of emailAddresses) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress.trim())) {
        results.push({
          email: emailAddress,
          success: false,
          error: 'Invalid email address format',
        });
        continue;
      }

      try {
        // Generate email template
        const { subject, html } = generateOrganizationInviteEmail({
          recipientEmail: emailAddress.trim(),
          organizationName: targetInviteLink.organizationInfo.name,
          organizationLogo: targetInviteLink.organizationInfo.logo,
          creatorName,
          inviteLinkUrl,
          expiresAt: targetInviteLink.expiresAt,
          usageLimit: targetInviteLink.usageLimit,
          usedCount: targetInviteLink.usedCount,
        });

        // Send email via Mailgun
        const emailResult = await sendEmail({
          to: emailAddress.trim(),
          subject,
          html,
          from: getNotificationsFromAddress(),
          fromName: targetInviteLink.organizationInfo.name || 'Merchkins',
        });

        if (!emailResult.success) {
          results.push({
            email: emailAddress,
            success: false,
            error: emailResult.error || 'Failed to send email',
          });
        } else {
          results.push({
            email: emailAddress,
            success: true,
          });
          console.log(`Invitation email sent successfully for organization ${targetInviteLink.organizationInfo.name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error sending invitation email for organization ${targetInviteLink.organizationInfo.name}:`, errorMessage);
        results.push({
          email: emailAddress,
          success: false,
          error: errorMessage,
        });
      }
    }

    // Determine overall success (at least one email sent successfully)
    const overallSuccess = results.some((r) => r.success);

    return {
      success: overallSuccess,
      results,
    };
  },
});
