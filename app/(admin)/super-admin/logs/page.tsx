'use client';

import { useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Archive, RotateCcw, Inbox } from 'lucide-react';
import { PageHeader, EmptyState } from '@/src/components/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangeFilter, DateRange } from '@/src/components/ui/date-range-filter';
import { useDebouncedSearch } from '@/src/hooks/use-debounced-search';
import { useOffsetPagination } from '@/src/hooks/use-pagination';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';

type Log = Doc<'logs'>;

type LogQueryArgs = {
  isArchived?: boolean;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

type LogQueryResult = {
  logs: Log[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SeverityBadge({ severity }: { severity: string }) {
  const config = {
    LOW: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Low' },
    MEDIUM: { className: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Medium' },
    HIGH: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'High' },
    CRITICAL: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Critical' },
  }[severity] || { className: 'bg-muted text-muted-foreground', label: severity };

  return <Badge className={cn('text-xs font-medium border px-2.5 py-1', config.className)}>{config.label}</Badge>;
}

export default function SuperAdminLogsPage() {
  const [search, setSearch] = useState('');
  const [isArchived, setIsArchived] = useState<boolean | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange>({});

  const debouncedSearch = useDebouncedSearch(search, 300);

  const baseArgs = useMemo(
    (): LogQueryArgs => ({
      isArchived,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
      search: debouncedSearch || undefined,
    }),
    [isArchived, dateRange, debouncedSearch]
  );

  const {
    items: logs,
    isLoading: loading,
    hasMore,
    loadMore,
  } = useOffsetPagination<Log, LogQueryArgs>({
    query: api.logs.queries.index.getLogs,
    baseArgs,
    limit: 25,
    selectItems: (res: unknown) => {
      const typedRes = res as LogQueryResult;
      return typedRes.logs || [];
    },
    selectHasMore: (res: unknown) => {
      const typedRes = res as LogQueryResult;
      return !!typedRes.hasMore;
    },
  });

  const archiveLog = useMutation(api.logs.mutations.index.archiveLog);
  const restoreLog = useMutation(api.logs.mutations.index.restoreLog);

  async function handleArchive(logId: Id<'logs'>) {
    await archiveLog({ logId });
  }

  async function handleRestore(logId: Id<'logs'>) {
    await restoreLog({ logId });
  }

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="System Logs"
        description="View and manage system activity logs"
        icon={<FileText className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Super Admin', href: '/super-admin/overview' }, { label: 'Logs' }]}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select
            value={isArchived === undefined ? 'ALL' : isArchived ? 'ARCHIVED' : 'ACTIVE'}
            onValueChange={(v) => setIsArchived(v === 'ALL' ? undefined : v === 'ARCHIVED')}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Logs</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {logs.length} log{logs.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Message</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Action</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Severity</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <div className="h-4 w-64 rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-20 rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-24 rounded bg-muted animate-pulse ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40">
                  <EmptyState
                    icon={<Inbox className="h-12 w-12 text-muted-foreground" />}
                    title="No logs found"
                    description={
                      search || isArchived !== undefined || dateRange.dateFrom || dateRange.dateTo
                        ? 'Try adjusting your filters'
                        : 'System logs will appear here'
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <motion.tr
                  key={log._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="max-w-md">
                      <p className="text-sm truncate">{log.reason}</p>
                      {log.systemText && <p className="text-xs text-muted-foreground mt-1 truncate">{log.systemText}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {log.logType || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{log.action || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={log.severity} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{formatDate(log.createdDate)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {log.isArchived ? (
                      <Button size="sm" variant="outline" onClick={() => handleRestore(log._id)}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleArchive(log._id)}>
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </Button>
                    )}
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            Load More Logs
          </Button>
        </div>
      )}
    </div>
  );
}
