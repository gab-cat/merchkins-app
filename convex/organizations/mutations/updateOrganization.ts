import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import {
  logAction,
  sanitizeString,
  validateNotEmpty,
  validateStringLength,
  isOrganizationSlugUnique,
} from '../../helpers';

// Update organization details
export const updateOrganizationArgs = {
  organizationId: v.id('organizations'),
  name: v.optional(v.string()),
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  logo: v.optional(v.string()),
  bannerImage: v.optional(v.string()),
  website: v.optional(v.string()),
  industry: v.optional(v.string()),
  size: v.optional(v.string()),
  organizationType: v.optional(
    v.union(v.literal('PUBLIC'), v.literal('PRIVATE'), v.literal('SECRET')),
  ),
  themeSettings: v.optional(
    v.object({
      primaryColor: v.string(),
      secondaryColor: v.optional(v.string()),
      headerBackgroundColor: v.optional(v.string()),
      headerForegroundColor: v.optional(v.string()),
      headerTitleColor: v.optional(v.string()),
      footerBackgroundColor: v.optional(v.string()),
      footerForegroundColor: v.optional(v.string()),
      mode: v.optional(v.union(v.literal('light'), v.literal('dark'), v.literal('auto'))),
      fontFamily: v.optional(v.string()),
      borderRadius: v.optional(
        v.union(
          v.literal('none'),
          v.literal('small'),
          v.literal('medium'),
          v.literal('large'),
        ),
      ),
    }),
  ),
};

export const updateOrganizationHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    name?: string;
    slug?: string;
    description?: string;
    logo?: string;
    bannerImage?: string;
    website?: string;
    industry?: string;
    size?: string;
    organizationType?: 'PUBLIC' | 'PRIVATE' | 'SECRET';
    themeSettings?: {
      primaryColor: string;
      secondaryColor?: string;
      headerBackgroundColor?: string;
      headerForegroundColor?: string;
      headerTitleColor?: string;
      footerBackgroundColor?: string;
      footerForegroundColor?: string;
      mode?: 'light' | 'dark' | 'auto';
      fontFamily?: string;
      borderRadius?: 'none' | 'small' | 'medium' | 'large';
    };
  },
) => {
  const { organizationId, ...updates } = args;
  
  // Get current organization
  const organization = await ctx.db.get(organizationId);
  if (!organization || organization.isDeleted) {
    throw new Error("Organization not found");
  }

  // Handle slug update: sanitize, validate, uniqueness
  if (updates.slug !== undefined) {
    const desired = sanitizeString(String(updates.slug).toLowerCase());
    validateNotEmpty(desired, 'Organization slug');
    validateStringLength(desired, 'Organization slug', 2, 50);
    if (desired !== organization.slug) {
      const unique = await isOrganizationSlugUnique(
        ctx,
        desired,
        organizationId as unknown as string,
      );
      if (!unique) {
        throw new Error('Organization slug already exists');
      }
    }
    updates.slug = desired;
  }
  
  // Compute diff for audit trail
  const changed: Record<string, { previous: unknown; next: unknown }> = {};
  for (const key of Object.keys(updates) as Array<keyof typeof updates>) {
    const nextVal = updates[key];
    const prevVal = (organization as any)[key];
    if (nextVal !== undefined) {
      const different = JSON.stringify(prevVal) !== JSON.stringify(nextVal);
      if (different) {
        changed[key as string] = { previous: prevVal, next: nextVal };
      }
    }
  }

  // Update organization
  await ctx.db.patch(organizationId, {
    ...updates,
    updatedAt: Date.now(),
  });
  
  // If name/logo/type/slug changed, update embedded organization info across tables
  const nameChanged = updates.name !== undefined;
  const slugChanged = updates.slug !== undefined;
  const logoChanged = updates.logo !== undefined;
  const typeChanged = updates.organizationType !== undefined;
  if (nameChanged || slugChanged || logoChanged || typeChanged) {
    const newName = updates.name ?? organization.name;
    const newSlug = updates.slug ?? organization.slug;
    const newLogo = updates.logo ?? organization.logo;
    const newType = updates.organizationType ?? organization.organizationType;

    // organizationMembers
    const members = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect();
    for (const member of members) {
      await ctx.db.patch(member._id, {
        organizationInfo: {
          name: newName,
          slug: newSlug,
          logo: newLogo,
          organizationType: newType,
        },
        updatedAt: Date.now(),
      });
    }

    // organizationInviteLinks
    const invites = await ctx.db
      .query('organizationInviteLinks')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect();
    for (const link of invites) {
      await ctx.db.patch(link._id, {
        organizationInfo: {
          name: newName,
          slug: newSlug,
          logo: newLogo,
        },
        updatedAt: Date.now(),
      });
    }

    // categories
    const categories = await ctx.db
      .query('categories')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect();
    for (const category of categories) {
      await ctx.db.patch(category._id, {
        organizationInfo: {
          name: newName,
          slug: newSlug,
          logo: newLogo,
        },
        updatedAt: Date.now(),
      });
    }

    // products
    const products = await ctx.db
      .query('products')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect();
    for (const product of products) {
      await ctx.db.patch(product._id, {
        organizationInfo: {
          name: newName,
          slug: newSlug,
          logo: newLogo,
        },
        updatedAt: Date.now(),
      });
    }

    // messages
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect();
    for (const message of messages) {
      await ctx.db.patch(message._id, {
        organizationInfo: {
          name: newName,
          slug: newSlug,
          logo: newLogo,
        },
        updatedAt: Date.now(),
      });
    }

    // orders
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect();
    for (const order of orders) {
      await ctx.db.patch(order._id, {
        organizationInfo: {
          name: newName,
          slug: newSlug,
          logo: newLogo,
        },
        updatedAt: Date.now(),
      });
    }

    // payments
    const payments = await ctx.db
      .query('payments')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect();
    for (const payment of payments) {
      await ctx.db.patch(payment._id, {
        organizationInfo: {
          name: newName,
          slug: newSlug,
          logo: newLogo,
        },
        updatedAt: Date.now(),
      });
    }

    // announcements
    const announcements = await ctx.db
      .query('announcements')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect();
    for (const ann of announcements) {
      await ctx.db.patch(ann._id, {
        organizationInfo: {
          name: newName,
          slug: newSlug,
          logo: newLogo,
        },
        updatedAt: Date.now(),
      });
    }

    // logs
    const logs = await ctx.db
      .query('logs')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .collect();
    for (const log of logs) {
      await ctx.db.patch(log._id, {
        organizationInfo: {
          name: newName,
          slug: newSlug,
          logo: newLogo,
        },
        updatedAt: Date.now(),
      });
    }
  }
  
  // Audit log only when there are meaningful changes
  if (Object.keys(changed).length > 0) {
    await logAction(
      ctx,
      'update_organization_settings',
      'AUDIT_TRAIL',
      'MEDIUM',
      `Updated organization settings for ${organization.name}`,
      undefined,
      organizationId,
      { changedKeys: Object.keys(changed) },
      {
        resourceType: 'organization',
        resourceId: organizationId as unknown as string,
        previousValue: Object.fromEntries(
          Object.entries(changed).map(([k, v]) => [k, v.previous]),
        ),
        newValue: Object.fromEntries(
          Object.entries(changed).map(([k, v]) => [k, v.next]),
        ),
      },
    );
  }

  return { success: true };
};
