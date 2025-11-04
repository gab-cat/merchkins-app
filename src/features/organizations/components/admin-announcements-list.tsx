'use client';

import React from 'react';
import { api } from '@/convex/_generated/api';
import { useCursorPagination } from '@/src/hooks/use-pagination';
import { LoadMore } from '@/src/components/ui/pagination';
import { Doc } from '@/convex/_generated/dataModel';

type Announcement = Doc<'announcements'>;

interface AnnouncementsResponse {
  page: Announcement[];
  isDone: boolean;
  continueCursor: string | null;
}

export function AdminAnnouncementsList() {
  const { items, isLoading, hasMore, loadMore } = useCursorPagination<Announcement, { targetAudience: 'ADMINS' }>({
    query: api.announcements.queries.index.getAnnouncements,
    baseArgs: { targetAudience: 'ADMINS' },
    limit: 5,
    selectPage: (res: unknown) => {
      const result = res as AnnouncementsResponse;
      return {
        page: (result.page || []) as ReadonlyArray<Announcement>,
        isDone: !!result.isDone,
        continueCursor: result.continueCursor ?? null,
      };
    },
  });

  if (isLoading && items.length === 0) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  const list = items || [];

  return (
    <div className="space-y-3">
      {list.map((a: Announcement) => (
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
      {list.length === 0 && <div className="text-sm text-muted-foreground">No announcements.</div>}
      <LoadMore onClick={loadMore} disabled={isLoading} isVisible={hasMore} />
    </div>
  );
}
