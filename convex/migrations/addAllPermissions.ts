import { internalMutation } from '../_generated/server';
import { v } from 'convex/values';
import { PERMISSION_CODES, PERMISSION_METADATA, type PermissionCode } from '../helpers/permissionCodes';

/**
 * Maps human-readable category names from PERMISSION_METADATA
 * to database enum values required by the permissions table schema
 */
function mapCategoryToEnum(
  category: string
): 'USER_MANAGEMENT' | 'PRODUCT_MANAGEMENT' | 'ORDER_MANAGEMENT' | 'PAYMENT_MANAGEMENT' | 'ORGANIZATION_MANAGEMENT' | 'SYSTEM_ADMINISTRATION' {
  const categoryMap: Record<
    string,
    'USER_MANAGEMENT' | 'PRODUCT_MANAGEMENT' | 'ORDER_MANAGEMENT' | 'PAYMENT_MANAGEMENT' | 'ORGANIZATION_MANAGEMENT' | 'SYSTEM_ADMINISTRATION'
  > = {
    'Order Management': 'ORDER_MANAGEMENT',
    'Product Management': 'PRODUCT_MANAGEMENT',
    Financial: 'PAYMENT_MANAGEMENT',
    'Organization Management': 'ORGANIZATION_MANAGEMENT',
    Support: 'SYSTEM_ADMINISTRATION',
    Communication: 'SYSTEM_ADMINISTRATION',
    'System Administration': 'SYSTEM_ADMINISTRATION',
  };

  const mapped = categoryMap[category];
  if (!mapped) {
    throw new Error(`Unknown category "${category}" - please add it to categoryMap`);
  }
  return mapped;
}

/**
 * Migration to add all 13 permissions from permissionCodes.ts to the database.
 * This migration is idempotent - it can be run multiple times safely.
 */
export const addAllPermissions = internalMutation({
  args: {},
  returns: v.object({
    created: v.number(),
    skipped: v.number(),
    total: v.number(),
    report: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    let created = 0;
    let skipped = 0;
    const report: string[] = [];

    // Get all permission codes from PERMISSION_CODES
    const permissionCodes = Object.values(PERMISSION_CODES) as PermissionCode[];

    for (const code of permissionCodes) {
      // Check if permission already exists
      const existing = await ctx.db
        .query('permissions')
        .withIndex('by_code', (q) => q.eq('code', code))
        .first();

      if (existing) {
        skipped++;
        report.push(`Skipped: ${code} (already exists)`);
        continue;
      }

      // Get metadata for this permission
      const metadata = PERMISSION_METADATA[code];
      if (!metadata) {
        report.push(`Error: No metadata found for ${code}`);
        continue;
      }

      // Map category to database enum
      const dbCategory = mapCategoryToEnum(metadata.category);

      // Create the permission
      await ctx.db.insert('permissions', {
        code,
        name: metadata.name,
        description: metadata.description,
        category: dbCategory,
        defaultSettings: {
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: false,
        },
        isActive: true,
        isSystemPermission: false,
        requiredRole: undefined,
        createdAt: now,
        updatedAt: now,
      });

      created++;
      report.push(`Created: ${code} (${metadata.name})`);
    }

    return {
      created,
      skipped,
      total: permissionCodes.length,
      report,
    };
  },
});
