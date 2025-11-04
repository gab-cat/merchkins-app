'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export const useCurrentUser = () => {
  const { userId: clerkId, isLoaded } = useAuth();

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

  // Query the user from our database
  const user = useQuery(api.users.queries.index.getCurrentUser, { clerkId });

  return {
    user,
    isLoading: user === undefined,
  };
};
