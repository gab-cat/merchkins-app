import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, PERMISSION_CODES } from '../../helpers';

export const getRefundRequestByIdArgs = {
  refundRequestId: v.id('refundRequests'),
} as const;

export const getRefundRequestByIdHandler = async (ctx: QueryCtx, args: { refundRequestId: Id<'refundRequests'> }) => {
  const currentUser = await requireAuthentication(ctx);

  const refundRequest = await ctx.db.get(args.refundRequestId);
  if (!refundRequest || refundRequest.isDeleted) {
    return null;
  }

  // Check permissions
  if (refundRequest.organizationId) {
    await requireOrganizationPermission(ctx, refundRequest.organizationId, PERMISSION_CODES.MANAGE_REFUNDS, 'read');
  } else if (!currentUser.isAdmin && currentUser._id !== refundRequest.requestedById) {
    throw new Error('Permission denied');
  }

  // Customer can only see their own requests
  if (currentUser._id !== refundRequest.requestedById && !currentUser.isAdmin && !currentUser.isStaff) {
    // Check if user is org admin
    if (refundRequest.organizationId) {
      const member = await ctx.db
        .query('organizationMembers')
        .withIndex('by_user_organization', (q) => q.eq('userId', currentUser._id).eq('organizationId', refundRequest.organizationId))
        .filter((q) => q.eq(q.field('role'), 'ADMIN'))
        .first();
      if (!member) {
        throw new Error('Permission denied');
      }
    } else {
      throw new Error('Permission denied');
    }
  }

  // Get voucher info if exists
  let voucher = null;
  if (refundRequest.voucherId) {
    voucher = await ctx.db.get(refundRequest.voucherId);
  }

  return {
    ...refundRequest,
    voucher,
  };
};

// Internal version that doesn't require authentication (for use in actions/mutations)
export const getRefundRequestByIdInternalHandler = async (ctx: QueryCtx, args: { refundRequestId: Id<'refundRequests'> }) => {
  const refundRequest = await ctx.db.get(args.refundRequestId);
  if (!refundRequest || refundRequest.isDeleted) {
    return null;
  }

  // Get voucher info if exists
  let voucher = null;
  if (refundRequest.voucherId) {
    voucher = await ctx.db.get(refundRequest.voucherId);
  }

  return {
    ...refundRequest,
    voucher,
  };
};
