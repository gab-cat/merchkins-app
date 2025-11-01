import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

export const updateOrderXenditInvoiceArgs = {
  orderId: v.id("orders"),
  xenditInvoiceId: v.string(),
  xenditInvoiceUrl: v.string(),
  xenditInvoiceExpiryDate: v.number(),
};

export const updateOrderXenditInvoiceHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<"orders">;
    xenditInvoiceId: string;
    xenditInvoiceUrl: string;
    xenditInvoiceExpiryDate: number;
  },
) => {
  await ctx.db.patch(args.orderId, {
    xenditInvoiceId: args.xenditInvoiceId,
    xenditInvoiceUrl: args.xenditInvoiceUrl,
    xenditInvoiceExpiryDate: args.xenditInvoiceExpiryDate,
    xenditInvoiceCreatedAt: Date.now(),
    updatedAt: Date.now(),
  });
};
