import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { requireStaffOrAdmin } from "../../helpers";

// Get permissions by category
export const getPermissionsByCategoryArgs = {
  category: v.union(
    v.literal("USER_MANAGEMENT"),
    v.literal("PRODUCT_MANAGEMENT"),
    v.literal("ORDER_MANAGEMENT"),
    v.literal("PAYMENT_MANAGEMENT"),
    v.literal("ORGANIZATION_MANAGEMENT"),
    v.literal("SYSTEM_ADMINISTRATION")
  ),
  includeInactive: v.optional(v.boolean()),
};

export const getPermissionsByCategoryHandler = async (
  ctx: QueryCtx,
  args: {
    category: "USER_MANAGEMENT" | "PRODUCT_MANAGEMENT" | "ORDER_MANAGEMENT" | "PAYMENT_MANAGEMENT" | "ORGANIZATION_MANAGEMENT" | "SYSTEM_ADMINISTRATION";
    includeInactive?: boolean;
  }
) => {
  // Require staff or admin to view permissions
  await requireStaffOrAdmin(ctx);
  
  const { category, includeInactive = false } = args;
  
  let query = ctx.db
    .query("permissions")
    .withIndex("by_category", (q) => q.eq("category", category));
  
  // Filter by active status if needed
  if (!includeInactive) {
    query = query.filter((q) => q.eq(q.field("isActive"), true));
  }
  
  const permissions = await query.collect();
  
  return permissions.map(permission => ({
    _id: permission._id,
    code: permission.code,
    name: permission.name,
    description: permission.description,
    category: permission.category,
    isActive: permission.isActive,
    isSystemPermission: permission.isSystemPermission,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  }));
};
