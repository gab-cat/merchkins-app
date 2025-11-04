import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireAuthentication } from '../../helpers';

export const searchTicketsArgs = {
  searchTerm: v.string(),
  limit: v.optional(v.number()),
};

export const searchTicketsHandler = async (ctx: QueryCtx, args: { searchTerm: string; limit?: number }) => {
  const user = await requireAuthentication(ctx);
  const term = args.searchTerm.toLowerCase().trim();
  if (!term) return [];

  // For now, search within tickets visible to the user (created or assigned)
  const [byCreator, byAssignee] = await Promise.all([
    ctx.db
      .query('tickets')
      .withIndex('by_creator', (q) => q.eq('createdById', user._id))
      .collect(),
    ctx.db
      .query('tickets')
      .withIndex('by_assignee', (q) => q.eq('assignedToId', user._id))
      .collect(),
  ]);
  const rows = [...byCreator, ...byAssignee];

  const filtered = rows.filter((t) => {
    const title = (t.title || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const tags = (t.tags || []).map((x) => x.toLowerCase());
    return title.includes(term) || desc.includes(term) || tags.some((x) => x.includes(term));
  });

  filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  const limit = args.limit || 25;
  return filtered.slice(0, limit);
};
