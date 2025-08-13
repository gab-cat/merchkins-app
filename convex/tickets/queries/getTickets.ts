import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication } from "../../helpers";

export const getTicketsArgs = {
  createdById: v.optional(v.id("users")),
  assignedToId: v.optional(v.id("users")),
  status: v.optional(v.union(v.literal("OPEN"), v.literal("IN_PROGRESS"), v.literal("RESOLVED"), v.literal("CLOSED"))),
  priority: v.optional(v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH"))),
  category: v.optional(v.union(
    v.literal("BUG"),
    v.literal("FEATURE_REQUEST"),
    v.literal("SUPPORT"),
    v.literal("QUESTION"),
    v.literal("OTHER")
  )),
  escalated: v.optional(v.boolean()),
  dueBefore: v.optional(v.number()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getTicketsHandler = async (
  ctx: QueryCtx,
  args: {
    createdById?: Id<"users">;
    assignedToId?: Id<"users">;
    status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    category?: "BUG" | "FEATURE_REQUEST" | "SUPPORT" | "QUESTION" | "OTHER";
    escalated?: boolean;
    dueBefore?: number;
    limit?: number;
    offset?: number;
  }
) => {
  const user = await requireAuthentication(ctx);

  let query;
  if (args.createdById) {
    if (!(user.isAdmin || user.isStaff || user._id === args.createdById)) {
      throw new Error("Permission denied: cannot view others' tickets");
    }
    query = ctx.db.query("tickets").withIndex("by_creator", (q) => q.eq("createdById", args.createdById!));
  } else if (args.assignedToId) {
    if (!(user.isAdmin || user.isStaff || user._id === args.assignedToId)) {
      throw new Error("Permission denied: cannot view others' assigned tickets");
    }
    query = ctx.db.query("tickets").withIndex("by_assignee", (q) => q.eq("assignedToId", args.assignedToId!));
  } else if (args.status) {
    query = ctx.db.query("tickets").withIndex("by_status", (q) => q.eq("status", args.status!));
  } else if (args.priority) {
    query = ctx.db.query("tickets").withIndex("by_priority", (q) => q.eq("priority", args.priority!));
  } else if (args.category) {
    query = ctx.db.query("tickets").withIndex("by_category", (q) => q.eq("category", args.category!));
  } else if (args.escalated !== undefined) {
    query = ctx.db.query("tickets").withIndex("by_escalated", (q) => q.eq("escalated", args.escalated!));
  } else if (args.dueBefore !== undefined) {
    query = ctx.db.query("tickets").withIndex("by_due_date");
  } else {
    // default: user's own created and assigned
    query = ctx.db
      .query("tickets")
      .withIndex("by_creator", (q) => q.eq("createdById", user._id));
  }

  const filtered = query.filter((q) => {
    const cond: any[] = [];
    if (args.status) cond.push(q.eq(q.field("status"), args.status));
    if (args.priority) cond.push(q.eq(q.field("priority"), args.priority));
    if (args.category) cond.push(q.eq(q.field("category"), args.category));
    if (args.escalated !== undefined) cond.push(q.eq(q.field("escalated"), args.escalated));
    if (args.dueBefore !== undefined) cond.push(q.lte(q.field("dueDate"), args.dueBefore));
    return cond.length ? q.and(...cond) : q.and();
  });

  const results = await filtered.collect();
  results.sort((a, b) => b.updatedAt - a.updatedAt);
  const total = results.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = results.slice(offset, offset + limit);

  return { tickets: page, total, offset, limit, hasMore: offset + limit < total };
};



