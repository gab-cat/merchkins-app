import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Doc } from '../../_generated/dataModel';

// Search users by email using full-text search
//
// Search Index Verification:
// - The search_users index is defined in convex/models/users.ts (lines 109-112)
// - searchField: 'email' - enables full-text search on email addresses
// - filterFields: ['isDeleted'] - allows filtering deleted users at the index level
//
// Limitations:
// - Convex search indexes can only search one field, so this searches by email only
// - For name-based searches (firstName, lastName), use getUsers query with search filter instead
//   which uses regular query filters (less efficient but supports multiple fields)
export const searchUsersArgs = {
  searchTerm: v.string(),
  limit: v.optional(v.number()),
  roleFilter: v.optional(v.union(v.literal('staff'), v.literal('admin'), v.literal('merchant'))),
};

// Return validator: array of user documents
// Note: Using v.any() for document structure as Convex doesn't provide a built-in way
// to reference table document types in validators without defining the full structure
export const searchUsersReturns = v.array(v.any());

export const searchUsersHandler = async (
  ctx: QueryCtx,
  args: {
    searchTerm: string;
    limit?: number;
    roleFilter?: 'staff' | 'admin' | 'merchant';
  }
): Promise<Array<Doc<'users'>>> => {
  const { searchTerm, limit = 20, roleFilter } = args;

  if (searchTerm.length < 2) {
    return [];
  }

  // Helper function to check if a user matches the role filter
  const matchesRoleFilter = (user: Doc<'users'>): boolean => {
    if (!roleFilter) return true;
    switch (roleFilter) {
      case 'staff':
        return user.isStaff;
      case 'admin':
        return user.isAdmin;
      case 'merchant':
        return user.isMerchant;
      default:
        return true;
    }
  };

  // Use the search index for efficient database-level search on email
  // Fetch in batches to ensure we get enough results after role filtering
  // This approach avoids the limit * 3 heuristic which can cause issues:
  // - If most users match the role filter, we over-fetch unnecessarily
  // - If few users match the role filter, we may return fewer than limit results
  const BATCH_SIZE = 100;
  const MAX_FETCH = 500; // Safety limit to prevent excessive queries
  const matchingUsers: Doc<'users'>[] = [];
  let fetchedCount = 0;
  let hasMoreResults = true;

  // Fetch in batches until we have enough matching results or run out of data
  while (matchingUsers.length < limit && hasMoreResults && fetchedCount < MAX_FETCH) {
    const batch = await ctx.db
      .query('users')
      .withSearchIndex('search_users', (q) => q.search('email', searchTerm).eq('isDeleted', false))
      .take(BATCH_SIZE);

    if (batch.length === 0) {
      hasMoreResults = false;
      break;
    }

    fetchedCount += batch.length;

    // Apply role filter in memory and collect matching users
    for (const user of batch) {
      if (matchesRoleFilter(user)) {
        matchingUsers.push(user);
        if (matchingUsers.length >= limit) {
          break;
        }
      }
    }

    // If we got fewer results than the batch size, we've reached the end
    if (batch.length < BATCH_SIZE) {
      hasMoreResults = false;
    }
  }

  return matchingUsers.slice(0, limit);
};
