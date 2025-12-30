'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/nextjs';
import { PageHeader, StatusBadge, EmptyState } from '@/src/components/admin';
import { ScrollText, Search, Check, X, MoreHorizontal, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SuperAdminApplicationsPage() {
  useAuth();
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Action dialog state
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'APPROVE' | 'REJECT' | null;
    appId: Id<'storefrontApplications'> | null;
    notes: string;
  }>({
    open: false,
    type: null,
    appId: null,
    notes: '',
  });

  const applications = useQuery(api.storefrontApplications.queries.index.listApplications, {
    status: statusFilter,
    limit: 100,
  });

  const updateStatus = useMutation(api.storefrontApplications.mutations.index.updateApplicationStatus);

  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    if (!search) return applications;

    const term = search.toLowerCase();
    return applications.filter(
      (app) => app.businessName.toLowerCase().includes(term) || app.contactName.toLowerCase().includes(term) || app.email.toLowerCase().includes(term)
    );
  }, [applications, search]);

  const stats = useMemo(() => {
    const apps = applications || [];
    return {
      total: apps.length,
      pending: apps.filter((a) => a.status === 'PENDING').length,
      approved: apps.filter((a) => a.status === 'APPROVED').length,
      rejected: apps.filter((a) => a.status === 'REJECTED').length,
    };
  }, [applications]);

  const handleAction = async () => {
    if (!actionDialog.appId || !actionDialog.type) return;

    try {
      await updateStatus({
        applicationId: actionDialog.appId,
        status: actionDialog.type === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        notes: actionDialog.notes || undefined,
      });
      toast.success(`Application ${actionDialog.type === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
      setActionDialog({ open: false, type: null, appId: null, notes: '' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to update application status');
    }
  };

  const openActionDialog = (appId: Id<'storefrontApplications'>, type: 'APPROVE' | 'REJECT') => {
    setActionDialog({
      open: true,
      type,
      appId,
      notes: '',
    });
  };

  const loading = applications === undefined;

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Storefront Applications"
        description="Review and manage incoming storefront requests"
        icon={<ScrollText className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-primary' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-500' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-500' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border bg-card p-3"
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={cn('text-2xl font-bold font-admin-heading', loading && 'animate-pulse bg-muted rounded h-8 w-16 text-transparent')}>
              {loading ? '—' : stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by business, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status === 'ALL' ? undefined : status);
                setSearch(''); // Clear search on filter change for clarity, or keep it
              }}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                (status === 'ALL' && !statusFilter) || statusFilter === status
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              )}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="rounded-xl border overflow-hidden bg-card">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <div className="col-span-4">Business Info</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

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
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-12 w-12 text-muted-foreground" />}
            title="No applications found"
            description={search || statusFilter ? 'Try adjusting your filters' : 'No applications have been submitted yet'}
          />
        ) : (
          <div>
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className={cn('border-b last:border-b-0 hover:bg-muted/30 transition-colors', expandedId === app._id && 'bg-muted/30')}
              >
                <div
                  className="px-4 py-3 grid md:grid-cols-12 gap-4 items-center cursor-pointer"
                  onClick={() => setExpandedId(expandedId === app._id ? null : app._id)}
                >
                  {/* Business Info */}
                  <div className="col-span-4 min-w-0">
                    <h4 className="font-medium text-sm truncate">{app.businessName}</h4>
                    <p className="text-xs text-muted-foreground truncate">{app.description || 'No description provided'}</p>
                  </div>

                  {/* Contact */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm truncate">{app.contactName}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.email}</p>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {new Date(app.createdAt).toLocaleDateString()}
                    <div className="text-[10px] opacity-70">{new Date(app.createdAt).toLocaleTimeString()}</div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <StatusBadge status={app.status.toLowerCase()} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setExpandedId(app._id)}>
                          {expandedId === app._id ? 'Collapse Details' : 'View Details'}
                        </DropdownMenuItem>
                        {app.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionDialog(app._id, 'APPROVE');
                              }}
                              className="text-emerald-600 focus:text-emerald-700"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionDialog(app._id, 'REJECT');
                              }}
                              className="text-red-600 focus:text-red-700"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === app._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-muted/20"
                    >
                      <div className="p-4 border-t grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-3">
                          <h5 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Description</h5>
                          <p className="text-sm leading-relaxed">{app.description || 'No description provided.'}</p>
                        </div>
                        <div className="space-y-3">
                          <h5 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Contact Details</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Phone:</span>
                            <span>{app.phone}</span>
                            <span className="text-muted-foreground">Email:</span>
                            <Link href={`mailto:${app.email}`} className="text-primary hover:underline">
                              {app.email}
                            </Link>
                          </div>
                        </div>
                        {app.notes && (
                          <div className="col-span-full mt-2 p-3 bg-muted/50 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reviewer Notes</span>
                            </div>
                            <p className="text-sm">{app.notes}</p>
                          </div>
                        )}
                        <div className="col-span-full flex justify-end gap-2 pt-2">
                          {app.status === 'PENDING' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => openActionDialog(app._id, 'REJECT')}>
                                Reject Application
                              </Button>
                              <Button size="sm" onClick={() => openActionDialog(app._id, 'APPROVE')}>
                                Approve Application
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog((prev) => ({ ...prev, open: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog.type === 'APPROVE' ? 'Approve Application' : 'Reject Application'}</DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'APPROVE'
                ? `Are you sure you want to approve ${applications?.find((a) => a._id === actionDialog.appId)?.businessName}? This will verify the request.`
                : `Are you sure you want to reject this application? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-1.5 block">
              {actionDialog.type === 'APPROVE' ? 'Notes (Optional)' : 'Reason for rejection (Optional)'}
            </label>
            <Textarea
              value={actionDialog.notes}
              onChange={(e) => setActionDialog((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={actionDialog.type === 'APPROVE' ? 'Add any internal notes...' : 'e.g. Incomplete information'}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog((prev) => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button variant={actionDialog.type === 'REJECT' ? 'destructive' : 'default'} onClick={handleAction}>
              {actionDialog.type === 'APPROVE' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
