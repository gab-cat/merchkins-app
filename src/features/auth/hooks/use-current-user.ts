'use client';

import { useAuth } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex-helpers/react/cache';

type CurrentUserResult = {
  user: Doc<'users'> | null | undefined;
  isLoading: boolean;
};

export const useCurrentUser = (): CurrentUserResult => {
  const { userId: clerkId, isLoaded } = useAuth();

  // Always call useQuery unconditionally to respect React's Rules of Hooks
  // Pass 'skip' when there's no clerkId to skip the actual query
  const user = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');

  // If Clerk hasn't loaded yet, we're still loading
  if (!isLoaded) {
    return {
      user: undefined,
      isLoading: true,
    };
  }

  // If no clerkId, user is not authenticated
  if (!clerkId) {
    return {
      user: null,
      isLoading: false,
    };
  }

  return {
    user,
    isLoading: user === undefined,
  };
};
