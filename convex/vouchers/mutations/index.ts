import { mutation } from '../../_generated/server';
import { createVoucherArgs, createVoucherHandler } from './createVoucher';
import { updateVoucherArgs, updateVoucherHandler } from './updateVoucher';
import { deleteVoucherArgs, deleteVoucherHandler } from './deleteVoucher';
import { toggleVoucherStatusArgs, toggleVoucherStatusHandler } from './toggleVoucherStatus';
import { validateVoucherArgs, validateVoucherHandler } from './validateVoucher';

export const createVoucher = mutation({
  args: createVoucherArgs,
  handler: createVoucherHandler,
});

export const updateVoucher = mutation({
  args: updateVoucherArgs,
  handler: updateVoucherHandler,
});

export const deleteVoucher = mutation({
  args: deleteVoucherArgs,
  handler: deleteVoucherHandler,
});

export const toggleVoucherStatus = mutation({
  args: toggleVoucherStatusArgs,
  handler: toggleVoucherStatusHandler,
});

export const validateVoucher = mutation({
  args: validateVoucherArgs,
  handler: validateVoucherHandler,
});
