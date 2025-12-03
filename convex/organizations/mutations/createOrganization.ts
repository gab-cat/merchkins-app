import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireAuthentication, logAction, isOrganizationSlugUnique, validateNotEmpty, validateStringLength, sanitizeString } from '../../helpers';

// Create new organization
export const createOrganizationArgs = {
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  logo: v.optional(v.string()),
  website: v.optional(v.string()),
  industry: v.optional(v.string()),
  size: v.optional(v.string()),
  organizationType: v.union(v.literal('PUBLIC'), v.literal('PRIVATE'), v.literal('SECRET')),
};

export const createOrganizationHandler = async (
  ctx: MutationCtx,
  args: {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    industry?: string;
    size?: string;
    organizationType: 'PUBLIC' | 'PRIVATE' | 'SECRET';
  }
) => {
  const { ...organizationData } = args;

  // Require authentication
  const currentUser = await requireAuthentication(ctx);

  // Validate inputs
  validateNotEmpty(organizationData.name, 'Organization name');
  validateNotEmpty(organizationData.slug, 'Organization slug');
  validateStringLength(organizationData.name, 'Organization name', 2, 100);
  validateStringLength(organizationData.slug, 'Organization slug', 2, 50);

  // Sanitize inputs
  organizationData.name = sanitizeString(organizationData.name);
  organizationData.slug = sanitizeString(organizationData.slug.toLowerCase());
  if (organizationData.description) {
    organizationData.description = sanitizeString(organizationData.description);
  }

  // Check if slug is already taken
  const isSlugUnique = await isOrganizationSlugUnique(ctx, organizationData.slug);
  if (!isSlugUnique) {
    throw new Error('Organization slug already exists');
  }

  // Create organization
  const organizationId = await ctx.db.insert('organizations', {
    ...organizationData,
    isDeleted: false,
    memberCount: 1,
    adminCount: 1,
    activeProductCount: 0,
    totalOrderCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Add creator as admin member
  await ctx.db.insert('organizationMembers', {
    userId: currentUser._id,
    organizationId,
    userInfo: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phone: currentUser.phone || '',
      imageUrl: currentUser.imageUrl,
      isStaff: currentUser.isStaff,
    },
    organizationInfo: {
      name: organizationData.name,
      slug: organizationData.slug,
      logo: organizationData.logo,
      organizationType: organizationData.organizationType,
    },
    role: 'ADMIN',
    isActive: true,
    joinedAt: Date.now(),
    lastActiveAt: Date.now(),
    permissions: [], // Admins have all permissions by default
    orderCount: 0,
    messageCount: 0,
    updatedAt: Date.now(),
  });

  // Log the action
  await logAction(
    ctx,
    'create_organization',
    'DATA_CHANGE',
    'MEDIUM',
    `Created organization: ${organizationData.name}`,
    currentUser._id,
    organizationId,
    { organizationSlug: organizationData.slug }
  );

  return organizationId;
};
