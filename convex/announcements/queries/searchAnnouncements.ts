import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationMember } from '../../helpers';

// Search announcements by title using full-text search
export const searchAnnouncementsArgs = {
  organizationId: v.optional(v.id('organizations')),
  category: v.optional(v.string()),
  query: v.string(),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const searchAnnouncementsHandler = async (
  ctx: QueryCtx,
  args: { organizationId?: Id<'organizations'>; category?: string; query: string; limit?: number; offset?: number }
) => {
  const user = await requireAuthentication(ctx);
  const queryTerm = args.query.trim();
  if (!queryTerm) return { announcements: [], total: 0, offset: 0, limit: args.limit || 50, hasMore: false };

  // Verify organization membership if org-scoped
  if (args.organizationId) {
    await requireOrganizationMember(ctx, args.organizationId);
  }

  const limit = args.limit || 50;
  const MAX_OFFSET = 1000;
  const offset = Math.min(args.offset || 0, MAX_OFFSET);
  const BATCH_SIZE = 100;
  const MAX_FETCH_SIZE = 1000; // Safety limit to prevent excessive fetching

  const now = Date.now();
  const isStaffLike = user.isAdmin || user.isStaff;
  const isMerchant = !!user.isMerchant;

  // Build the search query builder (reusable for batching)
  const buildSearchQuery = () => {
    return ctx.db.query('announcements').withSearchIndex('search_announcements', (q) => {
      let search = q.search('title', queryTerm).eq('isActive', true);
      if (args.organizationId) {
        search = search.eq('organizationId', args.organizationId);
      }
      return search;
    });
  };

  // Filter function for in-memory filtering
  const filterAnnouncement = (ann: any) => {
    // Time filters
    if (ann.publishedAt > now) return false;
    if (ann.scheduledAt && ann.scheduledAt > now) return false;
    if (ann.expiresAt && ann.expiresAt <= now) return false;

    // Category filter
    if (args.category !== undefined && ann.category !== args.category) return false;

    // Audience filter
    const allowed =
      ann.targetAudience === 'ALL' ||
      (ann.targetAudience === 'ADMINS' && user.isAdmin) ||
      (ann.targetAudience === 'STAFF' && isStaffLike) ||
      (ann.targetAudience === 'MERCHANTS' && isMerchant) ||
      (ann.targetAudience === 'CUSTOMERS' && !isStaffLike);

    return allowed;
  };

  // Batching strategy: fetch in batches and accumulate filtered results
  // Note: Since search indexes don't support cursors, we fetch progressively larger batches
  // and deduplicate to handle the overlap. This structure allows for future cursor support.
  const allFetched = new Map<string, any>(); // Deduplicate by _id
  const visible: any[] = [];
  let currentBatchSize = BATCH_SIZE;
  const requiredFilteredItems = offset + limit;

  while (visible.length < requiredFilteredItems && currentBatchSize <= MAX_FETCH_SIZE) {
    // Fetch batch with current batch size
    const batch = await buildSearchQuery().take(currentBatchSize);

    if (batch.length === 0) {
      break; // No more results available
    }

    // Deduplicate: add new items to our collection
    for (const ann of batch) {
      if (!allFetched.has(ann._id)) {
        allFetched.set(ann._id, ann);
      }
    }

    // Apply filters to all accumulated items
    const filtered = Array.from(allFetched.values()).filter(filterAnnouncement);

    // Sort by publish date descending
    filtered.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));

    // Update visible array with filtered and sorted results
    visible.length = 0;
    visible.push(...filtered);

    // If we have enough filtered items or fetched fewer than requested, we're done
    if (visible.length >= requiredFilteredItems || batch.length < currentBatchSize) {
      break;
    }

    // Increase batch size for next iteration (but cap at MAX_FETCH_SIZE)
    // This handles cases where filtering removes many items
    if (currentBatchSize < MAX_FETCH_SIZE) {
      currentBatchSize = Math.min(currentBatchSize * 2, MAX_FETCH_SIZE);
    } else {
      // We've hit the max fetch size, use what we have
      break;
    }
  }

  const total = visible.length;
  const page = visible.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return { announcements: page, total, offset, limit, hasMore };
};
