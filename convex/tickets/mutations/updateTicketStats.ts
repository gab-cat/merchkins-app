import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const updateTicketStatsArgs = {
  ticketId: v.id('tickets'),
  updates: v.object({
    responseTime: v.optional(v.number()),
    resolutionTime: v.optional(v.number()),
  }),
};

export const updateTicketStatsHandler = async (
  ctx: MutationCtx,
  args: { ticketId: Id<'tickets'>; updates: { responseTime?: number; resolutionTime?: number } }
) => {
  const existing = await ctx.db.get(args.ticketId);
  if (!existing) return args.ticketId;

  await ctx.db.patch(args.ticketId, { ...args.updates, updatedAt: Date.now() });
  return args.ticketId;
};
