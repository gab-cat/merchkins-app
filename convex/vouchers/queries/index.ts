import { query } from '../../_generated/server';
import { getVouchersArgs, getVouchersHandler } from './getVouchers';
import { getVoucherByIdArgs, getVoucherByIdHandler } from './getVoucherById';
import { getVoucherByCodeArgs, getVoucherByCodeHandler } from './getVoucherByCode';
import { getVouchersByUser } from './getVouchersByUser';

export const getVouchers = query({
  args: getVouchersArgs,
  handler: getVouchersHandler,
});

export const getVoucherById = query({
  args: getVoucherByIdArgs,
  handler: getVoucherByIdHandler,
});

export const getVoucherByCode = query({
  args: getVoucherByCodeArgs,
  handler: getVoucherByCodeHandler,
});

export { getVouchersByUser };
