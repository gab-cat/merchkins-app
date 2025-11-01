"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useOffsetPagination } from '@/src/hooks/use-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CategoryListItem {
  _id: Id<'categories'>
  name: string
  slug: string
  level: number
  isActive: boolean
  parentCategoryId?: Id<'categories'>
  description?: string
}

export default function AdminCategoriesPage () {
  const [search, setSearch] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [onlyActive, setOnlyActive] = useState(true)

  const baseArgs = useMemo(() => ({
    includeDeleted: showDeleted ? true : undefined,
    isActive: onlyActive ? true : undefined,
  }), [showDeleted, onlyActive])

  const { items: categories, isLoading: loading, hasMore, loadMore } = useOffsetPagination<CategoryListItem, { includeDeleted?: boolean; isActive?: boolean }>({
    query: api.categories.queries.index.getCategories,
    baseArgs,
    limit: 50,
    selectItems: (res: unknown) => {
      const typedRes = res as { categories?: ReadonlyArray<CategoryListItem> }
      return typedRes.categories || []
    },
    selectHasMore: (res: unknown) => {
      const typedRes = res as { hasMore?: boolean }
      return !!typedRes.hasMore
    },
  })

  const filtered = useMemo(() => {
    if (!search) return categories
    const q = search.toLowerCase()
    return categories.filter((c) =>
      [c.name, c.description || '', c.slug]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [categories, search])

  const grouped = useMemo(() => groupByParent(filtered), [filtered])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage category tree and settings
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="onlyActive"
              checked={onlyActive}
              onCheckedChange={(checked) => setOnlyActive(checked as boolean)}
            />
            <label htmlFor="onlyActive" className="text-sm font-medium">Active only</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="showDeleted"
              checked={showDeleted}
              onCheckedChange={(checked) => setShowDeleted(checked as boolean)}
            />
            <label htmlFor="showDeleted" className="text-sm font-medium">Show deleted</label>
          </div>
          <Link href="/admin/categories/new">
            <Button>Create category</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? new Array(10).fill(null).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 w-16 animate-pulse rounded bg-secondary ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : (
                <>
                  {grouped.root.map((c) => (
                    <CategoryTableRow
                      key={c._id}
                      cat={c}
                      childrenMap={grouped.children}
                    />
                  ))}
                </>
              )}
          </TableBody>
        </Table>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No categories found.
        </div>
      )}

      {hasMore && !loading && (
        <div className="mt-4 flex justify-center">
          <Button size="sm" variant="ghost" onClick={loadMore}>Load more</Button>
        </div>
      )}
    </div>
  )
}

function groupByParent (categories: ReadonlyArray<CategoryListItem>) {
  const children = new Map<string, CategoryListItem[]>()
  const root: CategoryListItem[] = []
  for (const c of categories) {
    if (c.parentCategoryId) {
      const key = c.parentCategoryId as unknown as string
      const arr = children.get(key) || []
      arr.push(c)
      children.set(key, arr)
    } else {
      root.push(c)
    }
  }
  return { root, children }
}

function CategoryTableRow ({
  cat,
  childrenMap,
  depth = 0,
}: {
  cat: CategoryListItem
  childrenMap: Map<string, CategoryListItem[]>
  depth?: number
}) {
  // Render this category and all its children recursively
  const renderCategory = (category: CategoryListItem, currentDepth: number) => {
    const childCategories = childrenMap.get(category._id as unknown as string) || []

    return (
      <React.Fragment key={category._id}>
        <TableRow className={currentDepth > 0 ? "bg-muted/30" : ""}>
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              {currentDepth > 0 && (
                <span className="text-muted-foreground">
                  {Array(currentDepth).fill('└─').join('')}
                </span>
              )}
              {category.name}
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground font-mono text-sm">
            {category.slug}
          </TableCell>
          <TableCell className="text-muted-foreground">
            {category.level}
          </TableCell>
          <TableCell>
            <Badge variant={category.isActive ? "default" : "secondary"}>
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
          <TableCell className="text-muted-foreground max-w-xs truncate">
            {category.description || "—"}
          </TableCell>
          <TableCell className="text-right">
            <Link href={`/admin/categories/${category._id}`}>
              <Button size="sm" variant="ghost">Edit</Button>
            </Link>
          </TableCell>
        </TableRow>
        {childCategories.map((child) => renderCategory(child, currentDepth + 1))}
      </React.Fragment>
    )
  }

  return renderCategory(cat, depth)
}


