'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@clerk/nextjs';
import {
  Building2,
  Plus,
  Search,
  Globe,
  Lock,
  EyeOff,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Link as LinkIcon,
  Shield,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MessageSquare,
  Eye,
  EyeOffIcon,
} from 'lucide-react';
import { PageHeader, StatusBadge, EmptyState } from '@/src/components/admin';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Id } from '@/convex/_generated/dataModel';

interface Organization {
  _id: string;
  name: string;
  slug: string;
  organizationType: 'PUBLIC' | 'PRIVATE' | 'SECRET';
  memberCount: number;
}
function OrganizationTypeIcon({ type }: { type: 'PUBLIC' | 'PRIVATE' | 'SECRET' }) {
  switch (type) {
    case 'PUBLIC':
      return <Globe className="h-4 w-4 text-emerald-500" />;
    case 'PRIVATE':
      return <Lock className="h-4 w-4 text-blue-500" />;
    case 'SECRET':
      return <EyeOff className="h-4 w-4 text-amber-500" />;
  }
}

export default function SuperAdminOrganizationsPage() {
  const { userId: clerkId } = useAuth();
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');
  const [search, setSearch] = useState('');
  const [orgType, setOrgType] = useState<undefined | 'PUBLIC' | 'PRIVATE' | 'SECRET'>(undefined);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Chatwoot config dialog state
  const [chatwootDialogOpen, setChatwootDialogOpen] = useState(false);
  const [chatwootOrgId, setChatwootOrgId] = useState<string | null>(null);
  const [chatwootWebsiteToken, setChatwootWebsiteToken] = useState('');
  const [chatwootIdentityToken, setChatwootIdentityToken] = useState('');
  const [showWebsiteToken, setShowWebsiteToken] = useState(false);
  const [showIdentityToken, setShowIdentityToken] = useState(false);
  const [savingChatwoot, setSavingChatwoot] = useState(false);

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
  const updateChatwootConfig = useMutation(api.organizations.mutations.index.updateChatwootConfig);

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
  const [newOrgType, setNewOrgType] = useState<'PUBLIC' | 'PRIVATE' | 'SECRET'>('PUBLIC');
  const canSubmit = useMemo(() => name.trim().length >= 2 && slug.trim().length >= 2, [name, slug]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await createOrganization({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim() || undefined,
      organizationType: newOrgType,
    });
    setName('');
    setSlug('');
    setDescription('');
    setNewOrgType('PUBLIC');
    setCreateDialogOpen(false);
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

  async function handleCopyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function handleDelete(organizationId: string) {
    if (!confirm('Are you sure you want to delete this organization?')) return;
    await deleteOrganization({ organizationId: organizationId as unknown as Id<'organizations'> });
  }

  async function handleRename(organizationId: string) {
    const newName = prompt('New organization name?');
    if (!newName) return;
    await updateOrganization({ organizationId: organizationId as unknown as Id<'organizations'>, name: newName });
  }

  function handleOpenChatwootDialog(orgId: string) {
    setChatwootOrgId(orgId);
    // Reset form - tokens would be fetched if we had a query, but for simplicity we start empty
    setChatwootWebsiteToken('');
    setChatwootIdentityToken('');
    setShowWebsiteToken(false);
    setShowIdentityToken(false);
    setChatwootDialogOpen(true);
  }

  async function handleSaveChatwootConfig() {
    if (!chatwootOrgId) return;
    setSavingChatwoot(true);
    try {
      await updateChatwootConfig({
        organizationId: chatwootOrgId as unknown as Id<'organizations'>,
        chatwootWebsiteToken: chatwootWebsiteToken.trim() || undefined,
        chatwootIdentityToken: chatwootIdentityToken.trim() || undefined,
      });
      setChatwootDialogOpen(false);
    } finally {
      setSavingChatwoot(false);
    }
  }

  const loading = organizations === undefined;

  // Stats
  const stats = useMemo(() => {
    const orgs = (organizations?.page || []) as Organization[];
    return {
      total: orgs.length,
      public: orgs.filter((o: Organization) => o.organizationType === 'PUBLIC').length,
      private: orgs.filter((o: Organization) => o.organizationType === 'PRIVATE').length,
      secret: orgs.filter((o: Organization) => o.organizationType === 'SECRET').length,
    };
  }, [organizations]);

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Organizations"
        description="Manage all platform organizations"
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Organization</DialogTitle>
                  <DialogDescription>Add a new organization to the platform</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="org-name">Name</Label>
                    <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="org-slug">Slug</Label>
                    <Input id="org-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="acme" />
                    <p className="text-xs text-muted-foreground">URL: /o/{slug || 'slug'}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="org-type">Type</Label>
                    <Select value={newOrgType} onValueChange={(v) => setNewOrgType(v as typeof newOrgType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="PRIVATE">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Private
                          </div>
                        </SelectItem>
                        <SelectItem value="SECRET">
                          <div className="flex items-center gap-2">
                            <EyeOff className="h-4 w-4" />
                            Secret
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="org-desc">Description</Label>
                    <Textarea
                      id="org-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Organization description..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!canSubmit}>
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, icon: Building2, color: 'text-primary' },
          { label: 'Public', value: stats.public, icon: Globe, color: 'text-emerald-500' },
          { label: 'Private', value: stats.private, icon: Lock, color: 'text-blue-500' },
          { label: 'Secret', value: stats.secret, icon: EyeOff, color: 'text-amber-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border bg-card p-3"
          >
            <div className="flex items-center gap-2">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold font-admin-heading mt-1">{loading ? '—' : stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search organizations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={orgType || 'ALL'} onValueChange={(v) => setOrgType(v === 'ALL' ? undefined : (v as typeof orgType))}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value="PUBLIC">Public</SelectItem>
            <SelectItem value="PRIVATE">Private</SelectItem>
            <SelectItem value="SECRET">Secret</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Organizations List */}
      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <div className="col-span-5">Organization</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Members</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 border-b last:border-b-0">
                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : organizations?.page?.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
            title="No organizations found"
            description={search ? 'Try adjusting your search filters' : 'Create your first organization to get started'}
            action={{ label: 'Create Organization', onClick: () => setCreateDialogOpen(true) }}
          />
        ) : (
          <div>
            {(organizations?.page as Organization[])?.map((org: Organization, index: number) => (
              <motion.div key={org._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}>
                <div className="px-4 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <div className="grid md:grid-cols-12 gap-4 items-center">
                    {/* Org Info */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                          org.organizationType === 'PUBLIC' && 'bg-emerald-500/10',
                          org.organizationType === 'PRIVATE' && 'bg-blue-500/10',
                          org.organizationType === 'SECRET' && 'bg-amber-500/10'
                        )}
                      >
                        <OrganizationTypeIcon type={org.organizationType} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm truncate">{org.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono">/{org.slug}</p>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      <StatusBadge status={org.organizationType.toLowerCase()} />
                    </div>

                    {/* Members */}
                    <div className="col-span-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{org.memberCount}</span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      {inviteCodes[org._id] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs font-mono"
                        >
                          <span>{inviteCodes[org._id]}</span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleCopyCode(inviteCodes[org._id])}>
                            {copiedCode === inviteCodes[org._id] ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </motion.div>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => setOpenPermsForOrg((prev) => (prev === org._id ? null : org._id))}
                      >
                        {openPermsForOrg === org._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleInvite(org._id)}>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Generate Invite
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRename(org._id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenChatwootDialog(org._id)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chatwoot Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(org._id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Expanded Permissions Panel */}
                  <AnimatePresence>
                    {openPermsForOrg === org._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-medium">Add Admin or Assign Permissions</h4>
                        </div>
                        <div className="relative max-w-md">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search user by name or email..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>

                        {!!userResults && userSearch.trim().length >= 2 && (
                          <div className="mt-3 space-y-2">
                            {userResults.map((u) => (
                              <motion.div
                                key={u._id}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between rounded-lg border bg-card p-3"
                              >
                                <div>
                                  <div className="font-medium text-sm">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</div>
                                  <div className="text-xs text-muted-foreground">{u.email}</div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      await addMember({
                                        organizationId: org._id as unknown as Id<'organizations'>,
                                        userId: u._id as unknown as Id<'users'>,
                                        role: 'ADMIN',
                                      });
                                    }}
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Add as Admin
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
                                    Grant Logs
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      revokeOrganizationPermission({
                                        organizationId: org._id as unknown as Id<'organizations'>,
                                        userId: u._id as unknown as Id<'users'>,
                                        permissionCode: 'MANAGE_LOGS',
                                      })
                                    }
                                  >
                                    Revoke
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Chatwoot Config Dialog */}
      <Dialog open={chatwootDialogOpen} onOpenChange={setChatwootDialogOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chatwoot Settings
            </DialogTitle>
            <DialogDescription>Configure Chatwoot integration tokens for this organization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="website-token">Website Token</Label>
              <div className="relative">
                <Input
                  id="website-token"
                  type={showWebsiteToken ? 'text' : 'password'}
                  value={chatwootWebsiteToken}
                  onChange={(e) => setChatwootWebsiteToken(e.target.value)}
                  placeholder="Enter website token..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowWebsiteToken(!showWebsiteToken)}
                >
                  {showWebsiteToken ? <EyeOffIcon className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">The website token for Chatwoot widget integration.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="identity-token">Identity Validation Token</Label>
              <div className="relative">
                <Input
                  id="identity-token"
                  type={showIdentityToken ? 'text' : 'password'}
                  value={chatwootIdentityToken}
                  onChange={(e) => setChatwootIdentityToken(e.target.value)}
                  placeholder="Enter identity token..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowIdentityToken(!showIdentityToken)}
                >
                  {showIdentityToken ? <EyeOffIcon className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Used for HMAC identity verification (optional).</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChatwootDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChatwootConfig} disabled={savingChatwoot}>
              {savingChatwoot ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
