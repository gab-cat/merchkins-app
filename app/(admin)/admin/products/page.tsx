"use client"

import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useOffsetPagination } from '@/src/hooks/use-pagination'
import { R2Image } from '@/src/components/ui/r2-image'
import Link from 'next/link'
import { Doc, Id } from '@/convex/_generated/dataModel'

type Product = Doc<"products">

type ProductQueryArgs = {
  organizationId?: Id<"organizations">
  sortBy?: string
  limit?: number
  offset?: number
}

type ProductQueryResult = {
  products: Product[]
  hasMore: boolean
}

export default function AdminProductsPage () {
  const searchParams = useSearchParams()
  const orgSlug = searchParams.get('org')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string }),
  )

  const baseArgs = useMemo((): ProductQueryArgs => ({
    organizationId: orgSlug ? organization?._id : undefined,
    sortBy,
  }), [orgSlug, organization, sortBy])

  const {
    items: products,
    isLoading: loading,
    hasMore,
    loadMore,
  } = useOffsetPagination<Product, ProductQueryArgs>({
    query: api.products.queries.index.getProducts,
    baseArgs,
    limit: 25,
    selectItems: (res: unknown) => {
      const typedRes = res as ProductQueryResult
      return typedRes.products || []
    },
    selectHasMore: (res: unknown) => {
      const typedRes = res as ProductQueryResult
      return !!typedRes.hasMore
    },
  })

  const results = useMemo(() => {
    if (!search) return products
    const q = search.toLowerCase()
    return products.filter((p: Product) =>
      [p.title, p.description || '', ...(p.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [products, search])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage catalog, pricing, and inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rating">Rating</option>
            <option value="price_low">Price: Low to high</option>
            <option value="price_high">Price: High to low</option>
            <option value="popular">Popular</option>
            <option value="orders">Orders</option>
            <option value="views">Views</option>
          </select>
          <Link href={`/admin/products/new${orgSlug ? `?org=${orgSlug}` : ''}`}><Button>Create product</Button></Link>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="divide-y">
          {loading
            ? new Array(6).fill(null).map((_, i) => (
                <div key={`s-${i}`} className="flex items-center justify-between px-3 py-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
                  <div className="h-6 w-24 animate-pulse rounded bg-secondary" />
                </div>
              ))
            : results.map((p: Product) => (
                <div key={p._id} className="flex items-center justify-between px-3 py-2 hover:bg-secondary/50">
                  <div className="flex min-w-0 items-center gap-3">
                    <R2Image fileKey={p.imageUrl?.[0]} alt={p.title} width={40} height={40} className="h-10 w-10 rounded object-cover" fallbackClassName="h-10 w-10 rounded" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.title}</div>
                      <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{p.totalVariants} variants</span>
                        <span>{p.inventory} in stock</span>
                        <span>{p.totalOrders} orders</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <Link href={`/admin/products/${p._id}${orgSlug ? `?org=${orgSlug}` : ''}`}>
                      <Button size="sm" variant="secondary">Edit</Button>
                    </Link>
                    <Link href={`/p/${p.slug}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {hasMore && !loading && (
        <div className="mt-3 flex justify-center">
          <Button size="sm" variant="ghost" onClick={loadMore}>Load more</Button>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">No products found.</div>
      )}
    </div>
  )
}


