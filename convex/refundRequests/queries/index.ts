import { query, internalQuery } from '../../_generated/server';
import { getRefundRequestsHandler, getRefundRequestsArgs } from './getRefundRequests';
import { getRefundRequestByIdHandler, getRefundRequestByIdInternalHandler, getRefundRequestByIdArgs } from './getRefundRequestById';
import { getRefundRequestsByUserHandler, getRefundRequestsByUserArgs } from './getRefundRequestsByUser';
import { getRefundRequestByOrderHandler, getRefundRequestByOrderArgs } from './getRefundRequestByOrder';

export const getRefundRequests = query({
  args: getRefundRequestsArgs,
  handler: getRefundRequestsHandler,
});

export const getRefundRequestById = query({
  args: getRefundRequestByIdArgs,
  handler: getRefundRequestByIdHandler,
});

export const getRefundRequestByIdInternal = internalQuery({
  args: getRefundRequestByIdArgs,
  handler: getRefundRequestByIdInternalHandler,
});

export const getRefundRequestsByUser = query({
  args: getRefundRequestsByUserArgs,
  handler: getRefundRequestsByUserHandler,
});

export const getRefundRequestByOrder = query({
  args: getRefundRequestByOrderArgs,
  handler: getRefundRequestByOrderHandler,
});
