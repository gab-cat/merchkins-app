import { mutation } from '../../_generated/server';
import { v } from 'convex/values';

/**
 * Submit a new storefront application.
 * This is a public mutation that anyone can call.
 */
export const submit = mutation({
  args: {
    businessName: v.string(),
    contactName: v.string(),
    email: v.string(),
    phone: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    applicationId: v.id('storefrontApplications'),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();

    const applicationId = await ctx.db.insert('storefrontApplications', {
      businessName: args.businessName,
      contactName: args.contactName,
      email: args.email,
      phone: args.phone,
      description: args.description,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      applicationId,
    };
  },
});
