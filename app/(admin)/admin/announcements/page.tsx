'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Bell,
} from 'lucide-react';

// Admin Components
import { PageHeader } from '@/src/components/admin/page-header';
import { StatusBadge } from '@/src/components/admin/status-badge';
import { EmptyState } from '@/src/components/admin/empty-state';
import { MetricCard, MetricGrid } from '@/src/components/admin/metric-card';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { showToast } from '@/lib/toast';

type Announcement = Doc<'announcements'>;

type AnnouncementLevel = 'INFO' | 'WARNING' | 'CRITICAL';
type AnnouncementType = 'NORMAL' | 'SYSTEM';
type TargetAudience = 'ALL' | 'STAFF' | 'CUSTOMERS' | 'MERCHANTS' | 'ADMINS';

const levelConfig: Record<AnnouncementLevel, { icon: any; color: string; bg: string }> = {
  INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  CRITICAL: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
};

function AnnouncementCard({
  announcement,
  onToggleActive,
  onTogglePinned,
  onEdit,
  onDelete,
}: {
  announcement: Announcement;
  onToggleActive: () => void;
  onTogglePinned: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const level = announcement.level as AnnouncementLevel;
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md ${!announcement.isActive ? 'opacity-60' : ''}`}
    >
      {/* Level indicator bar */}
      <div className={`h-1 ${level === 'CRITICAL' ? 'bg-red-500' : level === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold font-admin-heading truncate">{announcement.title}</h3>
                  {announcement.isPinned && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  {!announcement.isActive && (
                    <Badge variant="outline" className="text-[10px]">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{announcement.content}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onTogglePinned}>
                    {announcement.isPinned ? (
                      <>
                        <PinOff className="h-4 w-4 mr-2" />
                        Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="h-4 w-4 mr-2" />
                        Pin
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onToggleActive}>
                    {announcement.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(announcement.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {announcement.targetAudience}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {announcement.viewCount} views
              </div>
              {announcement.category && (
                <Badge variant="outline" className="text-[10px]">
                  {announcement.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreateAnnouncementDialog({
  open,
  onOpenChange,
  organizationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: Id<'organizations'>;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState<AnnouncementLevel>('INFO');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL');
  const [category, setCategory] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAnnouncement = useMutation(api.announcements.mutations.index.createAnnouncement);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showToast({ type: 'error', title: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createAnnouncement({
        organizationId,
        title: title.trim(),
        content: content.trim(),
        level,
        targetAudience,
        category: category.trim() || undefined,
        isPinned,
        type: 'NORMAL',
        contentType: 'TEXT',
      });
      showToast({ type: 'success', title: 'Announcement created successfully' });
      onOpenChange(false);
      // Reset form
      setTitle('');
      setContent('');
      setLevel('INFO');
      setTargetAudience('ALL');
      setCategory('');
      setIsPinned(false);
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Failed to create announcement' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-admin-heading">Create Announcement</DialogTitle>
          <DialogDescription>Create a new announcement to broadcast to your audience.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea id="content" placeholder="Write your announcement..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as AnnouncementLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      Info
                    </div>
                  </SelectItem>
                  <SelectItem value="WARNING">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Warning
                    </div>
                  </SelectItem>
                  <SelectItem value="CRITICAL">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Critical
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as TargetAudience)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Everyone</SelectItem>
                  <SelectItem value="CUSTOMERS">Customers</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="MERCHANTS">Merchants</SelectItem>
                  <SelectItem value="ADMINS">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input id="category" placeholder="e.g., Updates, Maintenance" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="pinned" checked={isPinned} onCheckedChange={(checked) => setIsPinned(checked as boolean)} />
            <Label htmlFor="pinned" className="text-sm cursor-pointer">
              Pin this announcement
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Announcement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');

  const [search, setSearch] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);
  const [levelFilter, setLevelFilter] = useState<AnnouncementLevel | 'ALL'>('ALL');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  const result = useQuery(api.announcements.queries.index.getAnnouncements, {
    organizationId: orgSlug ? organization?._id : undefined,
    includeInactive: !onlyActive,
    limit: 100,
    offset: 0,
  });

  const updateAnnouncement = useMutation(api.announcements.mutations.index.updateAnnouncement);
  const deleteAnnouncement = useMutation(api.announcements.mutations.index.deleteAnnouncement);

  const loading = result === undefined || (orgSlug && organization === undefined);
  const announcements = useMemo(() => result?.page ?? [], [result?.page]);

  const filtered = useMemo(() => {
    let list = announcements;

    // Filter by level
    if (levelFilter !== 'ALL') {
      list = list.filter((a: Announcement) => a.level === levelFilter);
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a: Announcement) => [a.title || '', a.content || '', a.category || ''].join(' ').toLowerCase().includes(q));
    }

    // Sort: pinned first, then by date
    return list.sort((a: Announcement, b: Announcement) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.publishedAt - a.publishedAt;
    });
  }, [announcements, levelFilter, search]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = announcements.filter((a: Announcement) => a.isActive).length;
    const pinned = announcements.filter((a: Announcement) => a.isPinned).length;
    const critical = announcements.filter((a: Announcement) => a.level === 'CRITICAL' && a.isActive).length;
    const totalViews = announcements.reduce((sum: number, a: Announcement) => sum + (a.viewCount || 0), 0);
    return { active, pinned, critical, totalViews };
  }, [announcements]);

  const handleToggleActive = async (id: Id<'announcements'>, isActive: boolean) => {
    try {
      await updateAnnouncement({ announcementId: id, isActive: !isActive });
      showToast({ type: 'success', title: isActive ? 'Announcement deactivated' : 'Announcement activated' });
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to update announcement' });
    }
  };

  const handleTogglePinned = async (id: Id<'announcements'>, isPinned: boolean) => {
    try {
      await updateAnnouncement({ announcementId: id, isPinned: !isPinned });
      showToast({ type: 'success', title: isPinned ? 'Announcement unpinned' : 'Announcement pinned' });
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to update announcement' });
    }
  };

  const handleDelete = async (id: Id<'announcements'>) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement({ announcementId: id });
      showToast({ type: 'success', title: 'Announcement deleted' });
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to delete announcement' });
    }
  };

  if (loading) {
    return <AnnouncementsSkeleton />;
  }

  return (
    <div className="font-admin-body space-y-6">
      <PageHeader
        title="Announcements"
        description="Create and manage broadcast messages"
        icon={<Megaphone className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: `/admin/overview${orgSlug ? `?org=${orgSlug}` : ''}` }, { label: 'Announcements' }]}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Announcement
          </Button>
        }
      />

      {/* Stats */}
      <MetricGrid columns={4}>
        <MetricCard title="Active" value={stats.active} icon={Bell} description={`${announcements.length} total`} />
        <MetricCard title="Pinned" value={stats.pinned} icon={Pin} />
        <MetricCard title="Critical" value={stats.critical} icon={AlertCircle} variant={stats.critical > 0 ? 'gradient' : 'default'} />
        <MetricCard title="Total Views" value={stats.totalViews.toLocaleString()} icon={Eye} />
      </MetricGrid>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as AnnouncementLevel | 'ALL')}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="INFO">Info</SelectItem>
            <SelectItem value="WARNING">Warning</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox id="onlyActive" checked={onlyActive} onCheckedChange={(checked) => setOnlyActive(checked as boolean)} />
          <Label htmlFor="onlyActive" className="text-sm cursor-pointer">
            Only active
          </Label>
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-12 w-12 text-muted-foreground" />}
          title="No announcements"
          description={
            search || levelFilter !== 'ALL' ? 'No announcements match your filters' : 'Create your first announcement to broadcast messages'
          }
          action={{
            label: 'Create Announcement',
            onClick: () => setCreateDialogOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((announcement: Announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                onToggleActive={() => handleToggleActive(announcement._id, !!announcement.isActive)}
                onTogglePinned={() => handleTogglePinned(announcement._id, !!announcement.isPinned)}
                onEdit={() => {
                  /* TODO: Implement edit dialog */
                }}
                onDelete={() => handleDelete(announcement._id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Dialog */}
      <CreateAnnouncementDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} organizationId={organization?._id} />
    </div>
  );
}
