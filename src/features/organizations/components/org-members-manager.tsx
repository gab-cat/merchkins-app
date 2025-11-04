'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@clerk/nextjs';

interface Props {
  organizationId: Id<'organizations'>;
}

export function OrgMembersManager({ organizationId }: Props) {
  const { userId: clerkId } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'invites' | 'requests'>('members');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF' | 'MEMBER'>('ALL');
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

  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : ('skip' as unknown as { clerkId: string }));

  const inviteLinks = useQuery(
    api.organizations.queries.index.getOrganizationInviteLinks,
    activeTab === 'invites' ? { organizationId, isActive: true } : ('skip' as unknown as { organizationId: Id<'organizations'>; isActive: boolean })
  );

  const joinRequests = useQuery(
    api.organizations.queries.index.listJoinRequests,
    activeTab === 'requests'
      ? { organizationId, status: 'PENDING' }
      : ('skip' as unknown as { organizationId: Id<'organizations'>; status: 'PENDING' })
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

  function toggleSelect(userId: string) {
    setSelected((prev) => ({ ...prev, [userId]: !prev[userId] }));
  }

  function toggleSelectAll() {
    if (items.length === 0) return;
    const allSelected = items.every((m) => selected[m.userId]);
    const next: Record<string, boolean> = {};
    for (const m of items) next[m.userId] = !allSelected;
    setSelected(next);
  }

  async function handleRoleChange(memberId: Id<'users'>, nextRole: 'ADMIN' | 'STAFF' | 'MEMBER') {
    await updateRole({ organizationId, userId: memberId, role: nextRole });
  }

  async function handleRemove(memberId: Id<'users'>) {
    await removeMember({ organizationId, userId: memberId });
  }

  async function handleAssignPermissions() {
    const targetUserIds = Object.keys(selected).filter((k) => selected[k]) as Array<Id<'users'>>;
    const codes = Object.keys(selectedPermissionCodes).filter((k) => selectedPermissionCodes[k]);
    if (targetUserIds.length === 0 || codes.length === 0) return;
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
    setAssignOpen(false);
    setSelected({});
    setSelectedPermissionCodes({});
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
    } finally {
      setCreatingInvite(false);
    }
  }

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={'rounded px-3 py-1.5 text-sm ' + (activeTab === 'members' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button
          type="button"
          className={'rounded px-3 py-1.5 text-sm ' + (activeTab === 'invites' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}
          onClick={() => setActiveTab('invites')}
        >
          Invites
        </button>
        <button
          type="button"
          className={'rounded px-3 py-1.5 text-sm ' + (activeTab === 'requests' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
      </div>

      {activeTab === 'members' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm">Filter by role</label>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'STAFF' | 'MEMBER')}
            >
              <option value="ALL">All</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="MEMBER">Member</option>
            </select>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                Select all
              </Button>
              <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={selectedCount === 0}>
                    Assign permissions ({selectedCount})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign permissions</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-64 overflow-auto rounded border p-2">
                    {permissionItems.length === 0 && <div className="text-sm text-muted-foreground">No permissions found.</div>}
                    <ul className="space-y-1">
                      {permissionItems.map((p) => (
                        <li key={p._id} className="flex items-center gap-2">
                          <input
                            id={`perm-${p.code}`}
                            type="checkbox"
                            className="h-4 w-4"
                            checked={!!selectedPermissionCodes[p.code]}
                            onChange={() => setSelectedPermissionCodes((prev) => ({ ...prev, [p.code]: !prev[p.code] }))}
                          />
                          <label htmlFor={`perm-${p.code}`} className="text-sm">
                            <span className="font-medium">{p.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{p.code}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-medium">Access</label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={permCRUDE.canCreate}
                        onChange={(e) => setPermCRUDE((s) => ({ ...s, canCreate: e.target.checked }))}
                      />{' '}
                      Create
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={permCRUDE.canRead}
                        onChange={(e) => setPermCRUDE((s) => ({ ...s, canRead: e.target.checked }))}
                      />{' '}
                      Read
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={permCRUDE.canUpdate}
                        onChange={(e) => setPermCRUDE((s) => ({ ...s, canUpdate: e.target.checked }))}
                      />{' '}
                      Update
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={permCRUDE.canDelete}
                        onChange={(e) => setPermCRUDE((s) => ({ ...s, canDelete: e.target.checked }))}
                      />{' '}
                      Delete
                    </label>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAssignPermissions} disabled={Object.values(selectedPermissionCodes).every((v) => !v)}>
                      Assign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Separator />

          <div className="divide-y rounded border">
            {items.map((m) => (
              <div key={m._id} className="flex items-center justify-between gap-4 px-3 py-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    aria-label="Select member"
                    checked={!!selected[m.userId]}
                    onChange={() => toggleSelect(m.userId)}
                  />
                  <MemberAvatar imageUrl={m.userInfo?.imageUrl} firstName={m.userInfo?.firstName} lastName={m.userInfo?.lastName} />
                  <div>
                    <Link
                      href={`/admin/org-members/${m.userId}${organization?.slug ? `?org=${organization.slug}` : ''}`}
                      className="font-medium hover:underline"
                    >
                      {[m.userInfo?.firstName, m.userInfo?.lastName].filter(Boolean).join(' ') || m.userInfo?.email}
                    </Link>
                    <div className="text-xs text-muted-foreground">{m.userInfo?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.userId, e.target.value as 'ADMIN' | 'STAFF' | 'MEMBER')}
                    aria-label="Change role"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="MEMBER">Member</option>
                  </select>
                  <Button size="sm" variant="destructive" onClick={() => handleRemove(m.userId)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="px-3 py-6 text-sm text-muted-foreground">No members found.</div>}
          </div>
        </>
      )}

      {activeTab === 'invites' && (
        <div className="space-y-4">
          <div className="rounded border p-3">
            <div className="mb-2 text-sm font-medium">Generate invite link</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Expires in (days)</label>
                <Input value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} placeholder="e.g. 7" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Usage limit</label>
                <Input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="e.g. 10" />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={handleCreateInvite} disabled={!currentUser || creatingInvite}>
                  {creatingInvite ? 'Creating...' : 'Create invite'}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded border">
            <div className="px-3 py-2 text-sm font-medium">Active invite links</div>
            <Separator />
            <div className="divide-y">
              {(inviteLinks || []).map((inv: InviteLink) => (
                <div key={inv._id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-mono">Code: {inv.code}</div>
                    <div className="text-xs text-muted-foreground">
                      Uses: {inv.usedCount}/{inv.usageLimit || '∞'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(inv.code)}>
                      Copy code
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deactivateInvite({ inviteLinkId: inv._id })}>
                      Deactivate
                    </Button>
                  </div>
                </div>
              ))}
              {(!inviteLinks || inviteLinks.length === 0) && <div className="px-3 py-6 text-sm text-muted-foreground">No active invites.</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="rounded border">
            <div className="px-3 py-2 text-sm font-medium">Pending join requests</div>
            <Separator />
            <div className="divide-y">
              {joinRequests?.page?.map((req: { _id: Id<'organizationJoinRequests'>; userId: string; createdAt: number; note?: string }) => (
                <div key={req._id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium">{req.userId}</div>
                    <div className="text-xs text-muted-foreground">Requested {new Date(req.createdAt).toLocaleString()}</div>
                    {req.note && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{req.note}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => reviewJoinRequest({ organizationId, requestId: req._id, approve: false })}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => reviewJoinRequest({ organizationId, requestId: req._id, approve: true })}>
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
              {(!joinRequests || joinRequests.page?.length === 0) && (
                <div className="px-3 py-6 text-sm text-muted-foreground">No pending requests.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberAvatar({ imageUrl, firstName, lastName }: { imageUrl?: string; firstName?: string; lastName?: string }) {
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');
  const url = useQuery(api.files.queries.index.getFileUrl, isKey(imageUrl) ? { key: imageUrl as string } : ('skip' as unknown as { key: string }));
  const displayUrl = url || imageUrl;
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('') || 'U';
  return displayUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={displayUrl} alt="Avatar" className="h-9 w-9 rounded-full object-cover" />
  ) : (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">{initials}</div>
  );
}
