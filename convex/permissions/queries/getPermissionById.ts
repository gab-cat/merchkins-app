import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireStaffOrAdmin } from "../../helpers";

// Get a specific permission by ID
export const getPermissionByIdArgs = {
  permissionId: v.id("permissions"),
};

export const getPermissionByIdHandler = async (
  ctx: QueryCtx,
  args: {
    permissionId: Id<"permissions">;
  }
) => {
  // Require staff or admin to view permission details
  await requireStaffOrAdmin(ctx);
  
  const permission = await ctx.db.get(args.permissionId);
  
  if (!permission) {
    return null;
  }
  
  return permission;
};
