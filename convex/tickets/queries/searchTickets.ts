import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireAuthentication } from '../../helpers';

// Search tickets by title using full-text search
export const searchTicketsArgs = {
  searchTerm: v.string(),
  limit: v.optional(v.number()),
};

export const searchTicketsHandler = async (ctx: QueryCtx, args: { searchTerm: string; limit?: number }) => {
  const user = await requireAuthentication(ctx);
  const term = args.searchTerm.trim();
  if (!term) return [];

  const limit = args.limit || 25;

  // Use the search index for efficient database-level search
  // Fetch tickets matching title search, then filter by access
  const tickets = await ctx.db
    .query('tickets')
    .withSearchIndex('search_tickets', (q) => q.search('title', term))
    .take(limit * 4); // Fetch more to account for access filtering

  // Filter to tickets the user has access to (created by or assigned to)
  const accessibleTickets = tickets.filter((t) => t.createdById === user._id || t.assignedToId === user._id);

  // Sort by most recently updated
  accessibleTickets.sort((a, b) => b.updatedAt - a.updatedAt);

  return accessibleTickets.slice(0, limit);
};
