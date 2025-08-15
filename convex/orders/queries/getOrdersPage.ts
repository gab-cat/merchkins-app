import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

export const getOrdersPageArgs = {
  organizationId: v.optional(v.id("organizations")),
  customerId: v.optional(v.id("users")),
  processedById: v.optional(v.id("users")),
  status: v.optional(
    v.union(
      v.literal("PENDING"),
      v.literal("PROCESSING"),
      v.literal("READY"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED"),
    ),
  ),
  paymentStatus: v.optional(
    v.union(
      v.literal("PENDING"),
      v.literal("DOWNPAYMENT"),
      v.literal("PAID"),
      v.literal("REFUNDED"),
    ),
  ),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  includeDeleted: v.optional(v.boolean()),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export const getOrdersPageHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<"organizations">;
    customerId?: Id<"users">;
    processedById?: Id<"users">;
    status?: "PENDING" | "PROCESSING" | "READY" | "DELIVERED" | "CANCELLED";
    paymentStatus?: "PENDING" | "DOWNPAYMENT" | "PAID" | "REFUNDED";
    dateFrom?: number;
    dateTo?: number;
    includeDeleted?: boolean;
    limit?: number;
    cursor?: string | null;
  },
) => {
  let query: any;
  if (args.organizationId && args.status) {
    query = ctx.db
      .query("orders")
      .withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId!).eq("status", args.status!));
  } else if (args.organizationId) {
    query = ctx.db.query("orders").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
  } else if (args.customerId && args.status) {
    query = ctx.db
      .query("orders")
      .withIndex("by_customer_status", (q) => q.eq("customerId", args.customerId!).eq("status", args.status!));
  } else if (args.customerId) {
    query = ctx.db.query("orders").withIndex("by_customer", (q) => q.eq("customerId", args.customerId!));
  } else if (args.processedById) {
    query = ctx.db.query("orders").withIndex("by_processedBy", (q) => q.eq("processedById", args.processedById!));
  } else if (args.paymentStatus) {
    query = ctx.db.query("orders").withIndex("by_payment_status", (q) => q.eq("paymentStatus", args.paymentStatus!));
  } else if (args.status) {
    query = ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", args.status!));
  } else if (args.dateFrom || args.dateTo) {
    query = ctx.db.query("orders").withIndex("by_order_date");
  } else {
    query = ctx.db.query("orders");
  }

  query = query.filter((q: any) => {
    const cond: any[] = [];
    if (!args.includeDeleted) cond.push(q.eq(q.field("isDeleted"), false));
    if (args.paymentStatus) cond.push(q.eq(q.field("paymentStatus"), args.paymentStatus));
    if (args.dateFrom !== undefined) cond.push(q.gte(q.field("orderDate"), args.dateFrom));
    if (args.dateTo !== undefined) cond.push(q.lte(q.field("orderDate"), args.dateTo));
    return cond.length ? q.and(...cond) : q.and();
  });

  const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
  const cursor = args.cursor ?? null;
  const page = await query.order("desc").paginate({ numItems: limit, cursor });
  return page as any;
};


