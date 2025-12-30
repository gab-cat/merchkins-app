import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Doc, Id } from '../../_generated/dataModel';
import { requireAuthentication, validateOrderExists, requireOrganizationPermission, sanitizeString } from '../../helpers';

export type OrderLogType = Doc<'orderLogs'>['logType'];

export const createOrderLogArgs = {
  orderId: v.id('orders'),
  logType: v.union(
    v.literal('ORDER_CREATED'),
    v.literal('STATUS_CHANGE'),
    v.literal('PAYMENT_UPDATE'),
    v.literal('ITEM_MODIFICATION'),
    v.literal('NOTE_ADDED'),
    v.literal('SYSTEM_UPDATE'),
    v.literal('ORDER_CANCELLED')
  ),
  reason: v.string(),
  message: v.optional(v.string()),
  userMessage: v.optional(v.string()),
  previousValue: v.optional(v.string()),
  newValue: v.optional(v.string()),
  isPublic: v.optional(v.boolean()),
};

export const createOrderLogHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    logType: OrderLogType;
    reason: string;
    message?: string;
    userMessage?: string;
    previousValue?: string;
    newValue?: string;
    isPublic?: boolean;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const order = await validateOrderExists(ctx, args.orderId);

  // Permission check for organization-scoped orders
  if (order.organizationId) {
    await requireOrganizationPermission(ctx, order.organizationId, 'MANAGE_ORDERS', 'create');
  } else if (!currentUser.isAdmin && !currentUser.isStaff && currentUser._id !== order.customerId) {
    throw new Error('Permission denied');
  }

  const now = Date.now();
  const customerName =
    `${order.customerInfo?.firstName ?? ''} ${order.customerInfo?.lastName ?? ''}`.trim() || order.customerInfo?.email || 'Unknown';

  const logId = await ctx.db.insert('orderLogs', {
    orderId: args.orderId,
    createdById: currentUser._id,
    isSystemLog: false,
    creatorInfo: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      imageUrl: currentUser.imageUrl,
    },
    orderInfo: {
      orderNumber: order.orderNumber,
      customerName,
      status: order.status,
      totalAmount: order.totalAmount,
    },
    logType: args.logType,
    reason: sanitizeString(args.reason),
    message: args.message ? sanitizeString(args.message) : undefined,
    userMessage: args.userMessage ? sanitizeString(args.userMessage) : undefined,
    previousValue: args.previousValue,
    newValue: args.newValue,
    isPublic: args.isPublic ?? true,
    createdAt: now,
    updatedAt: now,
  });

  return logId;
};

/**
 * Internal helper to create system-generated order logs.
 * This is called directly by order mutations, not exposed as an API.
 */
export async function createSystemOrderLog(
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    logType: OrderLogType;
    reason: string;
    message?: string;
    userMessage?: string;
    previousValue?: string;
    newValue?: string;
    isPublic?: boolean;
    actorId?: Id<'users'>;
  }
): Promise<Id<'orderLogs'>> {
  const order = await ctx.db.get(args.orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const now = Date.now();
  const customerName =
    `${order.customerInfo?.firstName ?? ''} ${order.customerInfo?.lastName ?? ''}`.trim() || order.customerInfo?.email || 'Unknown';

  // If an actor is provided, get their info
  let creatorInfo = undefined;
  if (args.actorId) {
    const actor = await ctx.db.get(args.actorId);
    if (actor) {
      creatorInfo = {
        firstName: actor.firstName,
        lastName: actor.lastName,
        email: actor.email,
        imageUrl: actor.imageUrl,
      };
    }
  }

  const logId = await ctx.db.insert('orderLogs', {
    orderId: args.orderId,
    createdById: args.actorId,
    isSystemLog: true,
    creatorInfo,
    orderInfo: {
      orderNumber: order.orderNumber,
      customerName,
      status: order.status,
      totalAmount: order.totalAmount,
    },
    logType: args.logType,
    reason: args.reason,
    message: args.message,
    userMessage: args.userMessage,
    previousValue: args.previousValue,
    newValue: args.newValue,
    isPublic: args.isPublic ?? true,
    createdAt: now,
    updatedAt: now,
  });

  return logId;
}
