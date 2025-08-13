import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationPermission } from "../../helpers";

export const getPaymentAnalyticsArgs = {
  organizationId: v.optional(v.id("organizations")),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
} as const;

export const getPaymentAnalyticsHandler = async (
  ctx: QueryCtx,
  args: { organizationId?: Id<"organizations">; dateFrom?: number; dateTo?: number },
) => {
  const currentUser = await requireAuthentication(ctx);
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, "MANAGE_PAYMENTS", "read");
  } else if (!currentUser.isAdmin && !currentUser.isStaff) {
    throw new Error("Permission denied");
  }
  let query = args.organizationId
    ? ctx.db
        .query("payments")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!))
    : ctx.db.query("payments").withIndex("by_isDeleted", (q) => q.eq("isDeleted", false));

  const filtered = query.filter((q) => {
    const cond: any[] = [q.eq(q.field("isDeleted"), false)];
    if (args.dateFrom !== undefined) cond.push(q.gte(q.field("paymentDate"), args.dateFrom));
    if (args.dateTo !== undefined) cond.push(q.lte(q.field("paymentDate"), args.dateTo));
    return q.and(...cond);
  });

  const rows = await filtered.collect();

  let totalAmount = 0;
  let count = 0;
  let byMethod: Record<string, { amount: number; count: number }> = {};
  let byStatus: Record<string, { amount: number; count: number }> = {};

  for (const p of rows) {
    totalAmount += p.amount;
    count += 1;
    byMethod[p.paymentMethod] = byMethod[p.paymentMethod] || { amount: 0, count: 0 };
    byMethod[p.paymentMethod].amount += p.amount;
    byMethod[p.paymentMethod].count += 1;
    byStatus[p.paymentStatus] = byStatus[p.paymentStatus] || { amount: 0, count: 0 };
    byStatus[p.paymentStatus].amount += p.amount;
    byStatus[p.paymentStatus].count += 1;
  }

  return {
    totalAmount,
    count,
    byMethod,
    byStatus,
  };
};


