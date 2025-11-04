import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

// Search users by name or email
export const searchUsersArgs = {
  searchTerm: v.string(),
  limit: v.optional(v.number()),
  roleFilter: v.optional(v.union(v.literal('staff'), v.literal('admin'), v.literal('merchant'))),
};

export const searchUsersHandler = async (
  ctx: QueryCtx,
  args: {
    searchTerm: string;
    limit?: number;
    roleFilter?: 'staff' | 'admin' | 'merchant';
  }
) => {
  const { searchTerm, limit = 20, roleFilter } = args;

  if (searchTerm.length < 2) {
    return [];
  }

  // Get all active users
  let users = await ctx.db
    .query('users')
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  // Apply role filter
  if (roleFilter) {
    users = users.filter((user) => {
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
    });
  }

  // Search by name or email (case insensitive)
  const searchLower = searchTerm.toLowerCase();
  const filteredUsers = users.filter((user) => {
    const firstName = user.firstName?.toLowerCase() || '';
    const lastName = user.lastName?.toLowerCase() || '';
    const email = user.email.toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();

    return firstName.includes(searchLower) || lastName.includes(searchLower) || fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Limit results
  return filteredUsers.slice(0, limit);
};
