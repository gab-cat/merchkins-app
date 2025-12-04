import { mutation, internalMutation, internalAction, action } from '../../_generated/server';
import { v } from 'convex/values';

import { createOrderArgs, createOrderHandler } from './createOrder';
import { updateOrderArgs, updateOrderHandler } from './updateOrder';
import { cancelOrderArgs, cancelOrderHandler } from './cancelOrder';
import { deleteOrderArgs, deleteOrderHandler } from './deleteOrder';
import { restoreOrderArgs, restoreOrderHandler } from './restoreOrder';
import { updateOrderStatsArgs, updateOrderStatsHandler } from './updateOrderStats';
import { refreshXenditInvoiceArgs, refreshXenditInvoiceHandler } from './refreshXenditInvoice';
import { updateOrderXenditInvoiceArgs, updateOrderXenditInvoiceHandler } from './updateOrderXenditInvoice';
import { createXenditInvoiceForOrderArgs, createXenditInvoiceForOrderHandler } from './createXenditInvoiceForOrder';
import { createOrderLogArgs, createOrderLogHandler } from './createOrderLog';
import { updateOrderWithNoteArgs, updateOrderWithNoteHandler } from './updateOrderWithNote';

export const createOrder = mutation({
  args: createOrderArgs,
  handler: createOrderHandler,
});

export const updateOrder = mutation({
  args: updateOrderArgs,
  handler: updateOrderHandler,
});

export const updateOrderWithNote = mutation({
  args: updateOrderWithNoteArgs,
  handler: updateOrderWithNoteHandler,
});

export const cancelOrder = mutation({
  args: cancelOrderArgs,
  handler: cancelOrderHandler,
});

export const deleteOrder = mutation({
  args: deleteOrderArgs,
  handler: deleteOrderHandler,
});

export const restoreOrder = mutation({
  args: restoreOrderArgs,
  handler: restoreOrderHandler,
});

export const refreshXenditInvoice = action({
  args: refreshXenditInvoiceArgs,
  returns: v.object({ invoiceUrl: v.string(), isExpired: v.boolean() }),
  handler: refreshXenditInvoiceHandler,
});

export const createXenditInvoiceForOrder = mutation({
  args: createXenditInvoiceForOrderArgs,
  handler: createXenditInvoiceForOrderHandler,
});

export const updateOrderXenditInvoice = internalMutation({
  args: updateOrderXenditInvoiceArgs,
  handler: updateOrderXenditInvoiceHandler,
});

export const updateOrderStats = internalMutation({
  args: updateOrderStatsArgs,
  handler: updateOrderStatsHandler,
});

export const createOrderLog = mutation({
  args: createOrderLogArgs,
  handler: createOrderLogHandler,
});
