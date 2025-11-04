# Convex Function Organization Pattern

This documentation explains the modular organization pattern implemented for Convex functions in this project.

## Pattern Overview

Instead of defining query/mutation functions inline within each file, we separate:

1. **Function arguments and handler logic** (in individual files)
2. **Function definitions** (in index files)

## Benefits

- **Separation of Concerns**: Logic is separated from function definitions
- **Better Testing**: Handlers can be tested independently of Convex function wrappers
- **Type Safety**: Proper TypeScript types with reusable argument definitions
- **Cleaner Organization**: Easy to see all available functions in index files
- **Reusability**: Handlers can be shared or composed

## File Structure

```
convex/
  users/
    index.ts                 # Domain-level exports
    queries/
      index.ts              # Query function definitions
      getCurrentUser.ts     # Args + handler implementation
      getUserById.ts        # Args + handler implementation
      ...
    mutations/
      index.ts              # Mutation function definitions
      updateProfile.ts      # Args + handler implementation
      ...
  organizations/
    index.ts                # Domain-level exports
    queries/
      index.ts              # Query function definitions
      ...
    mutations/
      index.ts              # Mutation function definitions
      ...
  permissions/
    index.ts                # Domain-level exports
    queries/
      index.ts              # Query function definitions
      ...
    mutations/
      index.ts              # Mutation function definitions
      ...
```

## Implementation Examples

### 1. Implementation File Pattern

```typescript
// convex/users/queries/getCurrentUser.ts
import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getCurrentUserArgs = {
  clerkId: v.string(),
};

export const getCurrentUserHandler = async (ctx: QueryCtx, args: { clerkId: string }) => {
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  return user;
};
```

### 2. Index File Pattern

```typescript
// convex/users/queries/index.ts
import { query } from '../../_generated/server';
import { getCurrentUserArgs, getCurrentUserHandler } from './getCurrentUser';

export const getCurrentUser = query({
  args: getCurrentUserArgs,
  handler: getCurrentUserHandler,
});
```

### 3. Domain-Level Export

```typescript
// convex/users/index.ts
export * from './queries/index';
export * from './mutations/index';
```

## Type Safety

### Args Type Definition

```typescript
export const getUserByIdArgs = {
  userId: v.id('users'),
};
```

### Handler Type Definition

```typescript
export const getUserByIdHandler = async (ctx: QueryCtx, args: { userId: Id<'users'> }) => {
  // Implementation
};
```

## Usage Examples

### Client-Side Usage (Same as before)

```typescript
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

const user = useQuery(api.users.getCurrentUser, { clerkId: 'user_123' });
```

### Testing Handler Functions

```typescript
// You can now test handlers independently
import { getCurrentUserHandler } from '@/convex/users/queries/getCurrentUser';

// Mock ctx and test the handler logic
const mockCtx = createMockContext();
const result = await getCurrentUserHandler(mockCtx, { clerkId: 'test_id' });
```

## Migration Guide

### Before (Traditional Pattern)

```typescript
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // implementation here
  },
});
```

### After (New Pattern)

```typescript
// In implementation file
export const getCurrentUserArgs = { clerkId: v.string() };
export const getCurrentUserHandler = async (ctx, args) => {
  // implementation here
};

// In index file
export const getCurrentUser = query({
  args: getCurrentUserArgs,
  handler: getCurrentUserHandler,
});
```

## Domains Implemented

✅ **Users Domain**

- Queries: getCurrentUser, getUserById, getUserByEmail, getUsers
- Mutations: updateProfile

✅ **Organizations Domain**

- Queries: getOrganizationById, getOrganizations
- Mutations: createOrganization

✅ **Permissions Domain**

- Queries: getPermissions, getPermissionUsageSummary
- Mutations: createPermission

## Next Steps

1. **Complete Migration**: Continue refactoring remaining functions in each domain
2. **Add More Functions**: Add remaining query/mutation exports to index files
3. **Testing**: Implement unit tests for handler functions
4. **Documentation**: Add JSDoc comments to all handler functions

## Convention Rules

1. **Args Export**: Always export args with suffix `Args`
2. **Handler Export**: Always export handler with suffix `Handler`
3. **Type Safety**: Use proper TypeScript types for args parameter
4. **Context Type**: Use `QueryCtx` for queries, `MutationCtx` for mutations
5. **Index Files**: Import and re-export all functions in index files
6. **Domain Exports**: Use barrel exports at domain level
