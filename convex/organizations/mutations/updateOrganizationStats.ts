import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Update organization statistics (called internally when orders, products, etc. are created/updated)
export const updateOrganizationStatsArgs = {
  organizationId: v.id("organizations"),
  incrementProducts: v.optional(v.boolean()),
  incrementOrders: v.optional(v.boolean()),
  decrementProducts: v.optional(v.boolean()),
  decrementOrders: v.optional(v.boolean()),
};

export const updateOrganizationStatsHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<"organizations">;
    incrementProducts?: boolean;
    incrementOrders?: boolean;
    decrementProducts?: boolean;
    decrementOrders?: boolean;
  }
) => {
  const { 
    organizationId, 
    incrementProducts = false, 
    incrementOrders = false,
    decrementProducts = false,
    decrementOrders = false
  } = args;
  
  // Get organization
  const organization = await ctx.db.get(organizationId);
  if (!organization || organization.isDeleted) {
    throw new Error("Organization not found");
  }
  
  const updates = {
    updatedAt: Date.now(),
  } as Record<string, unknown>;
  
  if (incrementProducts) {
    updates.activeProductCount = organization.activeProductCount + 1;
  }
  
  if (decrementProducts) {
    updates.activeProductCount = Math.max(0, organization.activeProductCount - 1);
  }
  
  if (incrementOrders) {
    updates.totalOrderCount = organization.totalOrderCount + 1;
  }
  
  if (decrementOrders) {
    updates.totalOrderCount = Math.max(0, organization.totalOrderCount - 1);
  }
  
  // Update organization stats
  await ctx.db.patch(organizationId, updates);
  
  return { success: true };
};
