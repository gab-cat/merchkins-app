import { QueryCtx } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

export const getVoucherRefundRequestByIdHandler = async (
  ctx: QueryCtx,
  args: {
    voucherRefundRequestId: Id<'voucherRefundRequests'>;
  }
) => {
  const request = await ctx.db.get(args.voucherRefundRequestId);

  if (!request || request.isDeleted) {
    return null;
  }

  // Get voucher details
  const voucher = await ctx.db.get(request.voucherId);

  return {
    ...request,
    voucher,
  };
};

