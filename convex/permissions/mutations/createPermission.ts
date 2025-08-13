import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { 
  requireAdmin, 
  logAction, 
  validateNotEmpty, 
  validateStringLength, 
  sanitizeString 
} from "../../helpers";

// Create a new permission
export const createPermissionArgs = {
  code: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  category: v.union(
    v.literal("USER_MANAGEMENT"),
    v.literal("PRODUCT_MANAGEMENT"),
    v.literal("ORDER_MANAGEMENT"),
    v.literal("PAYMENT_MANAGEMENT"),
    v.literal("ORGANIZATION_MANAGEMENT"),
    v.literal("SYSTEM_ADMINISTRATION")
  ),
  defaultSettings: v.object({
    canCreate: v.boolean(),
    canRead: v.boolean(),
    canUpdate: v.boolean(),
    canDelete: v.boolean(),
  }),
  isSystemPermission: v.optional(v.boolean()),
  requiredRole: v.optional(v.union(
    v.literal("ADMIN"),
    v.literal("STAFF"),
    v.literal("MEMBER")
  )),
};

export const createPermissionHandler = async (
  ctx: MutationCtx,
  args: {
    code: string;
    name: string;
    description?: string;
    category: "USER_MANAGEMENT" | "PRODUCT_MANAGEMENT" | "ORDER_MANAGEMENT" | "PAYMENT_MANAGEMENT" | "ORGANIZATION_MANAGEMENT" | "SYSTEM_ADMINISTRATION";
    defaultSettings: {
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    };
    isSystemPermission?: boolean;
    requiredRole?: "ADMIN" | "STAFF" | "MEMBER";
  }
) => {
  // Require admin privileges for permission creation
  const currentUser = await requireAdmin(ctx);
  
  // Validate inputs
  validateNotEmpty(args.code, "Permission code");
  validateNotEmpty(args.name, "Permission name");
  validateStringLength(args.code, "Permission code", 2, 50);
  validateStringLength(args.name, "Permission name", 2, 100);
  
  // Sanitize inputs
  const sanitizedCode = sanitizeString(args.code.toUpperCase().replace(/[^A-Z0-9_]/g, '_'));
  const sanitizedName = sanitizeString(args.name);
  const sanitizedDescription = args.description ? sanitizeString(args.description) : undefined;
  
  // Check if permission code already exists
  const existingPermission = await ctx.db
    .query("permissions")
    .withIndex("by_code", (q) => q.eq("code", sanitizedCode))
    .first();
    
  if (existingPermission) {
    throw new Error("Permission code already exists");
  }
  
  // Create permission
  const permissionId = await ctx.db.insert("permissions", {
    code: sanitizedCode,
    name: sanitizedName,
    description: sanitizedDescription,
    category: args.category,
    defaultSettings: args.defaultSettings,
    isActive: true,
    isSystemPermission: args.isSystemPermission || false,
    requiredRole: args.requiredRole,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  
  // Log the action
  await logAction(
    ctx,
    "create_permission",
    "SYSTEM_EVENT",
    "HIGH",
    `Created permission: ${sanitizedName} (${sanitizedCode})`,
    currentUser._id,
    undefined,
    { 
      permissionId,
      permissionCode: sanitizedCode,
      category: args.category,
      isSystemPermission: args.isSystemPermission || false
    }
  );
  
  return permissionId;
};
