import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { internal } from '../../_generated/api';

export const createRefundNotificationArgs = {
  refundRequestId: v.id('refundRequests'),
  organizationId: v.id('organizations'),
  orderNumber: v.optional(v.string()),
  customerName: v.string(),
  isForCustomer: v.optional(v.boolean()),
} as const;

export const createRefundNotificationHandler = async (
  ctx: MutationCtx,
  args: {
    refundRequestId: Id<'refundRequests'>;
    organizationId: Id<'organizations'>;
    orderNumber?: string;
    customerName: string;
    isForCustomer?: boolean;
  }
) => {
  const refundRequest = await ctx.db.get(args.refundRequestId);
  if (!refundRequest) {
    return;
  }

  if (args.isForCustomer) {
    // Notification for customer
    const subject =
      refundRequest.status === 'APPROVED'
        ? `Refund Approved - Order ${args.orderNumber ?? 'N/A'}`
        : `Refund Request Update - Order ${args.orderNumber ?? 'N/A'}`;

    const message =
      refundRequest.status === 'APPROVED'
        ? `Your refund request for Order ${args.orderNumber ?? 'N/A'} has been approved. A refund voucher has been issued to your account.`
        : `Your refund request for Order ${args.orderNumber ?? 'N/A'} has been ${refundRequest.status.toLowerCase()}.`;

    await ctx.runMutation(internal.messages.mutations.index.createMessageInternal, {
      organizationId: args.organizationId,
      email: refundRequest.customerInfo.email,
      subject,
      message,
      messageType: 'SUPPORT',
      priority: 'NORMAL',
    });
  } else {
    // Notification for org admins - get admins via query
    // Get org admins directly from database since we can't call queries from mutations
    const orgAdmins = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization_role', (q) => q.eq('organizationId', args.organizationId).eq('role', 'ADMIN'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    for (const admin of orgAdmins) {
      if (!admin.userInfo?.email) continue;

      await ctx.runMutation(internal.messages.mutations.index.createMessageInternal, {
        organizationId: args.organizationId,
        email: admin.userInfo.email,
        subject: `New Refund Request - Order ${args.orderNumber ?? 'N/A'}`,
        message: `A new refund request has been submitted by ${args.customerName} for Order ${args.orderNumber ?? 'N/A'}. Please review and respond.`,
        messageType: 'SUPPORT',
        priority: 'HIGH',
      });
    }
  }
};
