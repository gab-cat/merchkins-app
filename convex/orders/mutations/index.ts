import { mutation, internalMutation, action } from '../../_generated/server';
import { v } from 'convex/values';

import { createOrderArgs, createOrderHandler } from './createOrder';
import { updateOrderArgs, updateOrderHandler } from './updateOrder';
import { cancelOrderArgs, cancelOrderHandler, cancelOrderInternalArgs, cancelOrderInternalHandler } from './cancelOrder';
import { deleteOrderArgs, deleteOrderHandler } from './deleteOrder';
import { restoreOrderArgs, restoreOrderHandler } from './restoreOrder';
import { updateOrderStatsArgs, updateOrderStatsHandler } from './updateOrderStats';
import { refreshXenditInvoiceArgs, refreshXenditInvoiceHandler } from './refreshXenditInvoice';
import { updateOrderXenditInvoiceArgs, updateOrderXenditInvoiceHandler } from './updateOrderXenditInvoice';
import { createXenditInvoiceForOrderArgs, createXenditInvoiceForOrderHandler } from './createXenditInvoiceForOrder';
import { createOrderLogArgs, createOrderLogHandler } from './createOrderLog';
import { updateOrderWithNoteArgs, updateOrderWithNoteHandler } from './updateOrderWithNote';
import { updateOrdersInvoiceForSessionArgs, updateOrdersInvoiceForSessionHandler } from './updateOrdersInvoiceForSession';
import { confirmOrderReceivedArgs, confirmOrderReceivedHandler } from './confirmOrderReceived';
import { createPaymongoCheckoutForOrderArgs, createPaymongoCheckoutForOrderHandler } from './createPaymongoCheckoutForOrder';
import { updateOrderPaymongoCheckoutArgs, updateOrderPaymongoCheckoutHandler } from './updateOrderPaymongoCheckout';
import { refreshPaymongoCheckoutArgs, refreshPaymongoCheckoutReturns, refreshPaymongoCheckoutHandler } from './refreshPaymongoCheckout';

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

export const cancelOrderInternal = internalMutation({
  args: cancelOrderInternalArgs,
  handler: cancelOrderInternalHandler,
});

export const deleteOrder = mutation({
  args: deleteOrderArgs,
  handler: deleteOrderHandler,
});

export const restoreOrder = mutation({
  args: restoreOrderArgs,
  handler: restoreOrderHandler,
});

export const confirmOrderReceived = mutation({
  args: confirmOrderReceivedArgs,
  handler: confirmOrderReceivedHandler,
});

export const refreshXenditInvoice = action({
  args: refreshXenditInvoiceArgs,
  returns: v.object({ invoiceUrl: v.string(), isExpired: v.boolean() }),
  handler: refreshXenditInvoiceHandler,
});

export const refreshPaymongoCheckout = action({
  args: refreshPaymongoCheckoutArgs,
  returns: refreshPaymongoCheckoutReturns,
  handler: refreshPaymongoCheckoutHandler,
});

export const createXenditInvoiceForOrder = mutation({
  args: createXenditInvoiceForOrderArgs,
  handler: createXenditInvoiceForOrderHandler,
});

export const createPaymongoCheckoutForOrder = mutation({
  args: createPaymongoCheckoutForOrderArgs,
  handler: createPaymongoCheckoutForOrderHandler,
});

export const updateOrderXenditInvoice = internalMutation({
  args: updateOrderXenditInvoiceArgs,
  handler: updateOrderXenditInvoiceHandler,
});

export const updateOrderPaymongoCheckout = internalMutation({
  args: updateOrderPaymongoCheckoutArgs,
  handler: updateOrderPaymongoCheckoutHandler,
});

export const updateOrderStats = internalMutation({
  args: updateOrderStatsArgs,
  handler: updateOrderStatsHandler,
});

export const createOrderLog = mutation({
  args: createOrderLogArgs,
  handler: createOrderLogHandler,
});

export const createOrderLogInternal = internalMutation({
  args: createOrderLogArgs,
  handler: createOrderLogHandler,
});

export const updateOrdersInvoiceForSession = internalMutation({
  args: updateOrdersInvoiceForSessionArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await updateOrdersInvoiceForSessionHandler(ctx, args);
    return null;
  },
});
