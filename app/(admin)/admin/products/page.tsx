'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOffsetPagination } from '@/src/hooks/use-pagination';
import { R2Image } from '@/src/components/ui/r2-image';
import Link from 'next/link';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { Package, Plus, Search, Grid3X3, List, Star, ShoppingCart, Eye, ExternalLink, Edit, MoreHorizontal, Filter, ArrowUpDown } from 'lucide-react';
import { PageHeader, ProductsEmptyState, StatusBadge } from '@/src/components/admin';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Product = Doc<'products'>;

type ProductQueryArgs = {
  organizationId?: Id<'organizations'>;
  sortBy?: string;
  limit?: number;
  offset?: number;
};

type ProductQueryResult = {
  products: Product[];
  hasMore: boolean;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

interface ProductCardProps {
  product: Product;
  orgSlug: string | null;
  index: number;
}

function ProductCard({ product, orgSlug, index }: ProductCardProps) {
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-xl border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <R2Image
          fileKey={product.imageUrl?.[0]}
          alt={product.title}
          width={300}
          height={300}
          className="w-full h-full object-cover"
          fallbackClassName="w-full h-full"
        />
        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link href={`/admin/products/${product._id}${suffix}`}>
            <Button size="sm" variant="secondary" className="h-8">
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </Link>
          <Link href={`/p/${product.slug}`} target="_blank">
            <Button size="sm" variant="secondary" className="h-8">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        {/* Status badge */}
        {!product.isActive && (
          <div className="absolute top-2 left-2">
            <StatusBadge status="Inactive" type="error" size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{product.title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-primary">{formatCurrency(product.minPrice ?? 0)}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {product.rating.toFixed(1)}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {product.totalVariants} variants
          </span>
          <span className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            {product.totalOrders} orders
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant={product.inventory > 10 ? 'default' : product.inventory > 0 ? 'secondary' : 'destructive'} className="text-[10px]">
            {product.inventory} in stock
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

interface ProductListItemProps {
  product: Product;
  orgSlug: string | null;
  index: number;
}

function ProductListItem({ product, orgSlug, index }: ProductListItemProps) {
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
    >
      {/* Image */}
      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
        <R2Image
          fileKey={product.imageUrl?.[0]}
          alt={product.title}
          width={56}
          height={56}
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{product.title}</h4>
          {!product.isActive && <StatusBadge status="Inactive" type="error" size="sm" />}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {product.totalVariants} variants
          </span>
          <span className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            {product.totalOrders} orders
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {product.viewCount ?? 0} views
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Price & Stock */}
      <div className="text-right shrink-0">
        <div className="font-bold text-sm text-primary">{formatCurrency(product.minPrice ?? 0)}</div>
        <Badge variant={product.inventory > 10 ? 'default' : product.inventory > 0 ? 'secondary' : 'destructive'} className="text-[10px] mt-1">
          {product.inventory} in stock
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/admin/products/${product._id}${suffix}`}>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/p/${product.slug}`} target="_blank">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const suffix = orgSlug ? `?org=${orgSlug}` : '';
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  );

  const baseArgs = useMemo(
    (): ProductQueryArgs => ({
      organizationId: orgSlug ? organization?._id : undefined,
      sortBy,
    }),
    [orgSlug, organization, sortBy]
  );

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
      const typedRes = res as ProductQueryResult;
      return typedRes.products || [];
    },
    selectHasMore: (res: unknown) => {
      const typedRes = res as ProductQueryResult;
      return !!typedRes.hasMore;
    },
  });

  const results = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p: Product) => [p.title, p.description || '', ...(p.tags || [])].join(' ').toLowerCase().includes(q));
  }, [products, search]);

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Products"
        description="Manage your product catalog, pricing, and inventory"
        icon={<Package className="h-5 w-5" />}
        actions={
          <Link href={`/admin/products/new${suffix}`}>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Create Product
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-9">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="orders">Most Orders</SelectItem>
              <SelectItem value="views">Most Views</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setViewMode('grid')}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {results.length} product{results.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Products */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {viewMode === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl border overflow-hidden">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
                    <div className="h-14 w-14 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : results.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProductsEmptyState onCreate={() => (window.location.href = `/admin/products/new${suffix}`)} />
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {results.map((product: Product, index: number) => (
              <ProductCard key={product._id} product={product} orgSlug={orgSlug} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border overflow-hidden"
          >
            {results.map((product: Product, index: number) => (
              <ProductListItem key={product._id} product={product} orgSlug={orgSlug} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            Load more products
          </Button>
        </div>
      )}
    </div>
  );
}
