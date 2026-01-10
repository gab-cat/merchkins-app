'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { cn, buildR2PublicUrl } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@clerk/nextjs';
import { Users, Shield, MoreVertical, Copy, Link2, Clock, Trash2, Crown, UserCog, User, Search, UserCheck, Plus, Loader2, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  organizationId: Id<'organizations'>;
  _orgSlug?: string;
}

type RoleType = 'ADMIN' | 'STAFF' | 'MEMBER';

type JoinRequest = Doc<'organizationJoinRequests'>;
type InviteLink = Doc<'organizationInviteLinks'>;

const ROLE_CONFIG: Record<RoleType, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  ADMIN: {
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    label: 'Admin',
  },
  STAFF: { icon: UserCog, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800', label: 'Staff' },
  MEMBER: { icon: User, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', label: 'Member' },
};

function RequestCard({
  request,
  organizationId,
  onReview,
}: {
  request: JoinRequest;
  organizationId: Id<'organizations'>;
  onReview: (args: { organizationId: Id<'organizations'>; requestId: Id<'organizationJoinRequests'>; approve: boolean }) => Promise<void>;
}) {
  const userInfo = useQuery(api.users.queries.index.getUserById, { userId: request.userId });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border bg-card transition-all hover:border-primary/20 hover:shadow-md overflow-hidden"
    >
      <Card className="border-0 shadow-none">
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 border shrink-0">
              <AvatarImage src={userInfo ? buildR2PublicUrl(userInfo.imageUrl || null) || undefined : undefined} />
              <AvatarFallback>{userInfo?.firstName?.[0] || userInfo?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="font-medium text-sm flex items-center gap-2">
                {userInfo ? [userInfo.firstName, userInfo.lastName].filter(Boolean).join(' ') || userInfo.email || 'Unknown User' : 'Loading...'}
              </div>
              <div className="text-xs text-muted-foreground truncate">{userInfo?.email || `User ID: ${request.userId.slice(-8)}`}</div>
              {request.note && <div className="mt-2 text-xs bg-muted/50 p-2 rounded border border-border/50 italic max-w-md">"{request.note}"</div>}
              <div className="text-xs text-muted-foreground mt-1">
                Requested {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            <Button size="sm" variant="outline" className="h-9" onClick={() => onReview({ organizationId, requestId: request._id, approve: false })}>
              Reject
            </Button>
            <Button size="sm" className="h-9" onClick={() => onReview({ organizationId, requestId: request._id, approve: true })}>
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function OrgMembersManager({ organizationId, _orgSlug }: Props) {
  const { userId: clerkId } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF' | 'MEMBER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<Record<string, boolean>>({});
  const [permCRUDE, setPermCRUDE] = useState({ canCreate: false, canRead: true, canUpdate: false, canDelete: false });
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<string>('7');
  const [usageLimit, setUsageLimit] = useState<string>('10');
  const [customCode, setCustomCode] = useState<string>('');

  const members = useQuery(api.organizations.queries.index.getOrganizationMembers, {
    organizationId,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    isActive: true,
    limit: 100,
  });

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
    activeTab === 'requests' || activeTab === 'members' ? { organizationId, status: 'PENDING' } : 'skip'
  );

  const updateRole = useMutation(api.organizations.mutations.index.updateMemberRole);
  const removeMember = useMutation(api.organizations.mutations.index.removeMember);
  const assignOrgPermission = useMutation(api.permissions.mutations.index.assignOrganizationPermission);
  const createInviteLink = useMutation(api.organizations.mutations.index.createInviteLink);
  const deactivateInvite = useMutation(api.organizations.mutations.index.deactivateInviteLink);
  const reviewJoinRequest = useMutation(api.organizations.mutations.index.reviewJoinRequest);

  type Permission = Doc<'permissions'>;

  const items = useMemo(() => members?.page ?? [], [members?.page]);
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

  async function handleRoleChange(memberId: Id<'users'>, nextRole: 'ADMIN' | 'STAFF' | 'MEMBER') {
    try {
      await updateRole({ organizationId, userId: memberId, role: nextRole });
      showToast({ type: 'success', title: `Role updated to ${nextRole.toLowerCase()}` });
    } catch {
      showToast({ type: 'error', title: 'Failed to update role' });
    }
  }

  async function handleRemove(memberId: Id<'users'>) {
    if (!confirm('Are you sure you want to remove this member?')) return;
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

    // Client-side validation for custom code
    const trimmedCode = customCode.trim();
    if (trimmedCode) {
      const alphanumericRegex = /^[A-Z0-9]+$/;
      if (!alphanumericRegex.test(trimmedCode)) {
        showToast({
          type: 'error',
          title: 'Invalid code format',
          description: 'Code must contain only letters (A-Z) and numbers (0-9).',
        });
        return;
      }
    }

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
        code: trimmedCode || undefined,
      });
      showToast({ type: 'success', title: 'Invite link created' });
      // Reset form fields
      setCustomCode('');
      setExpiresInDays('7');
      setUsageLimit('10');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create invite';
      if (errorMessage.includes('already in use')) {
        showToast({
          type: 'error',
          title: 'Code already in use',
          description: 'This code is already in use. Please choose a different code.',
        });
      } else if (errorMessage.includes('must contain only')) {
        showToast({
          type: 'error',
          title: 'Invalid code format',
          description: 'Code must contain only letters (A-Z) and numbers (0-9).',
        });
      } else {
        showToast({ type: 'error', title: 'Failed to create invite', description: errorMessage });
      }
    } finally {
      setCreatingInvite(false);
    }
  }

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);
  const requestsCount = joinRequests?.page?.length || 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/30 border p-1 rounded-xl mb-4">
          <TabsTrigger value="members" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" /> Members
            <Badge variant="secondary" className="px-1.5 h-5 min-w-5">
              {filteredItems.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="invites" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Link2 className="h-4 w-4" /> Invites
            {inviteLinks && inviteLinks.length > 0 && (
              <Badge variant="secondary" className="px-1.5 h-5 min-w-5">
                {inviteLinks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm relative">
            <UserCheck className="h-4 w-4" /> Requests
            {requestsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                {requestsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-3 focus-visible:outline-none">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center bg-card border rounded-xl p-2 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 border-none bg-transparent focus-visible:ring-0"
              />
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
                <SelectTrigger className="h-9 w-[130px] border-none bg-muted/30 focus:bg-muted/50 transition-colors">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="MEMBER">Members</SelectItem>
                </SelectContent>
              </Select>

              {selectedCount > 0 && (
                <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="h-9 gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      Assign Permission ({selectedCount})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Assign Permissions</DialogTitle>
                      <DialogDescription>Apply permissions to {selectedCount} selected members.</DialogDescription>
                    </DialogHeader>
                    {/* Permission assignment logic reused from original but simplified structure */}
                    <div className="space-y-4">
                      <div className="max-h-64 overflow-auto rounded-lg border p-1 bg-muted/10">
                        {permissionItems.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-8">No specific permissions available.</div>
                        ) : (
                          <div className="space-y-1">
                            {permissionItems.map((p) => (
                              <label
                                key={p._id}
                                className="flex items-center gap-3 p-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                              >
                                <Checkbox
                                  checked={!!selectedPermissionCodes[p.code]}
                                  onCheckedChange={() => setSelectedPermissionCodes((prev) => ({ ...prev, [p.code]: !prev[p.code] }))}
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium leading-none">{p.name}</div>
                                  <div className="text-xs text-muted-foreground mt-1 font-mono">{p.code}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Access Level</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: 'canCreate', label: 'Create' },
                            { key: 'canRead', label: 'Read' },
                            { key: 'canUpdate', label: 'Update' },
                            { key: 'canDelete', label: 'Delete' },
                          ].map(({ key, label }) => (
                            <label
                              key={key}
                              className="flex items-center gap-2 text-sm border p-2 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                            >
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
                      <Button variant="ghost" onClick={() => setAssignOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAssignPermissions} disabled={Object.values(selectedPermissionCodes).every((v) => !v)}>
                        Confirm Assignment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Member List */}
          <div className="grid gap-3">
            <AnimatePresence initial={false}>
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
                  <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <h3 className="font-semibold text-lg">No members found</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mt-1">
                    {searchQuery ? 'No members match your search.' : 'Your organization has no members yet.'}
                  </p>
                </div>
              ) : (
                filteredItems.map((m, i) => (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'group flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border bg-card transition-all hover:border-primary/20 hover:shadow-md',
                      selected[m.userId] && 'bg-muted/30 border-primary/40 ring-1 ring-primary/40'
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox checked={selected[m.userId] || false} onCheckedChange={() => toggleSelect(m.userId)} />
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={buildR2PublicUrl(m.userInfo?.imageUrl || null) || undefined} />
                        <AvatarFallback>{m.userInfo?.firstName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm flex items-center gap-2">
                          {[m.userInfo?.firstName, m.userInfo?.lastName].filter(Boolean).join(' ') || 'Unknown User'}
                        </div>
                        <div className="text-xs text-muted-foreground">{m.userInfo?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pl-6 sm:pl-0">
                      <RoleBadge role={m.role as RoleType} />
                      <div className="text-xs text-muted-foreground hidden lg:block">Joined {new Date(m.joinedAt).toLocaleDateString()}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRoleChange(m.userId, 'ADMIN')}>
                            <Crown className="h-4 w-4 mr-2" /> Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(m.userId, 'STAFF')}>
                            <UserCog className="h-4 w-4 mr-2" /> Make Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(m.userId, 'MEMBER')}>
                            <User className="h-4 w-4 mr-2" /> Make Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleRemove(m.userId)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4 focus-visible:outline-none">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1 h-fit border-border/50 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="h-4 w-4" /> Create Invite Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Expiration</Label>
                  <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Custom Code (Optional)</Label>
                  <Input
                    type="text"
                    value={customCode}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      setCustomCode(value);
                    }}
                    placeholder="e.g. WELCOME2024"
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">Alphanumeric only (A-Z, 0-9). Leave empty to auto-generate.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Usage Limit</Label>
                  <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="e.g. 10" className="h-9" />
                  <p className="text-[11px] text-muted-foreground">Leave empty for unlimited.</p>
                </div>
                <Button className="w-full" onClick={handleCreateInvite} disabled={creatingInvite}>
                  {creatingInvite ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create Link
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold">Active Links</h3>
                {inviteLinks && inviteLinks.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {inviteLinks.length} {inviteLinks.length === 1 ? 'link' : 'links'}
                  </Badge>
                )}
              </div>
              {!inviteLinks || inviteLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
                  <Link2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <h3 className="font-semibold text-lg">No invite links</h3>
                  <p className="text-sm text-muted-foreground mt-1">Create an invite link to start inviting members.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inviteLinks.map((inv) => (
                    <InviteCard key={inv._id} invite={inv} onDelete={() => deactivateInvite({ inviteLinkId: inv._id })} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-3 focus-visible:outline-none">
          {!joinRequests || joinRequests.page?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
              <UserCheck className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="font-semibold text-lg">No pending requests</h3>
              <p className="text-sm text-muted-foreground mt-1">When users request to join, they will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {joinRequests.page?.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  organizationId={organizationId}
                  onReview={async (args) => {
                    await reviewJoinRequest(args);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RoleBadge({ role }: { role: RoleType }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.MEMBER;
  const Icon = config.icon;
  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', config.bgColor, config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
}

function InviteCard({ invite, onDelete }: { invite: InviteLink; onDelete: () => void }) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrl = `${baseUrl}/invite/${invite.code}`;
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddresses, setEmailAddresses] = useState('');
  const [isSending, setIsSending] = useState(false);
  const sendInviteEmail = useAction(api.organizations.actions.sendInviteEmail.sendInviteEmail);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    showToast({ title: 'Copied to clipboard', type: 'success' });
  };

  const parseEmailAddresses = (input: string): string[] => {
    // Split by comma or newline, trim, and filter out empty strings
    return input
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  };

  const validateEmails = (emails: string[]): { valid: string[]; invalid: string[] } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid: string[] = [];
    const invalid: string[] = [];

    emails.forEach((email) => {
      if (emailRegex.test(email)) {
        valid.push(email);
      } else {
        invalid.push(email);
      }
    });

    return { valid, invalid };
  };

  const handleSendEmails = async () => {
    const parsedEmails = parseEmailAddresses(emailAddresses);

    if (parsedEmails.length === 0) {
      showToast({ title: 'Please enter at least one email address', type: 'error' });
      return;
    }

    const { valid, invalid } = validateEmails(parsedEmails);

    if (invalid.length > 0) {
      showToast({
        title: 'Invalid email addresses',
        description: `Please fix: ${invalid.join(', ')}`,
        type: 'error',
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await sendInviteEmail({
        inviteLinkId: invite._id,
        emailAddresses: valid,
      });

      if (result.success) {
        const successCount = result.results.filter((r) => r.success).length;
        const failCount = result.results.filter((r) => !r.success).length;

        if (failCount === 0) {
          showToast({
            title: 'Emails sent successfully',
            description: `${successCount} email${successCount === 1 ? '' : 's'} sent`,
            type: 'success',
          });
          setEmailDialogOpen(false);
          setEmailAddresses('');
        } else {
          const failedEmails = result.results
            .filter((r) => !r.success)
            .map((r) => r.email)
            .join(', ');
          showToast({
            title: 'Some emails failed to send',
            description: `Failed: ${failedEmails}`,
            type: 'error',
          });
        }
      } else {
        showToast({ title: 'Failed to send emails', type: 'error' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showToast({ title: 'Error sending emails', description: message, type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:border-primary/20 hover:shadow-sm">
        <CardContent className="p-3 py-1 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 flex items-center justify-center">
            <Link2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded border font-mono truncate">{fullUrl}</code>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {invite.usedCount} / {invite.usageLimit || '∞'}
              </span>
              {invite.expiresAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {new Date(invite.expiresAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEmailDialogOpen(true)}>
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Invitation Emails</DialogTitle>
            <DialogDescription>
              Enter email addresses separated by commas or new lines. Each recipient will receive an invitation email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Addresses</label>
              <Textarea
                placeholder="email1@example.com, email2@example.com&#10;email3@example.com"
                value={emailAddresses}
                onChange={(e) => setEmailAddresses(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Separate multiple emails with commas or new lines</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEmailDialogOpen(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleSendEmails} disabled={isSending || !emailAddresses.trim()}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Emails
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
