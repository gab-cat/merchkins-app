import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { validateCartExists, validateNonNegativeNumber } from '../../helpers';

export const updateCartStatsArgs = {
  cartId: v.id('carts'),
  totalItems: v.optional(v.number()),
  selectedItems: v.optional(v.number()),
  totalValue: v.optional(v.number()),
  selectedValue: v.optional(v.number()),
  isAbandoned: v.optional(v.boolean()),
  abandonedAt: v.optional(v.number()),
};

export const updateCartStatsHandler = async (
  ctx: MutationCtx,
  args: {
    cartId: Id<'carts'>;
    totalItems?: number;
    selectedItems?: number;
    totalValue?: number;
    selectedValue?: number;
    isAbandoned?: boolean;
    abandonedAt?: number;
  }
) => {
  const cart = await validateCartExists(ctx, args.cartId);

  if (args.totalItems !== undefined) validateNonNegativeNumber(args.totalItems, 'totalItems');
  if (args.selectedItems !== undefined) validateNonNegativeNumber(args.selectedItems, 'selectedItems');
  if (args.totalValue !== undefined) validateNonNegativeNumber(args.totalValue, 'totalValue');
  if (args.selectedValue !== undefined) validateNonNegativeNumber(args.selectedValue, 'selectedValue');

  const updates: Record<string, unknown> = { updatedAt: Date.now() };
  if (args.totalItems !== undefined) updates.totalItems = args.totalItems;
  if (args.selectedItems !== undefined) updates.selectedItems = args.selectedItems;
  if (args.totalValue !== undefined) updates.totalValue = args.totalValue;
  if (args.selectedValue !== undefined) updates.selectedValue = args.selectedValue;
  if (args.isAbandoned !== undefined) updates.isAbandoned = args.isAbandoned;
  if (args.abandonedAt !== undefined) updates.abandonedAt = args.abandonedAt;

  await ctx.db.patch(cart._id, updates);
  return cart._id;
};
