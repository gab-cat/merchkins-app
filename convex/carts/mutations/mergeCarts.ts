import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateCartExists, logAction } from '../../helpers';

export const mergeCartsArgs = {
  sourceCartId: v.id('carts'),
  targetCartId: v.id('carts'),
};

export const mergeCartsHandler = async (ctx: MutationCtx, args: { sourceCartId: Id<'carts'>; targetCartId: Id<'carts'> }) => {
  const currentUser = await requireAuthentication(ctx);
  const source = await validateCartExists(ctx, args.sourceCartId);
  const target = await validateCartExists(ctx, args.targetCartId);
  if (target.userId !== currentUser._id) throw new Error("Cannot modify another user's cart");

  // Merge strategy: sum quantities for same product+variant (prefer variantId), cap at inventory
  const mergedItems = [...target.embeddedItems];
  for (const item of source.embeddedItems) {
    const idx = mergedItems.findIndex((i) => {
      if (i.productInfo.productId !== item.productInfo.productId) return false;
      if (item.variantId != null) {
        return (i.variantId ?? null) === item.variantId;
      }
      return (i.variantId ?? null) === null && (i.productInfo.variantName ?? null) === (item.productInfo.variantName ?? null);
    });
    if (idx >= 0) {
      mergedItems[idx] = {
        ...mergedItems[idx],
        variantId: mergedItems[idx].variantId ?? item.variantId,
        quantity: Math.min(mergedItems[idx].quantity + item.quantity, item.productInfo.inventory),
        selected: mergedItems[idx].selected || item.selected,
        note: mergedItems[idx].note ?? item.note,
        addedAt: Math.max(mergedItems[idx].addedAt, item.addedAt),
      };
    } else {
      mergedItems.push(item);
    }
  }

  let totalItems = 0;
  let selectedItems = 0;
  let totalValue = 0;
  let selectedValue = 0;
  for (const item of mergedItems) {
    totalItems += item.quantity;
    totalValue += item.productInfo.price * item.quantity;
    if (item.selected) {
      selectedItems += item.quantity;
      selectedValue += item.productInfo.price * item.quantity;
    }
  }

  const now = Date.now();
  await ctx.db.patch(target._id, {
    embeddedItems: mergedItems,
    totalItems,
    selectedItems,
    totalValue,
    selectedValue,
    lastActivity: now,
    updatedAt: now,
  });

  await logAction(ctx, 'merge_carts', 'DATA_CHANGE', 'LOW', `Merged cart ${source._id} into ${target._id}`, currentUser._id, undefined, {
    sourceCartId: source._id,
    targetCartId: target._id,
  });

  return target._id;
};
