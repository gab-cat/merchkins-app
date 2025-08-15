import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

export const getOrdersArgs = {
  organizationId: v.optional(v.id("organizations")),
  customerId: v.optional(v.id("users")),
  processedById: v.optional(v.id("users")),
  status: v.optional(
    v.union(
      v.literal("PENDING"),
      v.literal("PROCESSING"),
      v.literal("READY"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    )
  ),
  paymentStatus: v.optional(
    v.union(
      v.literal("PENDING"),
      v.literal("DOWNPAYMENT"),
      v.literal("PAID"),
      v.literal("REFUNDED")
    )
  ),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  includeDeleted: v.optional(v.boolean()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getOrdersHandler = async (
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
    offset?: number;
  }
) => {
  let query;

  if (args.organizationId && args.status) {
    query = ctx.db
      .query("orders")
      .withIndex("by_organization_status", (q) =>
        q.eq("organizationId", args.organizationId!).eq("status", args.status!)
      );
  } else if (args.organizationId) {
    query = ctx.db
      .query("orders")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
  } else if (args.customerId && args.status) {
    query = ctx.db
      .query("orders")
      .withIndex("by_customer_status", (q) => q.eq("customerId", args.customerId!).eq("status", args.status!));
  } else if (args.customerId) {
    query = ctx.db.query("orders").withIndex("by_customer", (q) => q.eq("customerId", args.customerId!));
  } else if (args.processedById) {
    query = ctx.db
      .query("orders")
      .withIndex("by_processedBy", (q) => q.eq("processedById", args.processedById!));
  } else if (args.paymentStatus) {
    query = ctx.db
      .query("orders")
      .withIndex("by_payment_status", (q) => q.eq("paymentStatus", args.paymentStatus!));
  } else if (args.status) {
    query = ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", args.status!));
  } else if (args.dateFrom || args.dateTo) {
    query = ctx.db.query("orders").withIndex("by_order_date");
  } else {
    query = ctx.db.query("orders").withIndex("by_isDeleted", (q) => q.eq("isDeleted", false));
  }

  const filtered = query.filter((q) => {
    const cond: any[] = [];
    if (!args.includeDeleted) {
      cond.push(q.eq(q.field("isDeleted"), false));
    }
    if (args.paymentStatus) {
      cond.push(q.eq(q.field("paymentStatus"), args.paymentStatus));
    }
    if (args.dateFrom !== undefined) {
      cond.push(q.gte(q.field("orderDate"), args.dateFrom));
    }
    if (args.dateTo !== undefined) {
      cond.push(q.lte(q.field("orderDate"), args.dateTo));
    }
    return cond.length > 0 ? q.and(...cond) : q.and();
  });

  const results = await filtered.collect();

  // Sort by orderDate descending to ensure stable, recent-first pagination
  results.sort((a: any, b: any) => {
    const ad = typeof a.orderDate === "number" ? a.orderDate : 0;
    const bd = typeof b.orderDate === "number" ? b.orderDate : 0;
    if (ad === bd) {
      // Fallback to _creationTime descending if orderDate ties
      const ac = typeof a._creationTime === "number" ? a._creationTime : 0;
      const bc = typeof b._creationTime === "number" ? b._creationTime : 0;
      return bc - ac;
    }
    return bd - ad;
  });

  const total = results.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = results.slice(offset, offset + limit);

  return {
    orders: page,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  };
};


