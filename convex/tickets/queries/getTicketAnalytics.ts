import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuthentication } from "../../helpers";

export const getTicketAnalyticsArgs = {
  forUserOnly: v.optional(v.boolean()),
};

export const getTicketAnalyticsHandler = async (
  ctx: QueryCtx,
  args: { forUserOnly?: boolean }
) => {
  const user = await requireAuthentication(ctx);

  // Scope
  const creatorTickets = await ctx.db
    .query("tickets")
    .withIndex("by_creator", (q) => q.eq("createdById", user._id))
    .collect();
  const assigneeTickets = await ctx.db
    .query("tickets")
    .withIndex("by_assignee", (q) => q.eq("assignedToId", user._id))
    .collect();
  const privileged = user.isAdmin || user.isStaff;
  const rows = privileged && !args.forUserOnly
    ? await ctx.db.query("tickets").collect()
    : [...creatorTickets, ...assigneeTickets];

  const total = rows.length;
  const byStatus: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 };
  const byPriority: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  const escalated = rows.filter((t) => t.escalated).length;
  const overdue = rows.filter((t) => t.dueDate !== undefined && t.dueDate < Date.now() && t.status !== "RESOLVED" && t.status !== "CLOSED").length;

  for (const t of rows) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
  }

  const avgResponseTime = average(rows.map((t) => t.responseTime).filter((x): x is number => typeof x === "number"));
  const avgResolutionTime = average(rows.map((t) => t.resolutionTime).filter((x): x is number => typeof x === "number"));

  return {
    total,
    byStatus,
    byPriority,
    escalated,
    overdue,
    avgResponseTime,
    avgResolutionTime,
  };
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}


