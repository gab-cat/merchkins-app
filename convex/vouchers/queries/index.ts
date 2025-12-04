import { query } from '../../_generated/server';
import { getVouchersArgs, getVouchersHandler } from './getVouchers';
import { getVoucherByIdArgs, getVoucherByIdHandler } from './getVoucherById';
import { getVoucherByCodeArgs, getVoucherByCodeHandler } from './getVoucherByCode';
import { validateVoucherArgs, validateVoucherHandler } from './validateVoucher';

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

export const validateVoucher = query({
  args: validateVoucherArgs,
  handler: validateVoucherHandler,
});
