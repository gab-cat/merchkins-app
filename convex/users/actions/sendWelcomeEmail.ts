'use node';

import { internalAction } from '../../_generated/server';
import { v } from 'convex/values';
import { generateWelcomeEmail } from '../../helpers/emailTemplates/welcomeEmail';
import { sendEmail, getSupportFromAddress } from '../../helpers/emailTemplates/mailgunClient';

/**
 * Internal action to send welcome email to new users
 * Called via scheduler from the Clerk webhook handler
 */
export const sendWelcomeEmail = internalAction({
  args: {
    userId: v.id('users'),
    firstName: v.string(),
    email: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      // Generate welcome email content
      const { subject, html } = generateWelcomeEmail({
        firstName: args.firstName || 'there',
        email: args.email,
      });

      // Send via Mailgun
      const result = await sendEmail({
        to: args.email,
        subject,
        html,
        from: getSupportFromAddress(),
        fromName: 'Merchkins',
      });

      if (!result.success) {
        console.error('Failed to send welcome email:', result.error);
        return { success: false, error: result.error };
      }

      console.log(`Welcome email sent successfully to ${args.email}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error sending welcome email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
});
