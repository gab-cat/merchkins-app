import { mutation, internalMutation } from "../../_generated/server";

import { createOrderArgs, createOrderHandler } from "./createOrder";
import { updateOrderArgs, updateOrderHandler } from "./updateOrder";
import { cancelOrderArgs, cancelOrderHandler } from "./cancelOrder";
import { deleteOrderArgs, deleteOrderHandler } from "./deleteOrder";
import { restoreOrderArgs, restoreOrderHandler } from "./restoreOrder";
import { updateOrderStatsArgs, updateOrderStatsHandler } from "./updateOrderStats";

export const createOrder = mutation({
  args: createOrderArgs,
  handler: createOrderHandler,
});

export const updateOrder = mutation({
  args: updateOrderArgs,
  handler: updateOrderHandler,
});

export const cancelOrder = mutation({
  args: cancelOrderArgs,
  handler: cancelOrderHandler,
});

export const deleteOrder = mutation({
  args: deleteOrderArgs,
  handler: deleteOrderHandler,
});

export const restoreOrder = mutation({
  args: restoreOrderArgs,
  handler: restoreOrderHandler,
});

export const updateOrderStats = internalMutation({
  args: updateOrderStatsArgs,
  handler: updateOrderStatsHandler,
});


