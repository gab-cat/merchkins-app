'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Announcement = Doc<'announcements'>;

export default function AdminAnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  const result = useQuery(api.announcements.queries.index.getAnnouncements, {
    includeInactive: !onlyActive,
    category: categoryFilter.trim() || undefined,
    limit: 100,
    offset: 0,
  });
  const update = useMutation(api.announcements.mutations.index.updateAnnouncement);

  const loading = result === undefined;
  const announcements = useMemo(() => result?.page ?? [], [result?.page]);

  const filtered = useMemo(() => {
    if (!search) return announcements;
    const q = search.toLowerCase();
    return announcements.filter((a: Announcement) => [a.title || '', a.content || ''].join(' ').toLowerCase().includes(q));
  }, [announcements, search]);

  async function toggleActive(id: Id<'announcements'>, isActive: boolean) {
    await update({ announcementId: id, isActive: !isActive });
  }

  async function togglePinned(id: Id<'announcements'>, isPinned: boolean) {
    await update({ announcementId: id, isPinned: !isPinned });
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Announcements</h1>
          <p className="text-sm text-muted-foreground">Create and manage broadcast messages</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Input placeholder="Filter by category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-48" />
          <div className="flex items-center gap-2">
            <Checkbox id="onlyActive" checked={onlyActive} onCheckedChange={(checked) => setOnlyActive(checked as boolean)} />
            <label htmlFor="onlyActive" className="text-sm font-medium">
              Only active
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pinned</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? new Array(8).fill(null).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-12 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-48 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 w-24 animate-pulse rounded bg-secondary ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : filtered.map((a: Announcement) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium max-w-xs truncate" title={a.title}>
                      {a.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {a.category || 'general'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.isActive ? 'default' : 'secondary'}>{a.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.isPinned ? 'default' : 'outline'}>{a.isPinned ? 'Pinned' : 'Not pinned'}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate">{a.content}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button size="sm" variant={a.isPinned ? 'secondary' : 'outline'} onClick={() => togglePinned(a._id, !!a.isPinned)}>
                          {a.isPinned ? 'Unpin' : 'Pin'}
                        </Button>
                        <Button size="sm" variant={a.isActive ? 'secondary' : 'outline'} onClick={() => toggleActive(a._id, !!a.isActive)}>
                          {a.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      {!loading && filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No announcements found.</div>}
    </div>
  );
}
