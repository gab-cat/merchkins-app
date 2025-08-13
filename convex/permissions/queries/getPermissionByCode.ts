import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { requireStaffOrAdmin } from "../../helpers";

// Get a permission by code
export const getPermissionByCodeArgs = {
  code: v.string(),
};

export const getPermissionByCodeHandler = async (
  ctx: QueryCtx,
  args: {
    code: string;
  }
) => {
  // Require staff or admin to view permission details
  await requireStaffOrAdmin(ctx);
  
  const permission = await ctx.db
    .query("permissions")
    .withIndex("by_code", (q) => q.eq("code", args.code))
    .first();
  
  return permission || null;
};
