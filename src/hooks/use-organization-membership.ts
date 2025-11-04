import { useQuery } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';

export const useOrganizationMembership = (organizationId: string) => {
  const { userId: clerkId, isSignedIn } = useAuth();

  // Get current user to get their Convex user ID
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');

  // Get user's organizations
  const userOrganizations = useQuery(
    api.organizations.queries.index.getOrganizationsByUser,
    currentUser?._id ? { userId: currentUser._id, isActive: true } : 'skip'
  );

  // Check if user is a member of the specific organization
  const isMember = userOrganizations?.some((org) => org._id === organizationId) ?? false;

  return {
    isAuthenticated: !!isSignedIn,
    isMember,
    isLoading: currentUser === undefined || userOrganizations === undefined,
  };
};
