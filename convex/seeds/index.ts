import { action } from '../_generated/server';
import { internal } from '../_generated/api';
import { v } from 'convex/values';

// Run with: bunx convex run seeds:seedAction
export const seedAction = action({
  args: {
    secret: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const requiredSecret = process.env.SEED_SECRET;
    if (requiredSecret && args.secret !== requiredSecret) {
      throw new Error('Invalid seed secret');
    }

    const result: { ok: boolean } = await ctx.runMutation(internal.seeds.seedData.seedData, {});
    return result;
  },
});
