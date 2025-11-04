'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import type { Id } from '@/convex/_generated/dataModel';
import { UserProfile } from '@/src/features/users/components/user-profile';

export default function SuperAdminUserProfilePage() {
  const params = useParams() as { id: string };
  const userId = params.id as unknown as Id<'users'>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">User Profile</h1>
      <UserProfile userId={userId} />
    </div>
  );
}
