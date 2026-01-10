import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { logAction, requireOrganizationPermission } from '../../helpers';

// Create organization invite link
export const createInviteLinkArgs = {
  organizationId: v.id('organizations'),
  createdById: v.id('users'),
  expiresAt: v.optional(v.number()),
  usageLimit: v.optional(v.number()),
  code: v.optional(v.string()),
};

export const createInviteLinkHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    createdById: Id<'users'>;
    expiresAt?: number;
    usageLimit?: number;
    code?: string;
  }
) => {
  const { organizationId, createdById, expiresAt, usageLimit, code } = args;

  // Get organization
  const organization = await ctx.db.get(organizationId);
  if (!organization || organization.isDeleted) {
    throw new Error('Organization not found');
  }

  // Get creator
  const creator = await ctx.db.get(createdById);
  if (!creator || creator.isDeleted) {
    throw new Error('Creator not found');
  }

  // Ensure actor has manage_members permission (and is current user)
  const { user: actor } = await requireOrganizationPermission(ctx, organizationId, 'MANAGE_MEMBERS', 'create');
  if (createdById !== actor._id) {
    throw new Error('createdById must match the authenticated user');
  }

  // Validate and get invite code
  let finalCode: string;
  if (code) {
    // Validate custom code format (alphanumeric only)
    const alphanumericRegex = /^[A-Z0-9]+$/;
    if (!alphanumericRegex.test(code)) {
      throw new Error('Code must contain only uppercase letters (A-Z) and numbers (0-9)');
    }

    // Check uniqueness against active invite links
    const existingInvite = await ctx.db
      .query('organizationInviteLinks')
      .withIndex('by_code', (q) => q.eq('code', code))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (existingInvite) {
      throw new Error('This code is already in use. Please choose a different code.');
    }

    finalCode = code;
  } else {
    // Generate unique invite code
    finalCode = await generateUniqueInviteCode(ctx);
  }

  // Create invite link
  const inviteLinkId = await ctx.db.insert('organizationInviteLinks', {
    organizationId,
    code: finalCode,
    createdById,
    creatorInfo: {
      firstName: creator.firstName,
      lastName: creator.lastName,
      email: creator.email,
      imageUrl: creator.imageUrl,
    },
    organizationInfo: {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    },
    expiresAt,
    isActive: true,
    usageLimit,
    usedCount: 0,
    usedBy: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Audit log
  await logAction(
    ctx,
    'create_invite_link',
    'AUDIT_TRAIL',
    'MEDIUM',
    `Created invite link for organization ${organization.name}`,
    createdById,
    organizationId,
    { code: finalCode, expiresAt, usageLimit },
    { resourceType: 'organization_invite', resourceId: inviteLinkId as unknown as string }
  );

  return { inviteLinkId, code: finalCode };
};

// Helper function to generate unique invite code
async function generateUniqueInviteCode(ctx: MutationCtx): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code is unique among active invite links
    const existingInvite = await ctx.db
      .query('organizationInviteLinks')
      .withIndex('by_code', (q) => q.eq('code', result))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!existingInvite) {
      return result;
    }
  }

  throw new Error('Failed to generate unique invite code after multiple attempts');
}
