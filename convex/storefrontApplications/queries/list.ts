import { internalQuery } from '../../_generated/server';
import { v } from 'convex/values';

/**
 * List all storefront applications for super admin.
 * Internal query - only accessible by super admins through other functions.
 */
export const list = internalQuery({
  args: {
    status: v.optional(v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED'))),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id('storefrontApplications'),
      _creationTime: v.number(),
      businessName: v.string(),
      contactName: v.string(),
      email: v.string(),
      phone: v.string(),
      description: v.optional(v.string()),
      status: v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED')),
      reviewedById: v.optional(v.id('users')),
      notes: v.optional(v.string()),
      reviewedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const baseQuery = ctx.db.query('storefrontApplications').withIndex('by_createdAt');

    const query = args.status ? baseQuery.filter((q) => q.eq(q.field('status'), args.status)) : baseQuery;

    const applications = await query.order('desc').take(limit);

    return applications;
  },
});
