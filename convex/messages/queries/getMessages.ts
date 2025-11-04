import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission } from '../../helpers';

export const getMessagesArgs = {
  organizationId: v.optional(v.id('organizations')),
  conversationId: v.optional(v.string()),
  email: v.optional(v.string()),
  isArchived: v.optional(v.boolean()),
  isResolved: v.optional(v.boolean()),
  isRead: v.optional(v.boolean()),
  priority: v.optional(v.union(v.literal('LOW'), v.literal('NORMAL'), v.literal('HIGH'), v.literal('URGENT'))),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export const getMessagesHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    conversationId?: string;
    email?: string;
    isArchived?: boolean;
    isResolved?: boolean;
    isRead?: boolean;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    limit?: number;
    offset?: number;
    cursor?: string;
  }
) => {
  const user = await requireAuthentication(ctx);

  let query;
  if (args.conversationId) {
    // Validate access based on any message in the conversation
    const anyMsg = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId!))
      .first();
    if (!anyMsg) {
      return { messages: [], total: 0, offset: 0, limit: args.limit || 50, hasMore: false };
    }
    if (anyMsg.organizationId) {
      await requireOrganizationPermission(ctx, anyMsg.organizationId, 'MANAGE_TICKETS', 'read');
    } else if (!(user.isAdmin || anyMsg.sentBy === user._id || anyMsg.email === user.email)) {
      throw new Error('Permission denied: You can only view your own conversations');
    }
    query = ctx.db.query('messages').withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId!));
  } else if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_TICKETS', 'read');
    query = ctx.db.query('messages').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else if (args.email) {
    if (!(user.isAdmin || args.email === user.email)) {
      throw new Error('Permission denied: You can only search your own email');
    }
    query = ctx.db.query('messages').withIndex('by_email', (q) => q.eq('email', args.email!));
  } else {
    // Fallback to sender index for user's own submissions
    query = ctx.db.query('messages').withIndex('by_sender', (q) => q.eq('sentBy', user._id));
  }

  const filtered = query.filter((q) => {
    const conditions = [] as Array<any>;
    if (args.isArchived !== undefined) conditions.push(q.eq(q.field('isArchived'), args.isArchived));
    if (args.isResolved !== undefined) conditions.push(q.eq(q.field('isResolved'), args.isResolved));
    if (args.isRead !== undefined) conditions.push(q.eq(q.field('isRead'), args.isRead));
    if (args.priority !== undefined) conditions.push(q.eq(q.field('priority'), args.priority));
    return conditions.length ? q.and(...conditions) : q.and();
  });

  const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
  const cursor = args.cursor ?? null;
  // Ensure desc order prior to pagination
  const results = await filtered.order('desc').paginate({ numItems: limit, cursor });
  return results as any;
};
