'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@clerk/nextjs';
import { Doc, Id } from '@/convex/_generated/dataModel';

type Order = Doc<'orders'>;
type OrganizationMember = Doc<'organizationMembers'>;
type Payment = Doc<'payments'>;
type Ticket = Doc<'tickets'>;

interface UserProfileProps {
  userId: Id<'users'>;
  organizationId?: Id<'organizations'>;
}

function formatCurrency(amount?: number, currency?: string) {
  if (typeof amount !== 'number') return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'PHP',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || 'PHP'} ${amount.toFixed(2)}`;
  }
}

export function UserProfile({ userId, organizationId }: UserProfileProps) {
  const uid = userId as Id<'users'>;
  const oid = organizationId as Id<'organizations'> | undefined;

  const { userId: clerkId } = useAuth();
  const viewer = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');
  const canViewSensitive = !!viewer && (viewer.isAdmin || viewer.isStaff || viewer._id === uid);

  const analytics = useQuery(api.users.queries.index.getUserAnalytics, uid ? { userId: uid } : 'skip');
  const organizations = useQuery(api.organizations.queries.index.getOrganizationsByUser, uid ? { userId: uid } : 'skip');

  // For org-scoped admins who are not system staff/admin, fetch member info for display
  const shouldLoadOrgMember = !!oid && !canViewSensitive;
  const orgMembers = useQuery(
    api.organizations.queries.index.getOrganizationMembers,
    shouldLoadOrgMember ? { organizationId: oid, isActive: true, limit: 200 } : 'skip'
  ) as unknown as { page?: OrganizationMember[] } | undefined;

  // Recent items (client filtered by org when provided)
  const shouldLoadOrders = !!uid;
  const ordersRes = useQuery(
    api.orders.queries.index.getOrders,
    shouldLoadOrders
      ? {
          customerId: uid,
          limit: 50,
          offset: 0,
        }
      : 'skip'
  ) as unknown as { orders?: Order[] } | undefined;

  const orders = useMemo(() => {
    const list = ordersRes?.orders || [];
    if (!oid) return list.slice(0, 10);
    return list.filter((o: Order) => o.organizationId === oid).slice(0, 10);
  }, [ordersRes, oid]);

  // Sensitive lists are rendered in a separate child component to keep hook order stable here

  const member = useMemo(() => {
    if (!shouldLoadOrgMember) return undefined;
    const list = orgMembers?.page || [];
    return list.find((m: OrganizationMember) => m.userId === uid);
  }, [shouldLoadOrgMember, orgMembers, uid]);

  const loading =
    analytics === undefined ||
    organizations === undefined ||
    (shouldLoadOrders && ordersRes === undefined) ||
    (shouldLoadOrgMember && orgMembers === undefined);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-secondary animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-secondary animate-pulse" />
                <div className="h-4 w-1/4 rounded bg-secondary animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {new Array(4).fill(null).map((_, i) => (
                <div key={i} className="h-10 rounded bg-secondary animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we can't view sensitive and no org membership fallback, show not found
  // Note: when sensitive is allowed, the header child will fetch the user data

  const displayFirstName = member?.userInfo?.firstName;
  const displayLastName = member?.userInfo?.lastName;
  const displayEmail = member?.userInfo?.email;
  const displayImageUrl = member?.userInfo?.imageUrl;

  const fullName = `${displayFirstName || ''} ${displayLastName || ''}`.trim();
  const initials = (displayFirstName?.[0] || '') + (displayLastName?.[0] || '');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">User profile</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {canViewSensitive ? (
            <SensitiveHeaderFull userId={uid} />
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={displayImageUrl || undefined} alt={fullName || displayEmail} />
                <AvatarFallback>{initials || displayEmail?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{fullName || '—'}</div>
                <div className="text-xs text-muted-foreground">{displayEmail}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Total orders</div>
              <div className="mt-1 text-xl font-semibold">{analytics?.totalOrders ?? 0}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Total spent</div>
              <div className="mt-1 text-xl font-semibold">{formatCurrency(analytics?.totalSpent || 0, 'PHP')}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Organizations</div>
              <div className="mt-1 text-xl font-semibold">{analytics?.organizationCount ?? (organizations?.length || 0)}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Reviews</div>
              <div className="mt-1 text-xl font-semibold">{analytics?.reviewCount ?? 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {canViewSensitive && viewer?.isAdmin && <SuperAdminOrgAccessManager targetUserId={uid} />}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Organizations</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {!organizations || organizations.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">No organizations.</div>
          ) : (
            <div className="space-y-1.5">
              {organizations.map((org) => (
                <div key={org._id} className="rounded border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{org.name}</div>
                      <div className="text-xs text-muted-foreground">/{org.slug}</div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <div>Role: {org.membershipInfo?.role || '—'}</div>
                      <div>Joined: {org.membershipInfo?.joinedAt ? new Date(org.membershipInfo.joinedAt).toLocaleDateString() : '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {orders.length === 0 ? (
              <div className="py-6 text-sm text-muted-foreground">No orders.</div>
            ) : (
              <div className="divide-y rounded border">
                {orders.map((o: Order) => (
                  <div key={o._id} className="px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">Order {o.orderNumber ? `#${o.orderNumber}` : String(o._id)}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {o.orderDate ? new Date(o.orderDate).toLocaleString() : new Date(o._creationTime).toLocaleString()} • {o.paymentStatus}
                        </div>
                      </div>
                      <Badge variant="outline">{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {canViewSensitive && <SensitivePayments userId={uid} organizationId={oid} />}
      </div>
      {canViewSensitive && <SensitiveTickets userId={uid} organizationId={oid} />}
    </div>
  );
}

