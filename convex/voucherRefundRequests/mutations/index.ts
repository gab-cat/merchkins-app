import { mutation } from '../../_generated/server';
import { createVoucherRefundRequestHandler, createVoucherRefundRequestArgs } from './createVoucherRefundRequest';
import { approveVoucherRefundRequestHandler, approveVoucherRefundRequestArgs } from './approveVoucherRefundRequest';
import { rejectVoucherRefundRequestHandler, rejectVoucherRefundRequestArgs } from './rejectVoucherRefundRequest';

export const createVoucherRefundRequest = mutation({
  args: createVoucherRefundRequestArgs,
  handler: createVoucherRefundRequestHandler,
});

export const approveVoucherRefundRequest = mutation({
  args: approveVoucherRefundRequestArgs,
  handler: approveVoucherRefundRequestHandler,
});

export const rejectVoucherRefundRequest = mutation({
  args: rejectVoucherRefundRequestArgs,
  handler: rejectVoucherRefundRequestHandler,
});

