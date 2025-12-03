'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, Shield, ShieldCheck, Store, User, Mail, Calendar, ShoppingBag, DollarSign, Building2, ExternalLink, X } from 'lucide-react';
import { PageHeader, StatusBadge, EmptyState } from '@/src/components/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Id } from '@/convex/_generated/dataModel';

function RoleBadge({ role }: { role: 'admin' | 'staff' | 'merchant' | 'user' }) {
  const config = {
    admin: { icon: ShieldCheck, color: 'bg-purple-500/10 text-purple-700', label: 'Admin' },
    staff: { icon: Shield, color: 'bg-blue-500/10 text-blue-700', label: 'Staff' },
    merchant: { icon: Store, color: 'bg-emerald-500/10 text-emerald-700', label: 'Merchant' },
    user: { icon: User, color: 'bg-muted text-muted-foreground', label: 'User' },
  };
  const { icon: Icon, color, label } = config[role];

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', color)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

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
  const loading = searchedUsers === undefined && pagedUsers === undefined;

  const selectedUser = useQuery(api.users.queries.index.getUserById, selectedUserId ? { userId: selectedUserId as unknown as Id<'users'> } : 'skip');

  // Stats
  const stats = useMemo(
    () => ({
      total: usersList.length,
      admins: usersList.filter((u) => u.isAdmin).length,
      staff: usersList.filter((u) => u.isStaff).length,
      merchants: usersList.filter((u) => u.isMerchant).length,
    }),
    [usersList]
  );

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader title="Users" description="Manage all platform users and their roles" icon={<Users className="h-5 w-5" />} />

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-primary' },
          { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'text-purple-500' },
          { label: 'Staff', value: stats.staff, icon: Shield, color: 'text-blue-500' },
          { label: 'Merchants', value: stats.merchants, icon: Store, color: 'text-emerald-500' },
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

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Users List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={roleFilter || 'ALL'} onValueChange={(v) => setRoleFilter(v === 'ALL' ? '' : (v as typeof roleFilter))}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="merchant">Merchants</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-xl border overflow-hidden">
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : usersList.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12 text-muted-foreground" />}
                title="No users found"
                description={search ? 'Try adjusting your search filters' : 'No users match the current filters'}
              />
            ) : (
              <div>
                {usersList.map((u, index) => {
                  const isSelected = selectedUserId === u._id;
                  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—';
                  const roles = [u.isAdmin && 'admin', u.isStaff && 'staff', u.isMerchant && 'merchant'].filter(Boolean) as (
                    | 'admin'
                    | 'staff'
                    | 'merchant'
                  )[];

                  return (
                    <motion.div
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedUserId(isSelected ? null : u._id)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer transition-colors',
                        isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.imageUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(u.firstName, u.lastName, u.email)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{fullName}</h4>
                          {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                        {roles.length > 0 ? roles.map((role) => <RoleBadge key={role} role={role} />) : <RoleBadge role="user" />}
                      </div>

                      <Link href={`/super-admin/users/${u._id}`} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* User Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div
                key={selectedUser._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="rounded-xl border bg-card sticky top-4"
              >
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedUser.imageUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(selectedUser.firstName, selectedUser.lastName, selectedUser.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold font-admin-heading">
                          {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || '—'}
                        </h3>
                        <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedUserId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedUser.isAdmin && <RoleBadge role="admin" />}
                    {selectedUser.isStaff && <RoleBadge role="staff" />}
                    {selectedUser.isMerchant && <RoleBadge role="merchant" />}
                    {!selectedUser.isAdmin && !selectedUser.isStaff && !selectedUser.isMerchant && <RoleBadge role="user" />}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Orders</span>
                      </div>
                      <p className="text-lg font-bold font-admin-heading">{selectedUser.totalOrders ?? 0}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Spent</span>
                      </div>
                      <p className="text-lg font-bold font-admin-heading">₱{(selectedUser.totalSpent ?? 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last login:</span>
                      <span>{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>

                  {!!selectedUser.organizationMemberships?.length && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        Organizations
                      </h4>
                      <div className="space-y-2">
                        {selectedUser.organizationMemberships.map((m) => (
                          <div key={`${m.organizationId}`} className="flex items-center justify-between rounded-lg border p-2 text-xs">
                            <span className="font-mono">/{m.organizationSlug}</span>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={m.role.toLowerCase()} />
                              {!m.isActive && <span className="text-muted-foreground">(inactive)</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href={`/super-admin/users/${selectedUser._id}`}>
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card p-8 text-center sticky top-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Select a user</h3>
                <p className="text-sm text-muted-foreground">Click on a user to view their details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
