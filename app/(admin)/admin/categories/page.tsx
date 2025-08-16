"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOffsetPagination } from '@/src/hooks/use-pagination'

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
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            Active only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            Show deleted
          </label>
          <Link href="/admin/categories/new">
            <Button>Create category</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-md border divide-y">
          {new Array(6).fill(null).map((_, i) => (
            <div key={`s-${i}`} className="px-3 py-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {grouped.root.map((c) => (
              <CategoryRow
                key={c._id}
                cat={c}
                childrenMap={grouped.children}
              />
            ))}
          </div>
          {hasMore && (
            <div className="mt-3 flex justify-center">
              <Button size="sm" variant="ghost" onClick={loadMore}>Load more</Button>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No categories found.
            </div>
          )}
        </>
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

function CategoryRow ({
  cat,
  childrenMap,
  depth = 0,
}: {
  cat: CategoryListItem
  childrenMap: Map<string, CategoryListItem[]>
  depth?: number
}) {
  const kids = childrenMap.get(cat._id as unknown as string) || []
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">
              <span className="opacity-50">{Array(depth).fill('—').join('')}</span>
              {cat.name}
            </div>
            <div className="text-xs text-muted-foreground">
              slug: {cat.slug} • level {cat.level} • {cat.isActive ? 'active' : 'inactive'}
            </div>
          </div>
          <div className="shrink-0">
            <Link href={`/admin/categories/${cat._id}`}>
              <Button size="sm" variant="secondary">Edit</Button>
            </Link>
          </div>
        </div>
        {kids.length > 0 && (
          <div className="space-y-2">
            {kids.map((k) => (
              <CategoryRow
                key={k._id}
                cat={k}
                childrenMap={childrenMap}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


