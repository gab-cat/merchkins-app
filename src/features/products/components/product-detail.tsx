"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, usePreloadedQuery } from 'convex/react'
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
import { Star, Share2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { useCartSheetStore } from '@/src/stores/cart-sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProductCard } from './product-card'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface ProductDetailProps {
  slug: string
  orgSlug?: string
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>
  preloadedProduct?: Preloaded<typeof api.products.queries.index.getProductBySlug>
  preloadedRecommendations?: Preloaded<typeof api.products.queries.index.getProductRecommendations>
}

export function ProductDetail ({ slug, orgSlug, preloadedOrganization, preloadedProduct, preloadedRecommendations }: ProductDetailProps) {
  // TODO: replace with dynamic value
  if (slug === '_error_test_') {
    throw new Error('Intentional test error for error boundary validation')
  }
  const organization = preloadedOrganization
    ? usePreloadedQuery(preloadedOrganization)
    : useQuery(
        api.organizations.queries.index.getOrganizationBySlug,
        orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
      )
  const product = preloadedProduct
    ? usePreloadedQuery(preloadedProduct)
    : useQuery(
        api.products.queries.index.getProductBySlug,
        organization?._id ? { slug, organizationId: organization._id } : { slug }
      )
  const recommendations = preloadedRecommendations
    ? usePreloadedQuery(preloadedRecommendations)
    : useQuery(
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
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-[4/3] rounded-lg bg-secondary skeleton" />
          <div className="space-y-3">
            <div className="h-6 w-2/3 rounded bg-secondary animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-secondary animate-pulse" />
            <div className="h-16 w-full rounded bg-secondary animate-pulse" />
            <div className="h-8 w-32 rounded bg-secondary animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (product === null) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6" data-testid="product-detail">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <ProductGallery imageKeys={product.imageUrl} />
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary leading-tight"
              data-testid="product-title"
            >
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              {product.rating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current text-yellow-400" />
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                </span>
              )}
              {product.reviewsCount && <span>({product.reviewsCount} reviews)</span>}
              {product.totalOrders && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{product.totalOrders} orders</span>
                </>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-primary" data-testid="product-price">
              {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(price)}
            </div>
          </div>

          {product.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {product.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs px-2 py-1">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {activeVariants.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Select variant</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 text-sm sm:text-base"
                    aria-label="Select variant"
                  >
                    <span className="truncate">
                      {selectedVariant ? `${selectedVariant.variantName} - ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(selectedVariant.price)}` : 'Select a variant'}
                    </span>
                    <span aria-hidden className="ml-2">▾</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[12rem] animate-in fade-in-0 zoom-in-95">
                  <DropdownMenuRadioGroup
                    value={selectedVariantId ?? ''}
                    onValueChange={(val) => setSelectedVariantId(val)}
                  >
                    {activeVariants.map((v) => (
                      <DropdownMenuRadioItem key={v.variantId} value={v.variantId} className="cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <span>{v.variantName}</span>
                          <span className="ml-2 font-medium text-primary">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(v.price)}</span>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock || (activeVariants.length > 0 && !selectedVariantId)}
              aria-label="Add to cart"
              className="flex-1 hover:scale-105 transition-all duration-200 text-sm sm:text-base touch-manipulation"
            >
              {inStock ? (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to cart
                </>
              ) : (
                'Out of stock'
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleShare}
              aria-label="Share product"
              className="flex-1 hover:scale-105 hover:bg-primary hover:text-white transition-all duration-200 border-2 text-sm sm:text-base touch-manipulation"
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {inStock ? (
              <Badge variant="secondary" data-testid="inventory-status" className="text-xs px-2 py-1 font-medium">
                ✓ In stock
              </Badge>
            ) : (
              <Badge variant="destructive" data-testid="inventory-status" className="text-xs px-2 py-1 font-medium">
                ✗ Out of stock
              </Badge>
            )}
            {product.inventoryType === 'PREORDER' && (
              <Badge variant="outline" className="text-xs px-2 py-1 font-medium">Preorder</Badge>
            )}
            {product.isBestPrice && (
              <Badge variant="default" className="text-xs px-2 py-1 font-medium bg-green-100 text-green-800 border-green-200">
                Best price
              </Badge>
            )}
          </div>

          {/* Reviews section - compact layout */}
          {product.recentReviews?.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">Recent reviews</h3>
                <span className="text-xs sm:text-sm text-muted-foreground">({product.recentReviews.length})</span>
              </div>
              <div className="grid gap-2 sm:gap-3">
                {product.recentReviews.slice(0, 3).map((r) => (
                  <Card key={r.reviewId} className="overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary/40 transition-colors">
                    <CardContent className="p-2 sm:p-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-background">
                          <AvatarImage src={r.userImage} alt={r.userName} />
                          <AvatarFallback className="text-xs">
                            {r.userName?.charAt(0)?.toUpperCase() ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="truncate text-xs sm:text-sm font-semibold text-primary">
                              {r.userName}
                            </div>
                            <div className="inline-flex items-center gap-1 text-xs">
                              <Star className="h-3 w-3 fill-current text-yellow-400" />
                              <span className="font-medium">{r.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          {r.comment && (
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
        <section className="mt-6 sm:mt-8">
          <div className="mb-3 sm:mb-4 flex items-end justify-between">
            <h2 className="text-lg sm:text-xl font-bold">You might also like</h2>
            {organization?.slug && (
              <Link className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-all duration-200" href={`/o/${organization.slug}/search`}>
                View more
              </Link>
            )}
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {recommended.map((rp, index) => (
              <ProductCard
                key={rp._id}
                _id={rp._id}
                slug={rp.slug}
                title={rp.title}
                description={rp.description}
                imageUrl={rp.imageUrl}
                minPrice={rp.minPrice}
                rating={rp.rating}
                reviewsCount={rp.reviewsCount}
                isBestPrice={rp.isBestPrice}
                discountLabel={rp.discountLabel}
                orgSlug={orgSlug}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProductGallery ({ imageKeys }: { imageKeys: string[] }) {
  const [current, setCurrent] = React.useState(0)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogImageIndex, setDialogImageIndex] = React.useState(0)
  
  if (!imageKeys || imageKeys.length === 0) {
    return <div className="aspect-[4/3] max-h-[500px] md:max-h-[600px] w-full rounded-lg bg-secondary skeleton" />
  }

  const goPrev = () => setCurrent((c) => (c - 1 + imageKeys.length) % imageKeys.length)
  const goNext = () => setCurrent((c) => (c + 1) % imageKeys.length)
  
  const handleImageClick = () => {
    setDialogImageIndex(current)
    setDialogOpen(true)
  }

  return (
    <div className="w-full space-y-3">
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <div className="aspect-[4/3] max-h-[500px] md:max-h-[600px] w-full cursor-pointer group" onClick={handleImageClick}>
          <R2Image
            key={imageKeys[current]}
            fileKey={imageKeys[current]}
            alt="Product image"
            width={800}
            height={600}
            className="h-full w-full rounded-xl object-cover animate-in fade-in zoom-in-50 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 rounded-xl flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 backdrop-blur-sm rounded-full p-2">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
        {imageKeys.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-2 md:px-3 md:py-2 text-white hover:bg-black/70 hover:scale-110 active:scale-95 transition-all duration-200 touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-2 md:px-3 md:py-2 text-white hover:bg-black/70 hover:scale-110 active:scale-95 transition-all duration-200 touch-manipulation"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="absolute bottom-2 md:bottom-3 left-0 right-0 flex justify-center gap-1.5 md:gap-2">
              {imageKeys.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrent(i)
                  }}
                  className={[
                    'h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-all duration-200 touch-manipulation',
                    i === current ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80',
                  ].join(' ')}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {imageKeys.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 md:gap-2">
          {imageKeys.slice(0, 5).map((k, idx) => (
            <button
              key={k}
              type="button"
              onClick={() => setCurrent(idx)}
              className={[
                'overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation',
                idx === current ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/30',
              ].join(' ')}
            >
              <R2Image
                fileKey={k}
                alt="Product image thumbnail"
                width={150}
                height={150}
                className="aspect-square object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <ImageDialog
        imageKeys={imageKeys}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialIndex={dialogImageIndex}
      />
    </div>
  )
}

function ImageDialog ({
  imageKeys,
  open,
  onOpenChange,
  initialIndex,
}: {
  imageKeys: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIndex: number
}) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex)

  React.useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const goPrev = React.useCallback(() => {
    setCurrentIndex((c) => (c - 1 + imageKeys.length) % imageKeys.length)
  }, [imageKeys.length])

  const goNext = React.useCallback(() => {
    setCurrentIndex((c) => (c + 1) % imageKeys.length)
  }, [imageKeys.length])

  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange, goPrev, goNext])

  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goNext()
    } else if (isRightSwipe) {
      goPrev()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl p-0 gap-0 bg-black/50 backdrop-blur-sm border-0"
        showCloseButton={true}
      >
        <div
          className="relative w-full max-h-[90vh] flex items-center justify-center p-4 md:p-8"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <R2Image
              key={imageKeys[currentIndex]}
              fileKey={imageKeys[currentIndex]}
              alt={`Product image ${currentIndex + 1}`}
              width={1200}
              height={1200}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              priority
            />
          </div>
          {imageKeys.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={goPrev}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 backdrop-blur-sm px-3 py-3 md:px-4 md:py-4 text-white hover:bg-black/90 hover:scale-110 active:scale-95 transition-all duration-200 touch-manipulation z-10"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={goNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 backdrop-blur-sm px-3 py-3 md:px-4 md:py-4 text-white hover:bg-black/90 hover:scale-110 active:scale-95 transition-all duration-200 touch-manipulation z-10"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-2">
                {imageKeys.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to image ${i + 1}`}
                    onClick={() => setCurrentIndex(i)}
                    className={[
                      'h-2 w-2 md:h-2.5 md:w-2.5 rounded-full transition-all duration-200 touch-manipulation',
                      i === currentIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80',
                    ].join(' ')}
                  />
                ))}
              </div>
              {imageKeys.length > 1 && (
                <div className="absolute bottom-12 md:bottom-16 left-0 right-0 flex justify-center gap-1.5 md:gap-2 px-4 overflow-x-auto">
                    {imageKeys.slice(0, 8).map((k, idx) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={[
                          'flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation',
                          idx === currentIndex ? 'border-white shadow-lg scale-105' : 'border-white/30 hover:border-white/60',
                        ].join(' ')}
                      >
                        <R2Image
                          fileKey={k}
                          alt={`Thumbnail ${idx + 1}`}
                          width={80}
                          height={80}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// R2Image now centralized in src/components/ui/r2-image

// Small error boundary wrapper for client-side rendering issues
import type { Preloaded } from 'convex/react'

interface ProductDetailBoundaryProps {
  slug: string
  orgSlug?: string
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>
  preloadedProduct?: Preloaded<typeof api.products.queries.index.getProductBySlug>
  preloadedRecommendations?: Preloaded<typeof api.products.queries.index.getProductRecommendations>
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
    return (
      <ProductDetail
        slug={this.props.slug}
        orgSlug={this.props.orgSlug}
        preloadedOrganization={this.props.preloadedOrganization}
        preloadedProduct={this.props.preloadedProduct}
        preloadedRecommendations={this.props.preloadedRecommendations}
      />
    )
  }
}


