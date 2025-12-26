import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { getVoucherRefundRequests } from './getVoucherRefundRequests';
import { getVoucherRefundRequestByIdHandler } from './getVoucherRefundRequestById';
import {
  getVoucherRefundRequestsByUserArgs,
  getVoucherRefundRequestsByUserReturns,
  getVoucherRefundRequestsByUserHandler,
} from './getVoucherRefundRequestsByUser';
import { getVoucherRefundRequestsByVoucherHandler } from './getVoucherRefundRequestsByVoucher';
import { getVoucherRefundRequestCounts } from './getVoucherRefundRequestCounts';

export { getVoucherRefundRequests };
export { getVoucherRefundRequestCounts };

export const getVoucherRefundRequestById = query({
  args: {
    voucherRefundRequestId: v.id('voucherRefundRequests'),
  },
  handler: async (ctx, args) => {
    return await getVoucherRefundRequestByIdHandler(ctx, args);
  },
});

export const getVoucherRefundRequestsByUser = query({
  args: getVoucherRefundRequestsByUserArgs,
  returns: getVoucherRefundRequestsByUserReturns,
  handler: getVoucherRefundRequestsByUserHandler,
});

export const getVoucherRefundRequestsByVoucher = query({
  args: {
    voucherId: v.id('vouchers'),
  },
  handler: async (ctx, args) => {
    return await getVoucherRefundRequestsByVoucherHandler(ctx, args);
  },
});
