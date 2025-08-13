import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireAdmin, 
  logAction, 
  validateNotEmpty, 
  validateStringLength, 
  sanitizeString 
} from "../../helpers";

// Update an existing permission
export const updatePermissionArgs = {
  permissionId: v.id("permissions"),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  category: v.optional(v.union(
    v.literal("USER_MANAGEMENT"),
    v.literal("PRODUCT_MANAGEMENT"),
    v.literal("ORDER_MANAGEMENT"),
    v.literal("PAYMENT_MANAGEMENT"),
    v.literal("ORGANIZATION_MANAGEMENT"),
    v.literal("SYSTEM_ADMINISTRATION")
  )),
  defaultSettings: v.optional(v.object({
    canCreate: v.boolean(),
    canRead: v.boolean(),
    canUpdate: v.boolean(),
    canDelete: v.boolean(),
  })),
  isActive: v.optional(v.boolean()),
  requiredRole: v.optional(v.union(
    v.literal("ADMIN"),
    v.literal("STAFF"),
    v.literal("MEMBER")
  )),
};

export const updatePermissionHandler = async (
  ctx: MutationCtx,
  args: {
    permissionId: Id<"permissions">;
    name?: string;
    description?: string;
    category?: "USER_MANAGEMENT" | "PRODUCT_MANAGEMENT" | "ORDER_MANAGEMENT" | "PAYMENT_MANAGEMENT" | "ORGANIZATION_MANAGEMENT" | "SYSTEM_ADMINISTRATION";
    defaultSettings?: {
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    };
    isActive?: boolean;
    requiredRole?: "ADMIN" | "STAFF" | "MEMBER";
  }
) => {
  // Require admin privileges for permission updates
  const currentUser = await requireAdmin(ctx);
  
  // Get existing permission
  const permission = await ctx.db.get(args.permissionId);
  if (!permission) {
    throw new Error("Permission not found");
  }
  
  // Prevent updates to system permissions unless specifically allowed
  if (permission.isSystemPermission && !currentUser.isAdmin) {
    throw new Error("Cannot modify system permissions");
  }
  
  // Prepare updates
  const updates: Record<string, unknown> = {
    updatedAt: Date.now(),
  };
  
  // Validate and sanitize inputs
  if (args.name !== undefined) {
    validateNotEmpty(args.name, "Permission name");
    validateStringLength(args.name, "Permission name", 2, 100);
    updates.name = sanitizeString(args.name);
  }
  
  if (args.description !== undefined) {
    updates.description = args.description ? sanitizeString(args.description) : undefined;
  }
  
  if (args.category !== undefined) {
    updates.category = args.category;
  }
  
  if (args.defaultSettings !== undefined) {
    updates.defaultSettings = args.defaultSettings;
  }
  
  if (args.isActive !== undefined) {
    updates.isActive = args.isActive;
  }
  
  if (args.requiredRole !== undefined) {
    updates.requiredRole = args.requiredRole;
  }
  
  // Track what changed for logging
  const changedFields = Object.keys(updates).filter(key => key !== 'updatedAt');
  
  // Update permission
  await ctx.db.patch(args.permissionId, updates);
  
  // Log the action
  await logAction(
    ctx,
    "update_permission",
    "SYSTEM_EVENT",
    "MEDIUM",
    `Updated permission: ${permission.name} (${permission.code}) - Fields: ${changedFields.join(', ')}`,
    currentUser._id,
    undefined,
    { 
      permissionId: args.permissionId,
      permissionCode: permission.code,
      changedFields,
      previousValues: {
        name: permission.name,
        description: permission.description,
        category: permission.category,
        isActive: permission.isActive,
        requiredRole: permission.requiredRole
      },
      newValues: updates
    }
  );
  
  return { success: true };
};
