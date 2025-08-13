import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationPermission } from "../../helpers";

export const getPaymentByIdArgs = {
  paymentId: v.id("payments"),
} as const;

export const getPaymentByIdHandler = async (
  ctx: QueryCtx,
  args: { paymentId: Id<"payments"> },
) => {
  const currentUser = await requireAuthentication(ctx);
  const payment = await ctx.db.get(args.paymentId);
  if (!payment || payment.isDeleted) return null;
  if (payment.organizationId) {
    await requireOrganizationPermission(ctx, payment.organizationId, "MANAGE_PAYMENTS", "read");
  } else if (
    currentUser._id !== payment.userId &&
    !currentUser.isStaff &&
    !currentUser.isAdmin
  ) {
    throw new Error("Permission denied");
  }
  return payment;
};


