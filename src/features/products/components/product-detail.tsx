"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { R2Image } from '@/src/components/ui/r2-image'
import { Star, Share2, ShoppingCart } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { useCartSheetStore } from '@/src/stores/cart-sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ProductDetailProps {
  slug: string
  orgSlug?: string
}

export function ProductDetail ({ slug, orgSlug }: ProductDetailProps) {
  // TODO: replace with dynamic value
  if (slug === '_error_test_') {
    throw new Error('Intentional test error for error boundary validation')
  }
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )
  const product = useQuery(
    api.products.queries.index.getProductBySlug,
    organization?._id ? { slug, organizationId: organization._id } : { slug }
  )
  const recommendations = useQuery(
    api.products.queries.index.getProductRecommendations,
    product?._id ? { productId: product._id, limit: 8 } : 'skip'
  )

  type RecommendedProduct = {
    _id: string
    slug: string
    title: string
    description?: string
    imageUrl?: string[]
    minPrice?: number
    rating?: number
    reviewsCount?: number
    isBestPrice?: boolean
    discountLabel?: string
  }
  const recommended: RecommendedProduct[] =
    (recommendations?.products as unknown as RecommendedProduct[]) || []
  const addItem = useMutation(api.carts.mutations.index.addItem)
  const openCartSheet = useCartSheetStore((s) => s.open)

  const activeVariants = useMemo(
    () => (product?.variants ?? []).filter((v) => v.isActive),
    [product]
  )

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    undefined
  )

  const selectedVariant = useMemo(() => {
    if (!product) return undefined
    if (!selectedVariantId) return undefined
    return product.variants.find((v) => v.variantId === selectedVariantId)
  }, [product, selectedVariantId])

  const price = selectedVariant?.price
    ?? product?.minPrice
    ?? product?.maxPrice
    ?? product?.supposedPrice
    ?? 0
  const inStock = (selectedVariant?.inventory ?? product?.inventory ?? 0) > 0

  async function handleAddToCart () {
    if (!product) return
    if ((activeVariants.length > 0) && !selectedVariantId) {
      showToast({ type: 'warning', title: 'Please select a variant first' })
      return
    }
    try {
      await addItem({ productId: product._id, variantId: selectedVariantId, quantity: 1 })
      openCartSheet()
    } catch {
      showToast({ type: 'error', title: 'Failed to add to cart' })
    }
  }

  async function handleShare () {
    if (!product) return
    const shareData = {
      title: product.title,
      text: product.description ?? product.title,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
    try {
      if (navigator.share && shareData.url) {
        await navigator.share(shareData)
      } else if (shareData.url) {
        await navigator.clipboard.writeText(shareData.url)
      }
    } catch (err) {
      console.error('Share failed', err)
    }
  }

  if (product === undefined) {
    return (
      <div className="container mx-auto px-3 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-lg bg-secondary animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 rounded bg-secondary animate-pulse" />
            <div className="h-5 w-1/3 rounded bg-secondary animate-pulse" />
            <div className="h-24 w-full rounded bg-secondary animate-pulse" />
            <div className="h-10 w-40 rounded bg-secondary animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (product === null) {
    return (
      <div className="container mx-auto px-3 py-16 text-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 py-6" data-testid="product-detail">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <ProductGallery imageKeys={product.imageUrl} />
        </div>

        <div>
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight text-primary"
            data-testid="product-title"
          >
            {product.title}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-current" />
              {product.rating?.toFixed(1)}
            </span>
            <span>({product.reviewsCount} reviews)</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">
              {product.totalOrders} orders
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold" data-testid="product-price">
            ${price.toFixed(2)}
          </div>

          {product.description && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {product.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {activeVariants.length > 0 && (
            <div className="mt-6">
              <span className="mb-2 block text-sm font-medium">Variant</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-80 justify-between"
                    aria-label="Select variant"
                  >
                    {selectedVariant?.variantName ?? 'Select a variant'}
                    <span aria-hidden>▾</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[12rem]">
                  <DropdownMenuRadioGroup
                    value={selectedVariantId ?? ''}
                    onValueChange={(val) => setSelectedVariantId(val)}
                  >
                    {activeVariants.map((v) => (
                      <DropdownMenuRadioItem key={v.variantId} value={v.variantId}>
                        {v.variantName} • ${v.price.toFixed(2)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock || (activeVariants.length > 0 && !selectedVariantId)}
              aria-label="Add to cart"
            >
              {inStock ? (<><ShoppingCart className="mr-2 h-4 w-4" /> Add to cart</>) : 'Out of stock'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleShare}
              aria-label="Share product"
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {inStock ? (
              <Badge variant="secondary" data-testid="inventory-status">
                In stock
              </Badge>
            ) : (
              <Badge variant="destructive" data-testid="inventory-status">
                Out of stock
              </Badge>
            )}
            {product.inventoryType === 'PREORDER' && (
              <Badge variant="secondary">Preorder</Badge>
            )}
            {product.isBestPrice && (
              <Badge variant="outline">Best price</Badge>
            )}
          </div>

          {/* Details and shipping sections removed for compact layout */}

          {product.recentReviews?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Recent reviews</h3>
              <div className="grid gap-2">
                {product.recentReviews.slice(0, 3).map((r) => (
                  <Card key={r.reviewId} className="overflow-hidden">
                    <CardContent className="p-3 py-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={r.userImage} alt={r.userName} />
                          <AvatarFallback>
                            {r.userName?.charAt(0)?.toUpperCase() ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate text-sm font-medium">
                              {r.userName}
                            </div>
                            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              {r.rating.toFixed(1)}
                            </div>
                          </div>
                          {r.comment && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {r.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Recommended products */}
      {recommended.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-semibold">Recommended for you</h2>
            {organization?.slug && (
              <Link className="text-sm text-primary" href={`/o/${organization.slug}/search`}>
                View more
              </Link>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {recommended.map((rp) => (
              <Link
                key={rp._id}
                href={orgSlug ? `/o/${orgSlug}/p/${rp.slug}` : `/p/${rp.slug}`}
                className="group block"
                aria-label={`View ${rp.title}`}
              >
                <Card className="overflow-hidden rounded-xl border bg-card shadow-sm py-0 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative h-40 w-full overflow-hidden md:h-44">
                    <R2Image
                      fileKey={rp.imageUrl?.[0]}
                      alt={rp.title}
                      width={800}
                      height={600}
                      className="h-full w-full bg-secondary object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
                      {rp.isBestPrice && (
                        <Badge variant="secondary" className="text-[10px]">
                          Best price
                        </Badge>
                      )}
                      {rp.discountLabel && (
                        <Badge variant="outline" className="text-[10px]">
                          {rp.discountLabel}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader className="space-y-1 p-3 md:p-3">
                    <CardTitle className="line-clamp-2 text-base font-semibold leading-snug text-primary">
                      {rp.title}
                    </CardTitle>
                    {rp.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {rp.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between p-3 md:p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {typeof rp.minPrice === 'number' ? `$${rp.minPrice.toFixed(2)}` : ''}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star size={14} className="fill-current" />
                        {typeof rp.rating === 'number' ? rp.rating.toFixed(1) : '—'}
                        {typeof rp.reviewsCount === 'number' ? ` (${rp.reviewsCount})` : ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      View
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProductGallery ({ imageKeys }: { imageKeys: string[] }) {
  const [current, setCurrent] = React.useState(0)
  if (!imageKeys || imageKeys.length === 0) {
    return <div className="h-[420px] w-full rounded-lg bg-secondary sm:h-[480px] lg:h-[520px]" />
  }

  const goPrev = () => setCurrent((c) => (c - 1 + imageKeys.length) % imageKeys.length)
  const goNext = () => setCurrent((c) => (c + 1) % imageKeys.length)

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-lg">
        <div className="h-[420px] w-full sm:h-[480px] lg:h-[520px]">
          <R2Image
            key={imageKeys[current]}
            fileKey={imageKeys[current]}
            alt="Product image"
            width={1200}
            height={1200}
            className="h-full w-full rounded-lg object-cover animate-in fade-in zoom-in-50"
          />
        </div>
        {imageKeys.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur hover:bg-black/60"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur hover:bg-black/60"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {imageKeys.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to image ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={[
                    'h-2 w-2 rounded-full transition-all',
                    i === current ? 'bg-white' : 'bg-white/50',
                  ].join(' ')}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {imageKeys.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {imageKeys.slice(0, 10).map((k, idx) => (
            <button
              key={k}
              type="button"
              onClick={() => setCurrent(idx)}
              className={[
                'overflow-hidden rounded-md border',
                idx === current ? 'border-ring' : 'border-transparent',
              ].join(' ')}
            >
              <R2Image
                fileKey={k}
                alt="Product image thumbnail"
                width={200}
                height={200}
                className="aspect-square object-cover hover:opacity-90"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// R2Image now centralized in src/components/ui/r2-image

// Small error boundary wrapper for client-side rendering issues
interface ProductDetailBoundaryProps {
  slug: string
  orgSlug?: string
}

export class ProductDetailBoundary extends React.Component<
  ProductDetailBoundaryProps,
  { hasError: boolean }
> {
  constructor (props: ProductDetailBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError () {
    return { hasError: true }
  }

  componentDidCatch (error: unknown) {
    // TODO: replace with dynamic value: send to monitoring service
    console.error('ProductDetail render error', error)
  }

  render () {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-24" data-testid="product-detail-fallback">
          <div className="mx-auto max-w-xl rounded-lg border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold">We hit a snag</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please refresh the page or try again later.
            </p>
            <div className="mt-6">
              <Button onClick={() => this.setState({ hasError: false })}>Try again</Button>
            </div>
          </div>
        </div>
      )
    }
    return <ProductDetail slug={this.props.slug} orgSlug={this.props.orgSlug} />
  }
}


