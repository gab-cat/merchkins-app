import { action } from '../_generated/server';
import { internal } from '../_generated/api';
import { v } from 'convex/values';

// Run with: bunx convex run migrations:runAddAllPermissions
export const runAddAllPermissions = action({
  args: {},
  returns: v.object({
    created: v.number(),
    skipped: v.number(),
    total: v.number(),
    report: v.array(v.string()),
  }),
  handler: async (ctx): Promise<{ created: number; skipped: number; total: number; report: string[] }> => {
    const result = await ctx.runMutation(internal.migrations.addAllPermissions.addAllPermissions, {});
    return result;
  },
});
