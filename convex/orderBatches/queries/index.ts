import { query } from '../../_generated/server';
import { getBatchesHandler, getBatchesArgs } from './getBatches';
import { getBatchByIdHandler, getBatchByIdArgs } from './getBatchById';
import { getBatchOrdersHandler, getBatchOrdersArgs } from './getBatchOrders';

export const getBatches = query({
  args: getBatchesArgs,
  handler: getBatchesHandler,
});

export const getBatchById = query({
  args: getBatchByIdArgs,
  handler: getBatchByIdHandler,
});

export const getBatchOrders = query({
  args: getBatchOrdersArgs,
  handler: getBatchOrdersHandler,
});
