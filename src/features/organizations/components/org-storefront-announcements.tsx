'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Announcement = Doc<'announcements'>;

interface Props {
  organizationId: Id<'organizations'>;
}

export function OrgStorefrontAnnouncements({ organizationId }: Props) {
  const { userId: clerkId } = useAuth();
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : ('skip' as unknown as { clerkId: string }));

  const orgs = useQuery(
    api.organizations.queries.index.getOrganizationsByUser,
    currentUser?._id ? { userId: currentUser._id } : ('skip' as unknown as { userId: Id<'users'> })
  );

  const isMember = useMemo(() => {
    if (!orgs) return false;
    return orgs.some((o) => o._id === organizationId);
  }, [orgs, organizationId]);

  const pinned = useQuery(
    api.announcements.queries.index.getPinnedAnnouncements,
    isMember ? { organizationId } : ('skip' as unknown as { organizationId: Id<'organizations'> })
  );

  if (!isMember || !pinned || pinned.length === 0) return null;

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pinned.map((a: Announcement) => (
              <div key={a._id} className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 rounded-md bg-accent/60 px-2 py-0.5 text-xs text-accent-foreground">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
                      <span className="truncate max-w-[120px]">{a.category || 'general'}</span>
                    </span>
                    <div className="truncate font-medium" title={a.title}>
                      {a.title}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.publishedAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{a.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
