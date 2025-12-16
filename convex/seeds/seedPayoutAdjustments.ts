import { internalMutation } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { v } from 'convex/values';

/**
 * Seed payout adjustments for testing purposes.
 * This creates 2 PENDING payout adjustments based on orders from Gabriel Catimbang
 * that are already in a payout invoice.
 */
export const seedPayoutAdjustments = internalMutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    adjustmentsCreated: v.number(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const now = Date.now();

    // Get specific orders from Gabriel Catimbang that are in payout invoice PI-20251213-PERKINS-002
    // From the invoice orderSummary:
    // 1. kd72nyw1wy1431v044h33gc0h17x4zn4 - ORD-20251212-5T1URQ - ₱5798 (with voucher)
    // 2. kd7833qnaqwhkr2378f1wbyzc97x4zjt - ORD-20251212-KA1W9L - ₱1999

    const invoiceId = 'pn762h803n6eg71cy69jspyy8h7x649s' as Id<'payoutInvoices'>;
    const organizationId = 'kx7dfkhe3n47d329tas9ynn10n7nme5q' as Id<'organizations'>;

    // First, let's update the orders to have the payoutInvoiceId if they don't have it
    const order1Id = 'kd72nyw1wy1431v044h33gc0h17x4zn4' as Id<'orders'>;
    const order2Id = 'kd7833qnaqwhkr2378f1wbyzc97x4zjt' as Id<'orders'>;

    const order1 = await ctx.db.get(order1Id);
    const order2 = await ctx.db.get(order2Id);

    if (!order1 || !order2) {
      return {
        success: false,
        adjustmentsCreated: 0,
        message: 'Could not find orders',
      };
    }

    // Link orders to invoice if not already linked
    if (!order1.payoutInvoiceId) {
      await ctx.db.patch(order1Id, {
        payoutInvoiceId: invoiceId,
        updatedAt: now,
      });
    }

    if (!order2.payoutInvoiceId) {
      await ctx.db.patch(order2Id, {
        payoutInvoiceId: invoiceId,
        updatedAt: now,
      });
    }

    // Check if adjustments already exist for these orders
    const existingAdj1 = await ctx.db
      .query('payoutAdjustments')
      .withIndex('by_order', (q) => q.eq('orderId', order1Id))
      .first();

    const existingAdj2 = await ctx.db
      .query('payoutAdjustments')
      .withIndex('by_order', (q) => q.eq('orderId', order2Id))
      .first();

    let adjustmentsCreated = 0;

    // Create payout adjustment 1: REFUND for order 1
    if (!existingAdj1) {
      await ctx.db.insert('payoutAdjustments', {
        organizationId,
        orderId: order1Id,
        originalInvoiceId: invoiceId,
        type: 'REFUND',
        amount: -1799, // Negative amount - partial refund for one item
        reason: 'Test refund adjustment: Customer requested partial refund for defective item',
        status: 'PENDING',
        createdAt: now,
      });
      adjustmentsCreated++;
    }

    // Create payout adjustment 2: CANCELLATION for order 2
    if (!existingAdj2) {
      await ctx.db.insert('payoutAdjustments', {
        organizationId,
        orderId: order2Id,
        originalInvoiceId: invoiceId,
        type: 'CANCELLATION',
        amount: -1999, // Negative amount - full cancellation
        reason: 'Test cancellation adjustment: Order cancelled after payout invoice generated',
        status: 'PENDING',
        createdAt: now,
      });
      adjustmentsCreated++;
    }

    return {
      success: true,
      adjustmentsCreated,
      message:
        adjustmentsCreated > 0
          ? `Created ${adjustmentsCreated} payout adjustment(s) for testing. These will be deducted from the next payout invoice.`
          : 'Payout adjustments already exist for these orders.',
    };
  },
});
