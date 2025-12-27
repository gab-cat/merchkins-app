import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { Id } from '../../_generated/dataModel';

export const verifyOTP = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    userId: v.optional(v.id('users')),
    reason: v.optional(v.string()),
    attemptsRemaining: v.optional(v.number()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    userId?: Id<'users'>;
    reason?: string;
    attemptsRemaining?: number;
  }> => {
    // Verify OTP using existing verification logic
    const result: {
      success: boolean;
      reason?: string;
      attemptsRemaining?: number;
    } = await ctx.runMutation(internal.chatwoot.orderFlow.emailVerification.verifyCode, {
      email: args.email.trim().toLowerCase(),
      code: args.code.trim(),
    });

    if (!result.success) {
      return {
        success: false,
        reason: result.reason,
        attemptsRemaining: result.attemptsRemaining,
      };
    }

    // OTP verified - get or create placeholder user
    // We'll create a simplified version without chatwootContactId
    const email = args.email.trim().toLowerCase();
    const now = Date.now();

    // Check if user exists by email
    const existingByEmail = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .first();

    let userId: Id<'users'>;

    if (existingByEmail) {
      // User exists - use it (could be placeholder or real user)
      userId = existingByEmail._id;
    } else {
      // Create new placeholder user (no clerkId - will be merged when they sign up via Clerk)
      userId = await ctx.db.insert('users', {
        clerkId: '', // Empty - will be set when user signs up via Clerk
        email,
        firstName: undefined,
        lastName: undefined,
        chatwootContactId: undefined,
        isDeleted: false,
        isOnboarded: false,
        isStaff: false,
        isAdmin: false,
        isSetupDone: false,
        isMerchant: false,
        permissions: [],
        totalOrders: 0,
        totalSpent: 0,
        reviewCount: 0,
        organizationMemberships: [],
        profileVisibility: 'public',
        notificationPrefs: {
          emailNotifications: true,
          pushNotifications: true,
          orderUpdates: true,
          promotionalEmails: false,
        },
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      userId,
    };
  },
});
