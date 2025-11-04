'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@clerk/nextjs';
import type { Id } from '@/convex/_generated/dataModel';

export default function SuperAdminOrganizationsPage() {
  const { userId: clerkId } = useAuth();
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');
  const [search, setSearch] = useState('');
  const [orgType, setOrgType] = useState<undefined | 'PUBLIC' | 'PRIVATE' | 'SECRET'>(undefined);

  const organizations = useQuery(api.organizations.queries.index.getOrganizations, {
    search: search || undefined,
    organizationType: orgType,
    limit: 100,
  });

  const createOrganization = useMutation(api.organizations.mutations.index.createOrganization);
  const createInviteLink = useMutation(api.organizations.mutations.index.createInviteLink);
  const deleteOrganization = useMutation(api.organizations.mutations.index.deleteOrganization);
  const updateOrganization = useMutation(api.organizations.mutations.index.updateOrganization);
  const assignOrganizationPermission = useMutation(api.permissions.mutations.index.assignOrganizationPermission);
  const revokeOrganizationPermission = useMutation(api.permissions.mutations.index.revokeOrganizationPermission);
  const addMember = useMutation(api.organizations.mutations.index.addMember);

  const [inviteCodes, setInviteCodes] = useState<Record<string, string>>({});
  const [openPermsForOrg, setOpenPermsForOrg] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const userResults = useQuery(
    api.users.queries.index.searchUsers,
    userSearch.trim().length >= 2 ? { searchTerm: userSearch.trim(), limit: 5 } : 'skip'
  );

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const canSubmit = useMemo(() => name.trim().length >= 2 && slug.trim().length >= 2, [name, slug]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await createOrganization({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim() || undefined,
      organizationType: 'PUBLIC',
    });
    setName('');
    setSlug('');
    setDescription('');
  }

  async function handleInvite(organizationId: string) {
    if (!currentUser?._id) return;
    const res = await createInviteLink({
      organizationId: organizationId as unknown as Id<'organizations'>,
      createdById: currentUser._id,
    });
    if (res && 'code' in res) {
      const { code } = res as { code: string };
      setInviteCodes((prev) => ({ ...prev, [organizationId]: code }));
    }
  }

  async function handleDelete(organizationId: string) {
    await deleteOrganization({ organizationId: organizationId as unknown as Id<'organizations'> });
  }

  async function handleRename(organizationId: string) {
    const newName = prompt('New organization name?');
    if (!newName) return;
    await updateOrganization({ organizationId: organizationId as unknown as Id<'organizations'>, name: newName });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input placeholder="Search organizations" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={orgType || ''}
              onChange={(e) => {
                const value = e.target.value as '' | 'PUBLIC' | 'PRIVATE' | 'SECRET';
                setOrgType(value === '' ? undefined : value);
              }}
            >
              <option value="">All types</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="SECRET">Secret</option>
            </select>
          </div>
          <div className="rounded border">
            <div className="grid grid-cols-12 border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Slug</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2 text-right">Members</div>
            </div>
            <div>
              {organizations?.page?.map(
                (org: { _id: string; name: string; slug: string; organizationType: 'PUBLIC' | 'PRIVATE' | 'SECRET'; memberCount: number }) => (
                  <div key={org._id}>
                    <div className="grid grid-cols-12 items-center px-3 py-2 hover:bg-secondary">
                      <div className="col-span-5 font-medium">{org.name}</div>
                      <div className="col-span-3 text-xs text-muted-foreground">/{org.slug}</div>
                      <div className="col-span-2 text-xs">{org.organizationType}</div>
                      <div className="col-span-2 flex items-center justify-end gap-2 text-xs">
                        {inviteCodes[org._id] && <span className="rounded bg-muted px-2 py-0.5 font-mono">{inviteCodes[org._id]}</span>}
                        <Button size="sm" variant="outline" onClick={() => handleInvite(org._id)}>
                          Invite
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRename(org._id)}>
                          Rename
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(org._id)}>
                          Delete
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setOpenPermsForOrg((prev) => (prev === org._id ? null : org._id))}>
                          Permissions
                        </Button>
                      </div>
                    </div>
                    {openPermsForOrg === org._id && (
                      <div className="px-3 py-3">
                        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Add admin or assign permission</div>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                          <Input placeholder="Search user by name or email" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                        </div>
                        {!!userResults && userSearch.trim().length >= 2 && (
                          <div className="mt-2 space-y-1">
                            {userResults.map((u) => (
                              <div key={u._id} className="flex items-center justify-between rounded border bg-card px-3 py-2 text-xs">
                                <div>
                                  <div className="font-medium">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</div>
                                  <div className="text-muted-foreground">{u.email}</div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={async () => {
                                      await addMember({
                                        organizationId: org._id as unknown as Id<'organizations'>,
                                        userId: u._id as unknown as Id<'users'>,
                                        role: 'ADMIN',
                                      });
                                    }}
                                  >
                                    Add as ADMIN
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      assignOrganizationPermission({
                                        organizationId: org._id as unknown as Id<'organizations'>,
                                        userId: u._id as unknown as Id<'users'>,
                                        permissionCode: 'MANAGE_LOGS',
                                        canCreate: true,
                                        canRead: true,
                                        canUpdate: true,
                                        canDelete: false,
                                      })
                                    }
                                  >
                                    Grant MANAGE_LOGS
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      revokeOrganizationPermission({
                                        organizationId: org._id as unknown as Id<'organizations'>,
                                        userId: u._id as unknown as Id<'users'>,
                                        permissionCode: 'MANAGE_LOGS',
                                      })
                                    }
                                  >
                                    Revoke MANAGE_LOGS
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="org-name">
                Name
              </label>
              <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="org-slug">
                Slug
              </label>
              <Input id="org-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="acme" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="org-desc">
                Description
              </label>
              <textarea
                id="org-desc"
                className="h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Separator />
            <div>
              <Button type="submit" disabled={!canSubmit}>
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