function SensitiveHeaderFull({ userId }: { userId: Id<'users'> }) {
  const user = useQuery(api.users.queries.index.getUserById, { userId });
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const initials = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '');
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user?.imageUrl || undefined} alt={fullName || user?.email} />
        <AvatarFallback>{initials || user?.email?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{fullName || '—'}</div>
        <div className="text-xs text-muted-foreground">{user?.email}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
          {user?.isAdmin && <Badge variant="default">Admin</Badge>}
          {user?.isStaff && <Badge variant="secondary">Staff</Badge>}
          {user?.isMerchant && <Badge variant="outline">Merchant</Badge>}
          <span>Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
          <span>Last login: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '—'}</span>
        </div>
      </div>
    </div>
  );
}

function SuperAdminOrgAccessManager({ targetUserId }: { targetUserId: Id<'users'> }) {
  const [orgSearch, setOrgSearch] = useState('');
  const [roleByOrg, setRoleByOrg] = useState<Record<string, 'ADMIN' | 'STAFF' | 'MEMBER'>>({});
  const [openPermsForOrg, setOpenPermsForOrg] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState('');
  const [permCRUDE, setPermCRUDE] = useState({ canCreate: false, canRead: true, canUpdate: false, canDelete: false });

  const memberships = useQuery(api.organizations.queries.index.getOrganizationsByUser, { userId: targetUserId }) as unknown as Array<{
    _id: Id<'organizations'>;
    name: string;
    slug: string;
    membershipInfo?: {
      role?: 'ADMIN' | 'STAFF' | 'MEMBER';
      permissions?: Array<{ permissionCode: string; canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }>;
    };
  }>;

  const searchResults = useQuery(api.organizations.queries.index.getOrganizations, { search: orgSearch || undefined, limit: 25 }) as unknown as
    | { page?: Array<{ _id: Id<'organizations'>; name: string; slug: string }> }
    | undefined;

  const permissions = useQuery(api.permissions.queries.index.getPermissions, { isActive: true, cursor: undefined }) as unknown as
    | { page?: Array<{ _id: string; code: string; name: string }> }
    | undefined;

  const addMember = useMutation(api.organizations.mutations.index.addMember);
  const updateMemberRole = useMutation(api.organizations.mutations.index.updateMemberRole);
  const assignOrgPermission = useMutation(api.permissions.mutations.index.assignOrganizationPermission);
  const revokeOrgPermission = useMutation(api.permissions.mutations.index.revokeOrganizationPermission);

  async function handleAdd(organizationId: Id<'organizations'>) {
    const role = roleByOrg[String(organizationId)] || 'MEMBER';
    await addMember({ organizationId, userId: targetUserId, role });
  }

  async function handleUpdateRole(organizationId: Id<'organizations'>, nextRole: 'ADMIN' | 'STAFF' | 'MEMBER') {
    await updateMemberRole({ organizationId, userId: targetUserId, role: nextRole });
  }

  async function handleAssignPermission(organizationId: Id<'organizations'>) {
    if (!selectedCode) return;
    const { canCreate, canRead, canUpdate, canDelete } = permCRUDE;
    await assignOrgPermission({ organizationId, userId: targetUserId, permissionCode: selectedCode, canCreate, canRead, canUpdate, canDelete });
    setSelectedCode('');
  }

  async function handleRevokePermission(organizationId: Id<'organizations'>, permissionCode: string) {
    await revokeOrgPermission({ organizationId, userId: targetUserId, permissionCode });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Organization access</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="rounded border p-3">
          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Add to organization</div>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            placeholder="Search organization by name or slug"
            value={orgSearch}
            onChange={(e) => setOrgSearch(e.target.value)}
          />
          {!!orgSearch && (
            <div className="mt-2 divide-y rounded border">
              {(searchResults?.page || []).map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{o.name}</div>
                    <div className="text-xs text-muted-foreground">/{o.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={roleByOrg[String(o._id)] || 'MEMBER'}
                      onChange={(e) => setRoleByOrg((s) => ({ ...s, [String(o._id)]: e.target.value as 'ADMIN' | 'STAFF' | 'MEMBER' }))}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="STAFF">Staff</option>
                      <option value="MEMBER">Member</option>
                    </select>
                    <button className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground" onClick={() => handleAdd(o._id)}>
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded border">
          <div className="px-3 py-2 text-sm font-medium">Current memberships</div>
          <div className="divide-y">
            {(memberships || []).map((org) => (
              <div key={org._id} className="px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{org.name}</div>
                    <div className="text-xs text-muted-foreground">/{org.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={org.membershipInfo?.role || 'MEMBER'}
                      onChange={(e) => handleUpdateRole(org._id, e.target.value as 'ADMIN' | 'STAFF' | 'MEMBER')}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="STAFF">Staff</option>
                      <option value="MEMBER">Member</option>
                    </select>
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      onClick={() => setOpenPermsForOrg(openPermsForOrg === String(org._id) ? null : String(org._id))}
                    >
                      Permissions
                    </button>
                  </div>
                </div>
                {openPermsForOrg === String(org._id) && (
                  <div className="mt-2 space-y-2 rounded border bg-card p-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={selectedCode}
                        onChange={(e) => setSelectedCode(e.target.value)}
                      >
                        <option value="">Select permission…</option>
                        {(permissions?.page || []).map((p) => (
                          <option key={p._id} value={p.code}>
                            {p.code}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5"
                          checked={permCRUDE.canCreate}
                          onChange={(e) => setPermCRUDE((s) => ({ ...s, canCreate: e.target.checked }))}
                        />{' '}
                        Create
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5"
                          checked={permCRUDE.canRead}
                          onChange={(e) => setPermCRUDE((s) => ({ ...s, canRead: e.target.checked }))}
                        />{' '}
                        Read
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5"
                          checked={permCRUDE.canUpdate}
                          onChange={(e) => setPermCRUDE((s) => ({ ...s, canUpdate: e.target.checked }))}
                        />{' '}
                        Update
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5"
                          checked={permCRUDE.canDelete}
                          onChange={(e) => setPermCRUDE((s) => ({ ...s, canDelete: e.target.checked }))}
                        />{' '}
                        Delete
                      </label>
                      <button
                        className="rounded bg-primary px-2.5 py-1 text-xs text-primary-foreground"
                        onClick={() => handleAssignPermission(org._id)}
                        disabled={!selectedCode}
                      >
                        Assign
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground">Assigned:</div>
                    <div className="flex flex-wrap gap-1">
                      {(org.membershipInfo?.permissions || []).length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                      {(org.membershipInfo?.permissions || []).map((perm) => (
                        <span key={perm.permissionCode} className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[0.7rem]">
                          {perm.permissionCode}
                          <button
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleRevokePermission(org._id, perm.permissionCode)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(!memberships || memberships.length === 0) && <div className="px-3 py-4 text-xs text-muted-foreground">No memberships yet.</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SensitivePayments({ userId, organizationId }: { userId: Id<'users'>; organizationId?: Id<'organizations'> }) {
  const paymentsRes = useQuery(api.payments.queries.index.getPayments, { userId, offset: 0 }) as unknown as { payments?: Payment[] } | undefined;
  const payments = useMemo(() => {
    const list = (paymentsRes as { payments?: Payment[] })?.payments || (paymentsRes as { page?: Payment[] })?.page || [];
    if (!organizationId) return list.slice(0, 10);
    return list.filter((p: Payment) => p.organizationId === organizationId).slice(0, 10);
  }, [paymentsRes, organizationId]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent payments</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="py-6 text-sm text-muted-foreground">No payments.</div>
        ) : (
          <div className="divide-y rounded border">
            {payments.map((p: Payment) => (
              <div key={p._id} className="px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">Ref #{p.referenceNo || String(p._id)}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : new Date(p._creationTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-medium">{formatCurrency(p.amount, p.currency)}</div>
                    <div className="text-xs text-muted-foreground">{p.paymentStatus}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SensitiveTickets({ userId, organizationId }: { userId: Id<'users'>; organizationId?: Id<'organizations'> }) {
  const createdTicketsRes = useQuery(api.tickets.queries.index.getTickets, { createdById: userId, limit: 50, offset: 0 }) as unknown as
    | { tickets?: Ticket[] }
    | undefined;
  const assignedTicketsRes = useQuery(api.tickets.queries.index.getTickets, { assignedToId: userId, limit: 50, offset: 0 }) as unknown as
    | { tickets?: Ticket[] }
    | undefined;
  const createdTickets = useMemo(() => {
    const list = createdTicketsRes?.tickets || [];
    if (!organizationId) return list.slice(0, 10);
    return list.filter((t: Ticket) => t.organizationId === organizationId).slice(0, 10);
  }, [createdTicketsRes, organizationId]);
  const assignedTickets = useMemo(() => {
    const list = assignedTicketsRes?.tickets || [];
    if (!organizationId) return list.slice(0, 10);
    return list.filter((t: Ticket) => t.organizationId === organizationId).slice(0, 10);
  }, [assignedTicketsRes, organizationId]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {createdTickets.length === 0 && assignedTickets.length === 0 ? (
          <div className="py-6 text-sm text-muted-foreground">No tickets.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Created by user</div>
              <div className="divide-y rounded border">
                {createdTickets.slice(0, 10).map((t: Ticket) => (
                  <div key={t._id} className="px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{t.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {t.priority} • {t.updateCount} updates
                        </div>
                      </div>
                      <Badge variant="outline">{t.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Assigned to user</div>
              <div className="divide-y rounded border">
                {assignedTickets.slice(0, 10).map((t: Ticket) => (
                  <div key={t._id} className="px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{t.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {t.priority} • {t.updateCount} updates
                        </div>
                      </div>
                      <Badge variant="outline">{t.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <Separator className="my-4" />
        <div className="text-xs text-muted-foreground">Showing up to 10 recent items per list.</div>
      </CardContent>
    </Card>
  );
}
