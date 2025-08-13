import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, requireOrganizationPermission, isDateInRange } from "../../helpers";

export const getMessageAnalyticsArgs = {
  organizationId: v.optional(v.id("organizations")),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
};

export const getMessageAnalyticsHandler = async (
  ctx: QueryCtx,
  args: { organizationId?: Id<"organizations">; startDate?: number; endDate?: number }
) => {
  const user = await requireAuthentication(ctx);

  let query;
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, "MANAGE_TICKETS", "read");
    query = ctx.db
      .query("messages")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId!));
  } else {
    query = ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("sentBy", user._id));
  }

  const rows = await query.collect();

  // In-memory filter by date range
  const filtered = rows.filter((m) => isDateInRange(m.createdAt, args.startDate, args.endDate));

  const total = filtered.length;
  const unread = filtered.filter((m) => !m.isRead).length;
  const unresolved = filtered.filter((m) => !m.isResolved).length;
  const byPriority: Record<string, number> = { LOW: 0, NORMAL: 0, HIGH: 0, URGENT: 0 };
  const byType: Record<string, number> = { INQUIRY: 0, COMPLAINT: 0, SUPPORT: 0, FEEDBACK: 0, REPLY: 0 };

  for (const m of filtered) {
    byPriority[m.priority] = (byPriority[m.priority] || 0) + 1;
    byType[m.messageType] = (byType[m.messageType] || 0) + 1;
  }

  // Average first-response time for customer-sent messages that got an admin reply
  const responseTimes: number[] = [];
  const byConversation = new Map<string, typeof filtered>();
  for (const m of filtered) {
    if (!m.conversationId) continue;
    const key = m.conversationId;
    if (!byConversation.has(key)) byConversation.set(key, [] as any);
    (byConversation.get(key) as any).push(m);
  }
  for (const list of byConversation.values()) {
    list.sort((a, b) => a.createdAt - b.createdAt);
    const first = list[0];
    if (first && first.isSentByCustomer) {
      const firstAdminReply = list.find((m) => m.isSentByAdmin && m.createdAt > first.createdAt);
      if (firstAdminReply) {
        responseTimes.push(firstAdminReply.createdAt - first.createdAt);
      }
    }
  }
  const avgFirstResponseMs = responseTimes.length
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null;

  return {
    total,
    unread,
    unresolved,
    byPriority,
    byType,
    avgFirstResponseMs,
  };
};


