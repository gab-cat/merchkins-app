import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationAdminOrStaff, isOrganizationMember } from '../../helpers';

export const getTicketsArgs = {
  createdById: v.optional(v.id('users')),
  assignedToId: v.optional(v.id('users')),
  organizationId: v.optional(v.id('organizations')),
  status: v.optional(v.union(v.literal('OPEN'), v.literal('IN_PROGRESS'), v.literal('RESOLVED'), v.literal('CLOSED'))),
  priority: v.optional(v.union(v.literal('LOW'), v.literal('MEDIUM'), v.literal('HIGH'))),
  category: v.optional(v.union(v.literal('BUG'), v.literal('FEATURE_REQUEST'), v.literal('SUPPORT'), v.literal('QUESTION'), v.literal('OTHER'))),
  escalated: v.optional(v.boolean()),
  dueBefore: v.optional(v.number()),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  search: v.optional(v.string()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getTicketsHandler = async (
  ctx: QueryCtx,
  args: {
    createdById?: Id<'users'>;
    assignedToId?: Id<'users'>;
    organizationId?: Id<'organizations'>;
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    category?: 'BUG' | 'FEATURE_REQUEST' | 'SUPPORT' | 'QUESTION' | 'OTHER';
    escalated?: boolean;
    dueBefore?: number;
    dateFrom?: number;
    dateTo?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }
) => {
  const user = await requireAuthentication(ctx);

  let query;
  if (args.organizationId) {
    // Org filtering
    // If caller is org-admin or staff, they can see tickets for their org
    // Otherwise, only tickets created by the user for that org
    const isMember = await isOrganizationMember(ctx, user._id, args.organizationId);
    if (!isMember && !(user.isAdmin || user.isStaff)) {
      throw new Error('Permission denied: not a member of this organization');
    }
    if (user.isAdmin) {
      query = ctx.db.query('tickets').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
    } else {
      // Check if admin or staff
      try {
        await requireOrganizationAdminOrStaff(ctx, args.organizationId);
        query = ctx.db.query('tickets').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
      } catch {
        // Not admin/staff: only their own tickets filed with the org
        query = ctx.db
          .query('tickets')
          .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
          .filter((q) => q.eq(q.field('createdById'), user._id));
      }
    }
  } else if (args.createdById) {
    if (!(user.isAdmin || user.isStaff || user._id === args.createdById)) {
      throw new Error("Permission denied: cannot view others' tickets");
    }
    query = ctx.db.query('tickets').withIndex('by_creator', (q) => q.eq('createdById', args.createdById!));
  } else if (args.assignedToId) {
    if (!(user.isAdmin || user.isStaff || user._id === args.assignedToId)) {
      throw new Error("Permission denied: cannot view others' assigned tickets");
    }
    query = ctx.db.query('tickets').withIndex('by_assignee', (q) => q.eq('assignedToId', args.assignedToId!));
  } else if (args.status) {
    query = ctx.db.query('tickets').withIndex('by_status', (q) => q.eq('status', args.status!));
  } else if (args.priority) {
    query = ctx.db.query('tickets').withIndex('by_priority', (q) => q.eq('priority', args.priority!));
  } else if (args.category) {
    query = ctx.db.query('tickets').withIndex('by_category', (q) => q.eq('category', args.category!));
  } else if (args.escalated !== undefined) {
    query = ctx.db.query('tickets').withIndex('by_escalated', (q) => q.eq('escalated', args.escalated!));
  } else if (args.dueBefore !== undefined) {
    query = ctx.db.query('tickets').withIndex('by_due_date');
  } else {
    // default: user's own created and assigned
    query = ctx.db.query('tickets').withIndex('by_creator', (q) => q.eq('createdById', user._id));
  }

  const filtered = query.filter((q) => {
    let predicate = q.and();
    if (args.status) {
      predicate = q.and(predicate, q.eq(q.field('status'), args.status));
    }
    if (args.priority) {
      predicate = q.and(predicate, q.eq(q.field('priority'), args.priority));
    }
    if (args.category) {
      predicate = q.and(predicate, q.eq(q.field('category'), args.category));
    }
    if (args.escalated !== undefined) {
      predicate = q.and(predicate, q.eq(q.field('escalated'), args.escalated));
    }
    if (args.dueBefore !== undefined) {
      predicate = q.and(predicate, q.lte(q.field('dueDate'), args.dueBefore));
    }
    if (args.dateFrom !== undefined) {
      predicate = q.and(predicate, q.gte(q.field('createdAt'), args.dateFrom));
    }
    if (args.dateTo !== undefined) {
      predicate = q.and(predicate, q.lte(q.field('createdAt'), args.dateTo));
    }
    return predicate;
  });

  let results = await filtered.collect();
  results.sort((a, b) => b.updatedAt - a.updatedAt);

  // Apply search filter if provided
  if (args.search && args.search.trim().length > 0) {
    const searchTerm = args.search.toLowerCase().trim();
    results = results.filter((ticket: any) => {
      const title = ticket.title?.toLowerCase() || '';
      const description = ticket.description?.toLowerCase() || '';
      const creatorEmail = ticket.creatorInfo?.email?.toLowerCase() || '';
      const ticketId = ticket._id?.toLowerCase() || '';

      return (
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        creatorEmail.includes(searchTerm) ||
        ticketId.includes(searchTerm)
      );
    });
  }

  const total = results.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = results.slice(offset, offset + limit);

  return { tickets: page, total, offset, limit, hasMore: offset + limit < total };
};
