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
};

export const createInviteLinkHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    createdById: Id<'users'>;
    expiresAt?: number;
    usageLimit?: number;
  }
) => {
  const { organizationId, createdById, expiresAt, usageLimit } = args;

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

  // Generate unique invite code
  const code = generateInviteCode();

  // Create invite link
  const inviteLinkId = await ctx.db.insert('organizationInviteLinks', {
    organizationId,
    code,
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
    { code, expiresAt, usageLimit },
    { resourceType: 'organization_invite', resourceId: inviteLinkId as unknown as string }
  );

  return { inviteLinkId, code };
};

// Helper function to generate invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
