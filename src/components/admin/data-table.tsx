'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter, X, ChevronLeft, ChevronRight, MoreHorizontal, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  pagination?: {
    pageSize: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  rowKey: keyof T;
  emptyMessage?: string;
  className?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  actions?: (row: T) => React.ReactNode;
  bulkActions?: React.ReactNode;
  filters?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string;
  direction: SortDirection;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  selectable = false,
  onSelectionChange,
  pagination,
  onRowClick,
  rowKey,
  emptyMessage = 'No data found.',
  className,
  stickyHeader = false,
  striped = false,
  hoverable = true,
  compact = false,
  actions,
  bulkActions,
  filters,
  onRefresh,
  refreshing = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const value = row[col.key as keyof T];
          return String(value ?? '')
            .toLowerCase()
            .includes(searchLower);
        })
      );
    }

    // Sort
    if (sort.key && sort.direction) {
      result.sort((a, b) => {
        const aValue = a[sort.key as keyof T];
        const bValue = b[sort.key as keyof T];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, search, sort, columns]);

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: '', direction: null };
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allKeys = new Set(processedData.map((row) => String(row[rowKey])));
      setSelectedRows(allKeys);
      onSelectionChange?.(processedData);
    }
  };

  const handleSelectRow = (row: T) => {
    const key = String(row[rowKey]);
    const newSelected = new Set(selectedRows);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedRows(newSelected);
    onSelectionChange?.(processedData.filter((r) => newSelected.has(String(r[rowKey]))));
  };

  const getSortIcon = (key: string) => {
    if (sort.key !== key) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />;
    if (sort.direction === 'asc') return <ChevronUp className="h-3.5 w-3.5" />;
    return <ChevronDown className="h-3.5 w-3.5" />;
  };

  const cellPadding = compact ? 'py-2 px-3' : 'py-3 px-4';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1">
          {searchable && (
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
              {search && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {filters && (
            <Button variant={showFilters ? 'secondary' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          )}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">{selectable && selectedRows.size > 0 && bulkActions}</div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && filters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-muted/30 rounded-lg border">{filters}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection info */}
      {selectable && selectedRows.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-muted-foreground">
          {selectedRows.size} of {processedData.length} row(s) selected.
        </motion.div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className={cn('overflow-auto', stickyHeader && 'max-h-[600px]')}>
          <Table>
            <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-background z-10')}>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {selectable && (
                  <TableHead className={cn('w-12', cellPadding)}>
                    <Checkbox
                      checked={selectedRows.size === processedData.length && processedData.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead
                    key={String(col.key)}
                    style={{ width: col.width }}
                    className={cn(
                      cellPadding,
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.sortable && 'cursor-pointer select-none hover:bg-muted/60 transition-colors',
                      col.className
                    )}
                    onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                  >
                    <div className={cn('flex items-center gap-1', col.align === 'right' && 'justify-end')}>
                      <span className="text-xs font-semibold uppercase tracking-wide">{col.title}</span>
                      {col.sortable && getSortIcon(String(col.key))}
                    </div>
                  </TableHead>
                ))}
                {actions && <TableHead className={cn('w-12', cellPadding)} />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`}>
                    {selectable && (
                      <TableCell className={cellPadding}>
                        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                      </TableCell>
                    )}
                    {columns.map((col, colIdx) => (
                      <TableCell key={`skeleton-${idx}-${colIdx}`} className={cellPadding}>
                        <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className={cellPadding}>
                        <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : processedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-8 w-8 opacity-50" />
                      <p>{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                processedData.map((row, rowIndex) => {
                  const rowKeyValue = String(row[rowKey]);
                  const isSelected = selectedRows.has(rowKeyValue);

                  return (
                    <motion.tr
                      key={rowKeyValue}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: rowIndex * 0.02 }}
                      className={cn(
                        'group transition-colors',
                        hoverable && 'hover:bg-muted/50',
                        striped && rowIndex % 2 === 1 && 'bg-muted/20',
                        isSelected && 'bg-primary/5',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <TableCell className={cellPadding} onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isSelected} onCheckedChange={() => handleSelectRow(row)} aria-label={`Select row ${rowKeyValue}`} />
                        </TableCell>
                      )}
                      {columns.map((col) => {
                        const value = row[col.key as keyof T];
                        return (
                          <TableCell
                            key={String(col.key)}
                            className={cn(cellPadding, col.align === 'center' && 'text-center', col.align === 'right' && 'text-right', col.className)}
                          >
                            {col.render ? col.render(value, row, rowIndex) : String(value ?? '—')}
                          </TableCell>
                        );
                      })}
                      {actions && (
                        <TableCell className={cn(cellPadding, 'text-right')} onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">{actions(row)}</DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalItems)} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} results
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              Page {pagination.currentPage} of {Math.ceil(pagination.totalItems / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= Math.ceil(pagination.totalItems / pagination.pageSize)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DropdownMenuItem, DropdownMenuSeparator };
