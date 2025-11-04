import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission } from '../../helpers';

export const searchMessagesArgs = {
  searchTerm: v.string(),
  organizationId: v.optional(v.id('organizations')),
  limit: v.optional(v.number()),
};

export const searchMessagesHandler = async (ctx: QueryCtx, args: { searchTerm: string; organizationId?: Id<'organizations'>; limit?: number }) => {
  const user = await requireAuthentication(ctx);
  const term = args.searchTerm.toLowerCase().trim();
  if (!term) return [];

  let query;
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_TICKETS', 'read');
    query = ctx.db.query('messages').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else {
    query = ctx.db.query('messages').withIndex('by_sender', (q) => q.eq('sentBy', user._id));
  }

  const rows = await query.collect();

  const filtered = rows.filter((m) => {
    const inSubject = m.subject.toLowerCase().includes(term);
    const inBody = m.message.toLowerCase().includes(term);
    const inTags = (m.tags || []).some((t) => t.toLowerCase().includes(term));
    const inEmail = (m.email || '').toLowerCase().includes(term);
    return inSubject || inBody || inTags || inEmail;
  });

  filtered.sort((a, b) => b.createdAt - a.createdAt);
  const limit = args.limit || 25;
  return filtered.slice(0, limit);
};
