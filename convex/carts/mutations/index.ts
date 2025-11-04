import { mutation, internalMutation } from '../../_generated/server';

// Import args and handlers
import { createOrGetCartArgs, createOrGetCartHandler } from './createOrGetCart';
import { addItemArgs, addItemHandler } from './addItem';
import { updateItemQuantityArgs, updateItemQuantityHandler } from './updateItemQuantity';
import { updateItemVariantArgs, updateItemVariantHandler } from './updateItemVariant';
import { removeItemArgs, removeItemHandler } from './removeItem';
import { removeMultipleItemsArgs, removeMultipleItemsHandler } from './removeMultipleItems';
import { clearCartArgs, clearCartHandler } from './clearCart';
import { setItemSelectedArgs, setItemSelectedHandler } from './setItemSelected';
import { setItemNoteArgs, setItemNoteHandler } from './setItemNote';
import { mergeCartsArgs, mergeCartsHandler } from './mergeCarts';
import { updateCartStatsArgs, updateCartStatsHandler } from './updateCartStats';
import { markAbandonedArgs, markAbandonedHandler } from './markAbandoned';

// Export mutation functions
export const createOrGetCart = mutation({
  args: createOrGetCartArgs,
  handler: createOrGetCartHandler,
});

export const addItem = mutation({
  args: addItemArgs,
  handler: addItemHandler,
});

export const updateItemQuantity = mutation({
  args: updateItemQuantityArgs,
  handler: updateItemQuantityHandler,
});

export const updateItemVariant = mutation({
  args: updateItemVariantArgs,
  handler: updateItemVariantHandler,
});

export const removeItem = mutation({
  args: removeItemArgs,
  handler: removeItemHandler,
});

export const removeMultipleItems = mutation({
  args: removeMultipleItemsArgs,
  handler: removeMultipleItemsHandler,
});

export const clearCart = mutation({
  args: clearCartArgs,
  handler: clearCartHandler,
});

export const setItemSelected = mutation({
  args: setItemSelectedArgs,
  handler: setItemSelectedHandler,
});

export const setItemNote = mutation({
  args: setItemNoteArgs,
  handler: setItemNoteHandler,
});

export const mergeCarts = mutation({
  args: mergeCartsArgs,
  handler: mergeCartsHandler,
});

export const updateCartStats = internalMutation({
  args: updateCartStatsArgs,
  handler: updateCartStatsHandler,
});

export const markAbandoned = internalMutation({
  args: markAbandonedArgs,
  handler: markAbandonedHandler,
});
