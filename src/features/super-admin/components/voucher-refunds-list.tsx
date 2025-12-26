'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Search, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/src/components/admin';
import { VoucherRefundRequestDetailDialog } from './voucher-refund-request-detail-dialog';
import type { Id } from '@/convex/_generated/dataModel';
import { formatCurrency } from '@/lib/utils';

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  const config = {
    PENDING: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    APPROVED: {
      label: 'Approved',
      icon: CheckCircle,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    REJECTED: {
      label: 'Rejected',
      icon: XCircle,
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}

export function VoucherRefundsList() {
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('ALL');
  const [selectedRequestId, setSelectedRequestId] = useState<Id<'voucherRefundRequests'> | null>(null);
  const [search, setSearch] = useState('');

  const requests = useQuery(api.voucherRefundRequests.queries.index.getVoucherRefundRequests, statusFilter === 'ALL' ? {} : { status: statusFilter });

  const counts = useQuery(api.voucherRefundRequests.queries.index.getVoucherRefundRequestCounts);

  const filteredRequests =
    requests?.filter((req) => {
      if (!search.trim()) return true;
      const searchLower = search.toLowerCase();
      return (
        req.voucherInfo.code.toLowerCase().includes(searchLower) ||
        req.customerInfo.email.toLowerCase().includes(searchLower) ||
        `${req.customerInfo.firstName} ${req.customerInfo.lastName}`.toLowerCase().includes(searchLower)
      );
    }) || [];

  const stats = {
    total: counts?.total || 0,
    pending: counts?.pending || 0,
    approved: counts?.approved || 0,
    rejected: counts?.rejected || 0,
  };

  if (requests === undefined || counts === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Voucher Refunds"
        description="Manage customer requests for monetary refunds of vouchers"
        icon={<DollarSign className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: DollarSign, color: 'text-primary' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by voucher code, customer email, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No voucher refund requests found</p>
          <p className="text-sm text-slate-500">
            {search ? 'Try adjusting your search filters' : 'Requests will appear here when customers submit them'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            <AnimatePresence>
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRequestId(request._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={request.status} />
                        <span className="font-mono font-semibold text-lg">{request.voucherInfo.code}</span>
                        <span className="text-xl font-bold text-emerald-700">{formatCurrency(request.requestedAmount)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>
                          {request.customerInfo.firstName} {request.customerInfo.lastName}
                        </span>
                        <span>{request.customerInfo.email}</span>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Click to view details</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {selectedRequestId && (
        <VoucherRefundRequestDetailDialog
          requestId={selectedRequestId}
          open={!!selectedRequestId}
          onOpenChange={(open) => {
            if (!open) setSelectedRequestId(null);
          }}
        />
      )}
    </div>
  );
}
