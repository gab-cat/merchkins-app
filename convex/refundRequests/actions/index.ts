import { internalAction } from '../../_generated/server';
import { sendRefundRequestEmailHandler, sendRefundRequestEmailArgs } from './sendRefundRequestEmail';

export const sendRefundRequestEmail = internalAction({
  args: sendRefundRequestEmailArgs,
  handler: sendRefundRequestEmailHandler,
});
