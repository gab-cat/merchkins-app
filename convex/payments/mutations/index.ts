import { mutation, internalMutation } from "../../_generated/server";

import { createPaymentArgs, createPaymentHandler } from "./createPayment";
import { updatePaymentArgs, updatePaymentHandler } from "./updatePayment";
import { deletePaymentArgs, deletePaymentHandler } from "./deletePayment";
import { refundPaymentArgs, refundPaymentHandler } from "./refundPayment";
import { updatePaymentStatsArgs, updatePaymentStatsHandler } from "./updatePaymentStats";
import { restorePaymentArgs, restorePaymentHandler } from "./restorePayment";

export const createPayment = mutation({
  args: createPaymentArgs,
  handler: createPaymentHandler,
});

export const updatePayment = mutation({
  args: updatePaymentArgs,
  handler: updatePaymentHandler,
});

export const deletePayment = mutation({
  args: deletePaymentArgs,
  handler: deletePaymentHandler,
});

export const refundPayment = mutation({
  args: refundPaymentArgs,
  handler: refundPaymentHandler,
});

export const restorePayment = mutation({
  args: restorePaymentArgs,
  handler: restorePaymentHandler,
});

export const updatePaymentStats = internalMutation({
  args: updatePaymentStatsArgs,
  handler: updatePaymentStatsHandler,
});


