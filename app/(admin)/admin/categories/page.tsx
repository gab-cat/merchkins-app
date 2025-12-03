'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useOffsetPagination } from '@/src/hooks/use-pagination';
import {
  Shapes,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  GripVertical,
  FolderTree,
  MoreHorizontal,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';
import { PageHeader, ActiveBadge, EmptyState } from '@/src/components/admin';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface CategoryListItem {
  _id: Id<'categories'>;
  name: string;
  slug: string;
  level: number;
  isActive: boolean;
  parentCategoryId?: Id<'categories'>;
  description?: string;
  productCount?: number;
}

interface TreeNodeProps {
  category: CategoryListItem;
  children: CategoryListItem[];
  childrenMap: Map<string, CategoryListItem[]>;
  depth: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

function TreeNode({ category, children, childrenMap, depth, isExpanded, onToggle }: TreeNodeProps) {
  const hasChildren = children.length > 0;

  return (
    <div className="border-b last:border-b-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('group flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors', depth > 0 && 'bg-muted/20')}
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => hasChildren && onToggle(category._id)}
          className={cn('h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors', !hasChildren && 'invisible')}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>

        {/* Icon */}
        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', depth === 0 ? 'bg-primary/10' : 'bg-muted')}>
          {depth === 0 ? <FolderTree className="h-4 w-4 text-primary" /> : <Layers className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>

        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{category.name}</h4>
            <ActiveBadge isActive={category.isActive} />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground font-mono">/{category.slug}</span>
            {category.description && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{category.description}</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-xs text-muted-foreground">Level {category.level}</span>
          {hasChildren && <span className="text-xs text-muted-foreground">{children.length} subcategories</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/admin/categories/${category._id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Plus className="h-4 w-4 mr-2" />
                Add Subcategory
              </DropdownMenuItem>
              <DropdownMenuItem>
                {category.isActive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children.map((child) => {
              const grandchildren = childrenMap.get(child._id as unknown as string) || [];
              return (
                <TreeNode
                  key={child._id}
                  category={child}
                  children={grandchildren}
                  childrenMap={childrenMap}
                  depth={depth + 1}
                  isExpanded={true}
                  onToggle={onToggle}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [onlyActive, setOnlyActive] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const baseArgs = useMemo(
    () => ({
      includeDeleted: showDeleted ? true : undefined,
      isActive: onlyActive ? true : undefined,
    }),
    [showDeleted, onlyActive]
  );

  const {
    items: categories,
    isLoading: loading,
    hasMore,
    loadMore,
  } = useOffsetPagination<CategoryListItem, { includeDeleted?: boolean; isActive?: boolean }>({
    query: api.categories.queries.index.getCategories,
    baseArgs,
    limit: 50,
    selectItems: (res: unknown) => {
      const typedRes = res as { categories?: ReadonlyArray<CategoryListItem> };
      return typedRes.categories || [];
    },
    selectHasMore: (res: unknown) => {
      const typedRes = res as { hasMore?: boolean };
      return !!typedRes.hasMore;
    },
  });

  const filtered = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => [c.name, c.description || '', c.slug].join(' ').toLowerCase().includes(q));
  }, [categories, search]);

  const { roots, childrenMap } = useMemo(() => {
    const childrenMap = new Map<string, CategoryListItem[]>();
    const roots: CategoryListItem[] = [];

    for (const c of filtered) {
      if (c.parentCategoryId) {
        const key = c.parentCategoryId as unknown as string;
        const arr = childrenMap.get(key) || [];
        arr.push(c);
        childrenMap.set(key, arr);
      } else {
        roots.push(c);
      }
    }
    return { roots, childrenMap };
  }, [filtered]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set(categories.map((c) => c._id as unknown as string));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Stats
  const stats = useMemo(
    () => ({
      total: categories.length,
      roots: roots.length,
      active: categories.filter((c) => c.isActive).length,
      inactive: categories.filter((c) => !c.isActive).length,
    }),
    [categories, roots]
  );

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Categories"
        description="Manage your product category hierarchy"
        icon={<Shapes className="h-5 w-5" />}
        actions={
          <Link href="/admin/categories/new">
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Create Category
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Total Categories', value: stats.total },
          { label: 'Root Categories', value: stats.roots },
          { label: 'Active', value: stats.active, color: 'text-emerald-600' },
          { label: 'Inactive', value: stats.inactive, color: 'text-muted-foreground' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border bg-card p-3"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={cn('text-2xl font-bold font-admin-heading', stat.color)}>{loading ? '—' : stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="onlyActive" checked={onlyActive} onCheckedChange={(checked) => setOnlyActive(checked as boolean)} />
            <label htmlFor="onlyActive" className="text-sm cursor-pointer">
              Active only
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="showDeleted" checked={showDeleted} onCheckedChange={(checked) => setShowDeleted(checked as boolean)} />
            <label htmlFor="showDeleted" className="text-sm cursor-pointer">
              Show deleted
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Tree View */}
      <div className="rounded-xl border overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0">
                <div className="h-6 w-6 rounded bg-muted animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : roots.length === 0 ? (
          <EmptyState
            icon={<Shapes className="h-12 w-12 text-muted-foreground" />}
            title="No categories yet"
            description="Create your first category to organize your products."
            action={{
              label: 'Create Category',
              onClick: () => (window.location.href = '/admin/categories/new'),
            }}
          />
        ) : (
          <div>
            {roots.map((category) => {
              const children = childrenMap.get(category._id as unknown as string) || [];
              return (
                <TreeNode
                  key={category._id}
                  category={category}
                  children={children}
                  childrenMap={childrenMap}
                  depth={0}
                  isExpanded={expandedNodes.has(category._id as unknown as string)}
                  onToggle={toggleNode}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            Load more categories
          </Button>
        </div>
      )}
    </div>
  );
}
