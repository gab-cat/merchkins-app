'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { api } from '@/convex/_generated/api';

export function SuperAdminGuard() {
  const router = useRouter();
  const { userId } = useAuth();

  const user = useQuery(api.users.queries.index.getCurrentUser, userId ? { clerkId: userId } : 'skip');

  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      router.replace('/sign-in');
      return;
    }
    if (!user.isAdmin) {
      router.replace('/');
    }
  }, [user, router]);

  return null;
}
