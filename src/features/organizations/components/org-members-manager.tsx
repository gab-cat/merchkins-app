'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { cn, buildR2PublicUrl } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@clerk/nextjs';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Copy,
  Link2,
  Clock,
  XCircle,
  Trash2,
  Crown,
  UserCog,
  User,
  Search,
  Filter,
  LinkIcon,
  UserCheck,
  UserX,
  Plus,
} from 'lucide-react';

interface Props {
  organizationId: Id<'organizations'>;
  orgSlug?: string;
}

type RoleType = 'ADMIN' | 'STAFF' | 'MEMBER';

const ROLE_CONFIG: Record<RoleType, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  ADMIN: { icon: Crown, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/30', label: 'Admin' },
  STAFF: { icon: UserCog, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950/30', label: 'Staff' },
  MEMBER: { icon: User, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-950/30', label: 'Member' },
};

export function OrgMembersManager({ organizationId, orgSlug }: Props) {
  const { userId: clerkId } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'invites' | 'requests'>('members');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF' | 'MEMBER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<Record<string, boolean>>({});
  const [permCRUDE, setPermCRUDE] = useState({ canCreate: false, canRead: true, canUpdate: false, canDelete: false });
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<string>('7');
  const [usageLimit, setUsageLimit] = useState<string>('10');

  const members = useQuery(api.organizations.queries.index.getOrganizationMembers, {
    organizationId,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    isActive: true,
    limit: 100,
  });

  const organization = useQuery(api.organizations.queries.index.getOrganizationById, { organizationId });

  const permissions = useQuery(api.permissions.queries.index.getPermissions, {
    isActive: true,
    limit: 100,
  });

  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');

  const inviteLinks = useQuery(
    api.organizations.queries.index.getOrganizationInviteLinks,
    activeTab === 'invites' ? { organizationId, isActive: true } : 'skip'
  );

  const joinRequests = useQuery(
    api.organizations.queries.index.listJoinRequests,
    activeTab === 'requests' ? { organizationId, status: 'PENDING' } : 'skip'
  );

  const updateRole = useMutation(api.organizations.mutations.index.updateMemberRole);
  const removeMember = useMutation(api.organizations.mutations.index.removeMember);
  const assignOrgPermission = useMutation(api.permissions.mutations.index.assignOrganizationPermission);
  const createInviteLink = useMutation(api.organizations.mutations.index.createInviteLink);
  const deactivateInvite = useMutation(api.organizations.mutations.index.deactivateInviteLink);
  const reviewJoinRequest = useMutation(api.organizations.mutations.index.reviewJoinRequest);

  type OrgMember = Doc<'organizationMembers'>;
  type Permission = Doc<'permissions'>;
  type InviteLink = Doc<'organizationInviteLinks'>;

  const items: OrgMember[] = members?.page ?? [];
  const permissionItems: Permission[] = permissions?.page ?? [];

  // Search filtering
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((m) => [m.userInfo?.firstName, m.userInfo?.lastName, m.userInfo?.email].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [items, searchQuery]);

  function toggleSelect(userId: string) {
    setSelected((prev) => ({ ...prev, [userId]: !prev[userId] }));
  }

  function toggleSelectAll() {
    if (filteredItems.length === 0) return;
    const allSelected = filteredItems.every((m) => selected[m.userId]);
    const next: Record<string, boolean> = {};
    for (const m of filteredItems) next[m.userId] = !allSelected;
    setSelected(next);
  }

  async function handleRoleChange(memberId: Id<'users'>, nextRole: 'ADMIN' | 'STAFF' | 'MEMBER') {
    try {
      await updateRole({ organizationId, userId: memberId, role: nextRole });
      showToast({ type: 'success', title: `Role updated to ${nextRole.toLowerCase()}` });
    } catch {
      showToast({ type: 'error', title: 'Failed to update role' });
    }
  }

  async function handleRemove(memberId: Id<'users'>) {
    try {
      await removeMember({ organizationId, userId: memberId });
      showToast({ type: 'success', title: 'Member removed' });
    } catch {
      showToast({ type: 'error', title: 'Failed to remove member' });
    }
  }

  async function handleAssignPermissions() {
    const targetUserIds = Object.keys(selected).filter((k) => selected[k]) as Array<Id<'users'>>;
    const codes = Object.keys(selectedPermissionCodes).filter((k) => selectedPermissionCodes[k]);
    if (targetUserIds.length === 0 || codes.length === 0) return;
    try {
      for (const userId of targetUserIds) {
        for (const code of codes) {
          await assignOrgPermission({
            organizationId,
            userId,
            permissionCode: code,
            ...permCRUDE,
          });
        }
      }
      showToast({ type: 'success', title: 'Permissions assigned' });
      setAssignOpen(false);
      setSelected({});
      setSelectedPermissionCodes({});
    } catch {
      showToast({ type: 'error', title: 'Failed to assign permissions' });
    }
  }

  async function handleCreateInvite() {
    if (!currentUser?._id) return;
    setCreatingInvite(true);
    try {
      const now = Date.now();
      const days = parseInt(expiresInDays || '0');
      const expiresAt = days > 0 ? now + days * 24 * 60 * 60 * 1000 : undefined;
      const limit = usageLimit ? parseInt(usageLimit) : undefined;
      await createInviteLink({
        organizationId,
        createdById: currentUser._id,
        expiresAt,
        usageLimit: limit,
      });
      showToast({ type: 'success', title: 'Invite link created' });
    } catch {
      showToast({ type: 'error', title: 'Failed to create invite' });
    } finally {
      setCreatingInvite(false);
    }
  }

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const slug = orgSlug || organization?.slug;

  const tabs = [
    { id: 'members' as const, label: 'Members', icon: Users, count: filteredItems.length },
    { id: 'invites' as const, label: 'Invites', icon: Link2, count: inviteLinks?.length || 0 },
    { id: 'requests' as const, label: 'Requests', icon: UserPlus, count: joinRequests?.page?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/20'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'members' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as 'ALL' | RoleType)}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={toggleSelectAll}>
              Select All
            </Button>
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
              <DialogTrigger asChild>
                <Button disabled={selectedCount === 0}>
                  <Shield className="h-4 w-4 mr-2" />
                  Permissions ({selectedCount})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign Permissions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="max-h-64 overflow-auto rounded-lg border p-3">
                    {permissionItems.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4">No permissions found.</div>
                    ) : (
                      <div className="space-y-2">
                        {permissionItems.map((p) => (
                          <label key={p._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <Checkbox
                              checked={!!selectedPermissionCodes[p.code]}
                              onCheckedChange={() => setSelectedPermissionCodes((prev) => ({ ...prev, [p.code]: !prev[p.code] }))}
                            />
                            <div>
                              <div className="text-sm font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground">{p.code}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Access Level</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: 'canCreate', label: 'Create' },
                        { key: 'canRead', label: 'Read' },
                        { key: 'canUpdate', label: 'Update' },
                        { key: 'canDelete', label: 'Delete' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={permCRUDE[key as keyof typeof permCRUDE]}
                            onCheckedChange={(checked) => setPermCRUDE((s) => ({ ...s, [key]: !!checked }))}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAssignOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignPermissions} disabled={Object.values(selectedPermissionCodes).every((v) => !v)}>
                    Assign
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Member List */}
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border bg-muted/30">
              <Users className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold">No Members Found</h3>
              <p className="text-sm text-muted-foreground">{searchQuery ? 'Try adjusting your search query.' : 'Invite members to get started.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((m, index) => (
                <MemberCard
                  key={m._id}
                  member={m}
                  orgSlug={slug}
                  selected={!!selected[m.userId]}
                  onSelect={() => toggleSelect(m.userId)}
                  onRoleChange={(role) => handleRoleChange(m.userId, role)}
                  onRemove={() => handleRemove(m.userId)}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'invites' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Create Invite */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" />
                Create Invite Link
              </CardTitle>
              <CardDescription>Generate a shareable link for new members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Expires In (days)</label>
                  <Input value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} placeholder="e.g. 7" type="number" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Usage Limit</label>
                  <Input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="e.g. 10" type="number" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full" onClick={handleCreateInvite} disabled={!currentUser || creatingInvite}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    {creatingInvite ? 'Creating...' : 'Create Link'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Invites */}
          <div className="space-y-3">
            <h3 className="font-semibold font-admin-heading">Active Invite Links</h3>
            {!inviteLinks || inviteLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border bg-muted/30">
                <Link2 className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="font-semibold">No Active Invites</h3>
                <p className="text-sm text-muted-foreground">Create an invite link to share with potential members.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inviteLinks.map((inv: InviteLink, index: number) => (
                  <InviteLinkCard
                    key={inv._id}
                    invite={inv}
                    onDeactivate={() => {
                      deactivateInvite({ inviteLinkId: inv._id });
                      showToast({ type: 'success', title: 'Invite deactivated' });
                    }}
                    onCopy={() => {
                      // Using window.location.origin for URL construction (needed for invite link)
                      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                      const fullUrl = `${baseUrl}/invite/${inv.code}`;
                      navigator.clipboard.writeText(fullUrl);
                      showToast({ type: 'success', title: 'Invite URL copied to clipboard' });
                    }}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'requests' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-semibold font-admin-heading">Pending Join Requests</h3>
          {!joinRequests || joinRequests.page?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border bg-muted/30">
              <UserPlus className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold">No Pending Requests</h3>
              <p className="text-sm text-muted-foreground">New join requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {joinRequests.page?.map(
                (req: { _id: Id<'organizationJoinRequests'>; userId: string; createdAt: number; note?: string }, index: number) => (
                  <JoinRequestCard
                    key={req._id}
                    request={req}
                    onApprove={() => {
                      reviewJoinRequest({ organizationId, requestId: req._id, approve: true });
                      showToast({ type: 'success', title: 'Request approved' });
                    }}
                    onReject={() => {
                      reviewJoinRequest({ organizationId, requestId: req._id, approve: false });
                      showToast({ type: 'success', title: 'Request rejected' });
                    }}
                    index={index}
                  />
                )
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Role badge component
function RoleBadge({ role }: { role: RoleType }) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bgColor, config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// Member card component
function MemberCard({
  member,
  orgSlug,
  selected,
  onSelect,
  onRoleChange,
  onRemove,
  index,
}: {
  member: Doc<'organizationMembers'>;
  orgSlug?: string;
  selected: boolean;
  onSelect: () => void;
  onRoleChange: (role: RoleType) => void;
  onRemove: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'group flex items-center gap-4 p-4 rounded-xl border bg-card transition-all',
        selected && 'ring-2 ring-primary border-primary',
        'hover:shadow-sm'
      )}
    >
      <Checkbox checked={selected} onCheckedChange={onSelect} className="shrink-0" />

      <MemberAvatar imageUrl={member.userInfo?.imageUrl} firstName={member.userInfo?.firstName} lastName={member.userInfo?.lastName} />

      <div className="flex-1 min-w-0">
        <Link
          href={`/admin/org-members/${member.userId}${orgSlug ? `?org=${orgSlug}` : ''}`}
          className="font-medium text-sm hover:text-primary transition-colors"
        >
          {[member.userInfo?.firstName, member.userInfo?.lastName].filter(Boolean).join(' ') || 'Unknown User'}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground truncate">{member.userInfo?.email || 'No email'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <RoleBadge role={member.role as RoleType} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onRoleChange('ADMIN')}>
              <Crown className="h-4 w-4 mr-2 text-amber-600" />
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange('STAFF')}>
              <UserCog className="h-4 w-4 mr-2 text-blue-600" />
              Make Staff
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange('MEMBER')}>
              <User className="h-4 w-4 mr-2 text-slate-600" />
              Make Member
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

// Invite link card
function InviteLinkCard({
  invite,
  onDeactivate,
  onCopy,
  index,
}: {
  invite: Doc<'organizationInviteLinks'>;
  onDeactivate: () => void;
  onCopy: () => void;
  index: number;
}) {
  const expiresAt = invite.expiresAt ? new Date(invite.expiresAt) : null;
  const isExpired = expiresAt && expiresAt < new Date();
  // Using window.location.origin for URL construction (needed for invite link)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullInviteUrl = `${baseUrl}/invite/${invite.code}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-card"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', isExpired ? 'bg-red-100 dark:bg-red-950/30' : 'bg-primary/10')}>
          <Link2 className={cn('h-5 w-5', isExpired ? 'text-red-600' : 'text-primary')} />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-xs text-muted-foreground truncate max-w-[280px]" title={fullInviteUrl}>
            {fullInviteUrl}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {invite.usedCount}/{invite.usageLimit || '∞'}
            </span>
            {expiresAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {isExpired ? 'Expired' : `Expires ${expiresAt.toLocaleDateString()}`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onCopy}>
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          Copy URL
        </Button>
        <Button size="sm" variant="destructive" onClick={onDeactivate}>
          <XCircle className="h-3.5 w-3.5 mr-1.5" />
          Deactivate
        </Button>
      </div>
    </motion.div>
  );
}

// Join request card
function JoinRequestCard({
  request,
  onApprove,
  onReject,
  index,
}: {
  request: { _id: Id<'organizationJoinRequests'>; userId: string; createdAt: number; note?: string };
  onApprove: () => void;
  onReject: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-card"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
          <UserPlus className="h-5 w-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm">{request.userId}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Requested {new Date(request.createdAt).toLocaleDateString()}</div>
          {request.note && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">&quot;{request.note}&quot;</div>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onReject}>
          <UserX className="h-3.5 w-3.5 mr-1.5" />
          Reject
        </Button>
        <Button size="sm" onClick={onApprove}>
          <UserCheck className="h-3.5 w-3.5 mr-1.5" />
          Approve
        </Button>
      </div>
    </motion.div>
  );
}

function MemberAvatar({ imageUrl, firstName, lastName }: { imageUrl?: string; firstName?: string; lastName?: string }) {
  const displayUrl = buildR2PublicUrl(imageUrl || null);
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  return (
    <Avatar className="h-10 w-10">
      {displayUrl && <AvatarImage src={displayUrl} alt={`${firstName} ${lastName}`} />}
      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">{initials}</AvatarFallback>
    </Avatar>
  );
}
