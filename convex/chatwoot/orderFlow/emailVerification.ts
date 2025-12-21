// Chatwoot Order Flow - Email Verification Mutations
// OTP generation, storage, and verification (V8 runtime)

import { v } from 'convex/values';
import { internalMutation, MutationCtx } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

const MAX_ATTEMPTS = 3;

// ============= MUTATIONS =============

export const createVerificationCodeArgs = {
  email: v.string(),
  code: v.string(),
  chatwootContactId: v.optional(v.number()),
  expiresAt: v.number(),
};

export const createVerificationCodeHandler = async (
  ctx: MutationCtx,
  args: {
    email: string;
    code: string;
    chatwootContactId?: number;
    expiresAt: number;
  }
) => {
  const now = Date.now();

  // Delete any existing codes for this email
  const existing = await ctx.db
    .query('emailVerificationCodes')
    .withIndex('by_email', (q) => q.eq('email', args.email))
    .collect();

  for (const code of existing) {
    await ctx.db.delete(code._id);
  }

  // Create new code
  const codeId = await ctx.db.insert('emailVerificationCodes', {
    email: args.email,
    code: args.code,
    chatwootContactId: args.chatwootContactId,
    expiresAt: args.expiresAt,
    attempts: 0,
    verified: false,
    createdAt: now,
  });

  return codeId;
};

export const createVerificationCode = internalMutation({
  args: createVerificationCodeArgs,
  returns: v.id('emailVerificationCodes'),
  handler: createVerificationCodeHandler,
});

export const verifyCodeArgs = {
  email: v.string(),
  code: v.string(),
};

export const verifyCodeHandler = async (
  ctx: MutationCtx,
  args: {
    email: string;
    code: string;
  }
): Promise<{ success: boolean; reason?: string; attemptsRemaining?: number }> => {
  const now = Date.now();

  // Find the verification code
  const verification = await ctx.db
    .query('emailVerificationCodes')
    .withIndex('by_email', (q) => q.eq('email', args.email))
    .filter((q) => q.and(q.eq(q.field('verified'), false), q.gt(q.field('expiresAt'), now)))
    .first();

  if (!verification) {
    return { success: false, reason: 'expired' };
  }

  // Check if max attempts reached
  if (verification.attempts >= MAX_ATTEMPTS) {
    return { success: false, reason: 'max_attempts', attemptsRemaining: 0 };
  }

  // Check if code matches
  if (verification.code !== args.code) {
    // Increment attempts
    await ctx.db.patch(verification._id, {
      attempts: verification.attempts + 1,
    });
    const remaining = MAX_ATTEMPTS - verification.attempts - 1;
    return {
      success: false,
      reason: remaining <= 0 ? 'max_attempts' : 'invalid',
      attemptsRemaining: remaining,
    };
  }

  // Code is correct - mark as verified
  await ctx.db.patch(verification._id, {
    verified: true,
  });

  return { success: true };
};

export const verifyCode = internalMutation({
  args: verifyCodeArgs,
  returns: v.object({
    success: v.boolean(),
    reason: v.optional(v.string()),
    attemptsRemaining: v.optional(v.number()),
  }),
  handler: verifyCodeHandler,
});

export const getOrCreateUserArgs = {
  email: v.string(),
  chatwootContactId: v.number(),
  firstName: v.optional(v.string()),
};

export const getOrCreateUserHandler = async (
  ctx: MutationCtx,
  args: {
    email: string;
    chatwootContactId: number;
    firstName?: string;
  }
): Promise<Id<'users'>> => {
  const now = Date.now();

  // Check if user exists by email
  const existingByEmail = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', args.email))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  if (existingByEmail) {
    // Link chatwootContactId if not already set
    if (!existingByEmail.chatwootContactId) {
      await ctx.db.patch(existingByEmail._id, {
        chatwootContactId: args.chatwootContactId,
        updatedAt: now,
      });
    }
    return existingByEmail._id;
  }

  // Check if user exists by chatwootContactId
  const existingByContact = await ctx.db
    .query('users')
    .withIndex('by_chatwoot_contact', (q) => q.eq('chatwootContactId', args.chatwootContactId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  if (existingByContact) {
    // Update email if different
    if (existingByContact.email !== args.email) {
      await ctx.db.patch(existingByContact._id, {
        email: args.email,
        updatedAt: now,
      });
    }
    return existingByContact._id;
  }

  // Create new user (no clerkId - will be merged when they sign up via Clerk)
  const userId = await ctx.db.insert('users', {
    clerkId: '', // Empty - will be set when user signs up via Clerk
    email: args.email,
    firstName: args.firstName,
    chatwootContactId: args.chatwootContactId,
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

  return userId;
};

export const getOrCreateUser = internalMutation({
  args: getOrCreateUserArgs,
  returns: v.id('users'),
  handler: getOrCreateUserHandler,
});
