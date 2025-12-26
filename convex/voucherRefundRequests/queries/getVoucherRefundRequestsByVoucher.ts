import { QueryCtx } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

export const getVoucherRefundRequestsByVoucherHandler = async (
  ctx: QueryCtx,
  args: {
    voucherId: Id<'vouchers'>;
  }
) => {
  const requests = await ctx.db
    .query('voucherRefundRequests')
    .withIndex('by_voucher', (q) => q.eq('voucherId', args.voucherId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .order('desc')
    .collect();

  return requests;
};

