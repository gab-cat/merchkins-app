'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Id } from '@/convex/_generated/dataModel';

export default function SuperAdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | 'staff' | 'admin' | 'merchant'>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // When searching, use searchUsers; otherwise load paginated users
  const searchedUsers = useQuery(
    api.users.queries.index.searchUsers,
    search.trim().length >= 2
      ? {
          searchTerm: search.trim(),
          limit: 100,
          roleFilter: roleFilter || undefined,
        }
      : 'skip'
  );
  const pagedUsers = useQuery(
    api.users.queries.index.getUsers,
    search.trim().length < 2
      ? {
          limit: 100,
          isStaff: roleFilter === 'staff' ? true : undefined,
          isAdmin: roleFilter === 'admin' ? true : undefined,
          isMerchant: roleFilter === 'merchant' ? true : undefined,
        }
      : 'skip'
  );
  const usersList = Array.isArray(searchedUsers) ? searchedUsers : pagedUsers?.page || [];

  const selectedUser = useQuery(api.users.queries.index.getUserById, selectedUserId ? { userId: selectedUserId as unknown as Id<'users'> } : 'skip');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input placeholder="Search users" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as '' | 'staff' | 'admin' | 'merchant')}
            >
              <option value="">All</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="merchant">Merchant</option>
            </select>
          </div>
          <div className="rounded border">
            <div className="grid grid-cols-12 border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <div className="col-span-4">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-4">Roles</div>
            </div>
            <div>
              {usersList?.map((u) => (
                <div
                  key={u._id}
                  className={`grid grid-cols-12 items-center px-3 py-2 hover:bg-secondary ${selectedUserId === u._id ? 'bg-secondary' : ''}`}
                  onClick={() => setSelectedUserId(u._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedUserId(u._id);
                  }}
                  data-testid={`user-row-${u._id}`}
                >
                  <div className="col-span-4 text-sm">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</div>
                  <div className="col-span-4 text-xs text-muted-foreground">{u.email}</div>
                  <div className="col-span-4 flex items-center gap-2 text-xs">
                    <div className="truncate">
                      {[u.isAdmin && 'Admin', u.isStaff && 'Staff', u.isMerchant && 'Merchant'].filter(Boolean).join(', ') || '—'}
                    </div>
                    <div className="ml-auto">
                      <Link href={`/super-admin/users/${u._id}`}>
                        <Button size="sm" variant="secondary">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {selectedUser && (
            <div className="mt-6 rounded border p-4">
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">User details</div>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Name:</span>{' '}
                  {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span> {selectedUser.email}
                </div>
                <div>
                  <span className="text-muted-foreground">Roles:</span>{' '}
                  {[selectedUser.isAdmin && 'Admin', selectedUser.isStaff && 'Staff', selectedUser.isMerchant && 'Merchant']
                    .filter(Boolean)
                    .join(', ') || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Last login:</span>{' '}
                  {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Total orders:</span> {selectedUser.totalOrders ?? 0}
                </div>
                <div>
                  <span className="text-muted-foreground">Total spent:</span> ${selectedUser.totalSpent?.toFixed?.(2) ?? '0.00'}
                </div>
              </div>
              {!!selectedUser.organizationMemberships?.length && (
                <div className="mt-4">
                  <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Organizations</div>
                  <div className="space-y-1 text-xs">
                    {selectedUser.organizationMemberships.map((m) => (
                      <div key={`${m.organizationId}`}>
                        /{m.organizationSlug} – {m.role} {m.isActive ? '' : '(inactive)'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
