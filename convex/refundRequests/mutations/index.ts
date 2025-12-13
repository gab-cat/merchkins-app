import { mutation, internalMutation } from '../../_generated/server';
import { createRefundRequestHandler, createRefundRequestArgs } from './createRefundRequest';
import { approveRefundRequestHandler, approveRefundRequestArgs } from './approveRefundRequest';
import { rejectRefundRequestHandler, rejectRefundRequestArgs } from './rejectRefundRequest';
import { createRefundVoucherHandler, createRefundVoucherArgs } from './createRefundVoucher';
import { createRefundNotificationHandler, createRefundNotificationArgs } from './createRefundNotification';

export const createRefundRequest = mutation({
  args: createRefundRequestArgs,
  handler: createRefundRequestHandler,
});

export const approveRefundRequest = mutation({
  args: approveRefundRequestArgs,
  handler: approveRefundRequestHandler,
});

export const rejectRefundRequest = mutation({
  args: rejectRefundRequestArgs,
  handler: rejectRefundRequestHandler,
});

export const createRefundVoucher = internalMutation({
  args: createRefundVoucherArgs,
  handler: createRefundVoucherHandler,
});

export const createRefundNotification = internalMutation({
  args: createRefundNotificationArgs,
  handler: createRefundNotificationHandler,
});
