'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMutation, useQuery, usePreloadedQuery } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { R2Image } from '@/src/components/ui/r2-image';
import {
  Star,
  Share2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  Store,
  ExternalLink,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useCartSheetStore } from '@/src/stores/cart-sheet';
import { computeEffectivePrice } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProductCard } from './product-card';
import { ProductReviewForm } from './product-review-form';
import { ProductReviewsList } from './product-reviews-list';
import { VariantSelectionDialog } from './variant-selection-dialog';
import { JoinOrganizationDialog } from '@/src/features/organizations/components/join-organization-dialog';
import { useOrganizationMembership } from '@/src/hooks/use-organization-membership';
import { useRequireAuth } from '@/src/features/auth/hooks/use-require-auth';
import { SignInRequiredDialog } from '@/src/features/auth/components/sign-in-required-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { BlurFade } from '@/src/components/ui/animations/effects';

interface ProductDetailProps {
  slug: string;
  orgSlug?: string;
  preloadedProduct?: Preloaded<typeof api.products.queries.index.getProductBySlug>;
  preloadedRecommendations?: Preloaded<typeof api.products.queries.index.getProductRecommendations>;
}

export function ProductDetail({ slug, orgSlug, preloadedProduct, preloadedRecommendations }: ProductDetailProps) {
  // TODO: replace with dynamic value
  if (slug === '_error_test_') {
    throw new Error('Intentional test error for error boundary validation');
  }
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userId: clerkId } = useAuth();
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');
  const { requireAuth, dialogOpen, setDialogOpen } = useRequireAuth();
  const product = preloadedProduct ? usePreloadedQuery(preloadedProduct) : useQuery(api.products.queries.index.getProductBySlug, { slug });
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationById,
    product?.organizationId ? { organizationId: product.organizationId } : 'skip'
  );
  const recommendations = preloadedRecommendations
    ? usePreloadedQuery(preloadedRecommendations)
    : useQuery(api.products.queries.index.getProductRecommendations, product?._id ? { productId: product._id, limit: 8 } : 'skip');

  type RecommendedProduct = {
    _id: string;
    slug: string;
    title: string;
    description?: string;
    imageUrl?: string[];
    minPrice?: number;
    rating?: number;
    reviewsCount?: number;
    isBestPrice?: boolean;
    discountLabel?: string;
  };
  const recommended: RecommendedProduct[] = (recommendations?.products as unknown as RecommendedProduct[]) || [];
  const addItem = useMutation(api.carts.mutations.index.addItem);
  const openCartSheet = useCartSheetStore((s) => s.open);

  // Organization membership check for PUBLIC org products
  const { isAuthenticated, isMember } = useOrganizationMembership(product?.organizationId || '');

  const activeVariants = useMemo(() => (product?.variants ?? []).filter((v) => v.isActive), [product]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>(undefined);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;
    if (!selectedVariantId) return undefined;
    return product.variants.find((v) => v.variantId === selectedVariantId);
  }, [product, selectedVariantId]);

  const selectedSize = useMemo(() => {
    if (!selectedVariant?.sizes) return undefined;
    if (!selectedSizeId) return undefined;
    return selectedVariant.sizes.find((s) => s.id === selectedSizeId);
  }, [selectedVariant, selectedSizeId]);

  // Auto-select single variant and size when applicable
  React.useEffect(() => {
    if (product && activeVariants.length === 1 && !selectedVariantId) {
      const singleVariant = activeVariants[0];
      setSelectedVariantId(singleVariant.variantId);

      // Auto-select size if there's exactly one size
      if (singleVariant.sizes && singleVariant.sizes.length === 1) {
        setSelectedSizeId(singleVariant.sizes[0].id);
      }
    }
  }, [product, activeVariants, selectedVariantId]);

  // Auto-select size when variant changes and has exactly one size
  React.useEffect(() => {
    if (selectedVariant && selectedVariant.sizes && selectedVariant.sizes.length === 1 && !selectedSizeId) {
      setSelectedSizeId(selectedVariant.sizes[0].id);
    }
  }, [selectedVariant, selectedSizeId]);

  const price = selectedVariant
    ? computeEffectivePrice(selectedVariant, selectedSize)
    : (product?.minPrice ?? product?.maxPrice ?? product?.supposedPrice ?? 0);
  // PREORDER products always have infinite stock, STOCK products check inventory
  const inStock = product?.inventoryType === 'PREORDER' || (selectedVariant?.inventory ?? product?.inventory ?? 0) > 0;

  async function handleAddToCart() {
    requireAuth(async () => {
      if (!product) return;

      // Check if variant selection is required
      if (activeVariants.length > 0 && !selectedVariantId) {
        showToast({ type: 'warning', title: 'Please select a variant first' });
        return;
      }

      // Check if size selection is required for the selected variant
      const variantHasSizes = selectedVariant?.sizes && selectedVariant.sizes.length > 0;
      if (selectedVariantId && variantHasSizes && !selectedSizeId) {
        showToast({ type: 'warning', title: 'Please select a size for this variant' });
        return;
      }

      // Check organization membership for PUBLIC org products
      if (organization?.organizationType === 'PUBLIC' && !isMember) {
        if (!isAuthenticated) {
          // Redirect to sign-in with return URL
          const currentUrl =
            typeof window !== 'undefined'
              ? `${window.location.origin}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
              : '';
          const signInUrl = `/sign-in?redirectUrl=${encodeURIComponent(currentUrl)}`;
          router.push(signInUrl);
          return;
        }
        setJoinDialogOpen(true);
        return;
      }

      try {
        const size =
          selectedSizeId && selectedSize
            ? {
                id: selectedSize.id,
                label: selectedSize.label,
                price: selectedSize.price,
              }
            : undefined;

        await addItem({
          productId: product._id,
          variantId: selectedVariantId,
          size,
          quantity: 1,
        });
        openCartSheet();
      } catch {
        showToast({ type: 'error', title: 'Failed to add to cart' });
      }
    });
  }

  async function handleShare() {
    if (!product || !organization) return;

    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const host = typeof window !== 'undefined' ? window.location.host : '';

    // Use subdomain format for production, regular path format for localhost
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const shareUrl = isLocalhost
      ? `${protocol}//${host}/o/${organization.slug}/p/${product.slug}`
      : `${protocol}//${organization.slug}.${host}/o/${organization.slug}/p/${product.slug}`;

    const shareData = {
      title: product.title,
      text: product.description ?? product.title,
      url: shareUrl,
    };

    try {
      if (navigator.share && shareData.url) {
        await navigator.share(shareData);
      } else if (shareData.url) {
        await navigator.clipboard.writeText(shareData.url);
        showToast({ type: 'success', title: 'Link copied to clipboard!' });
      }
    } catch (err) {
      console.error('Share failed', err);
      showToast({ type: 'error', title: 'Failed to share product' });
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
    );
  }

  if (product === null) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="product-detail">
      {/* Hero section with product */}
      <section className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-2">
            {/* Gallery Section */}
            <BlurFade delay={0.1}>
              <div className="space-y-4">
                <ProductGallery imageKeys={product.imageUrl} />
              </div>
            </BlurFade>

            {/* Product Info Section */}
            <div className="space-y-6">
              {/* Title and rating */}
              <BlurFade delay={0.2}>
                <div className="space-y-3">
                  <h1
                    className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight font-outfit"
                    data-testid="product-title"
                  >
                    {product.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {product.rating !== undefined && product.rating !== null && product.rating > 0 && product.reviewsCount > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-yellow-700">{product.rating.toFixed(1)}</span>
                        <span className="text-yellow-600/80">({product.reviewsCount} reviews)</span>
                      </div>
                    )}
                    {product.totalOrders !== undefined && product.totalOrders !== null && product.totalOrders > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">{product.totalOrders} orders</span>
                      </div>
                    )}
                  </div>
                </div>
              </BlurFade>

              {/* Price */}
              <BlurFade delay={0.25}>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-primary font-heading" data-testid="product-price">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(price)}
                  </span>
                  {product.supposedPrice && product.supposedPrice > price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(product.supposedPrice)}
                    </span>
                  )}
                </div>
              </BlurFade>

              {/* Description */}
              {product.description && (
                <BlurFade delay={0.3}>
                  <p className="text-base text-muted-foreground leading-relaxed">{product.description}</p>
                </BlurFade>
              )}

              {/* Tags */}
              {product.tags?.length > 0 && (
                <BlurFade delay={0.35}>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="text-xs px-3 py-1.5 capitalize rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </BlurFade>
              )}

              {/* Variant Selection - Only show if there are multiple variants OR multiple sizes */}
              {activeVariants.length > 0 && (activeVariants.length > 1 || (selectedVariant?.sizes && selectedVariant.sizes.length > 1)) && (
                <BlurFade delay={0.4}>
                  <div className="space-y-3">
                    <span className="text-sm font-semibold text-foreground">Select Variant & Size</span>
                    <motion.div
                      className="flex items-stretch gap-3 p-4 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/[0.02] hover:border-primary/40 hover:bg-primary/[0.04] transition-all duration-300 cursor-pointer"
                      onClick={() => setVariantDialogOpen(true)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex-1 flex items-center">
                        {selectedVariant ? (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Check className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{selectedVariant.variantName}</div>
                                {selectedSize && <div className="text-sm text-muted-foreground">Size: {selectedSize.label}</div>}
                              </div>
                            </div>
                            <span className="text-lg font-bold text-primary">
                              {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(price)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="text-muted-foreground">Tap to select variant</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    {!selectedVariant && <span className="text-xs text-red-500 font-medium">Please select a variant to continue</span>}
                    {selectedVariant && selectedVariant.sizes && selectedVariant.sizes.length > 1 && !selectedSizeId && (
                      <span className="text-xs text-red-500 font-medium">Please select a size to continue</span>
                    )}
                  </div>
                </BlurFade>
              )}

              {/* Status badges */}
              <BlurFade delay={0.45}>
                <div className="flex flex-wrap items-center gap-2">
                  {product.inventoryType === 'PREORDER' ? (
                    <Badge
                      variant="outline"
                      data-testid="inventory-status"
                      className="text-xs px-3 py-1.5 font-medium rounded-full border-orange-200 bg-orange-50 text-orange-700"
                    >
                      <Sparkles className="h-3 w-3 mr-1.5" /> Preorder Available
                    </Badge>
                  ) : inStock ? (
                    <Badge
                      variant="secondary"
                      data-testid="inventory-status"
                      className="text-xs px-3 py-1.5 font-medium bg-green-50 text-green-700 border border-green-200 rounded-full"
                    >
                      <span className="mr-1.5">✓</span> In stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" data-testid="inventory-status" className="text-xs px-3 py-1.5 font-medium rounded-full">
                      <span className="mr-1.5">✗</span> Out of stock
                    </Badge>
                  )}
                  {product.isBestPrice && (
                    <Badge className="text-xs px-3 py-1.5 font-medium bg-brand-neon text-black rounded-full border-0 shadow-lg shadow-brand-neon/25">
                      Best price
                    </Badge>
                  )}
                </div>
              </BlurFade>

              {/* CTA buttons */}
              <BlurFade delay={0.5}>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={Boolean(
                      // PREORDER products are always available, only check stock for STOCK products
                      (product.inventoryType === 'STOCK' && !inStock) ||
                        (activeVariants.length > 0 && !selectedVariantId) ||
                        (selectedVariantId && selectedVariant?.sizes && selectedVariant.sizes.length > 0 && !selectedSizeId)
                    )}
                    aria-label="Add to cart"
                    className="group relative overflow-hidden flex-1 h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {product.inventoryType === 'PREORDER' || inStock ? (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {product.inventoryType === 'PREORDER' ? 'Preorder now' : 'Add to cart'}
                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
                    className="group flex-1 h-14 text-base font-semibold rounded-2xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                  >
                    <Share2 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Share
                  </Button>
                </div>
              </BlurFade>

              {/* Organization Info Card */}
              {organization && (
                <BlurFade delay={0.55}>
                  <motion.div className="rounded-2xl border bg-card p-5 space-y-4 transition-all duration-300" whileHover={{ y: -2 }}>
                    <div className="flex items-start gap-4">
                      {organization.logo ? (
                        <R2Image
                          fileKey={organization.logo}
                          alt={`${organization.name} logo`}
                          width={48}
                          height={48}
                          className="h-12 w-12 flex-shrink-0 rounded-xl object-cover ring-2 ring-primary/10"
                        />
                      ) : (
                        <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                          {organization.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Store className="h-4 w-4 text-primary flex-shrink-0" />
                          <Link
                            href={`/o/${organization.slug}`}
                            className="font-bold text-foreground hover:text-primary transition-colors text-lg"
                            prefetch
                          >
                            {organization.name}
                          </Link>
                        </div>
                        {organization.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{organization.description}</p>}
                      </div>
                      <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-full">
                        <Link href={`/o/${organization.slug}`} className="text-primary hover:text-primary/80" prefetch>
                          Visit <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                </BlurFade>
              )}

              {/* Review form - compact inline */}
              <BlurFade delay={0.6}>{product._id && <ProductReviewForm productId={product._id} />}</BlurFade>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews section - more compact */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <BlurFade delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight font-heading">Reviews</h2>
                </div>
                {product.reviewsCount !== undefined && product.reviewsCount > 0 && (
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">{product.reviewsCount}</span>
                )}
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>{product._id && <ProductReviewsList productId={product._id} currentUserId={currentUser?._id} />}</BlurFade>
        </div>
      </section>

      {/* Recommended products */}
      {recommended.length > 0 && (
        <section className="py-8 md:py-10 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent">
          <div className="container mx-auto px-4 sm:px-6">
            <BlurFade delay={0.1}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight font-heading">You might also like</h2>
                  </div>
                </div>
                {organization?.slug && (
                  <Link
                    className="group inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-all duration-200"
                    href={`/o/${organization.slug}/search`}
                  >
                    <span>View more</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </BlurFade>

            <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
          </div>
        </section>
      )}

      {/* Variant Selection Dialog */}
      {product && (
        <VariantSelectionDialog
          open={variantDialogOpen}
          onOpenChange={setVariantDialogOpen}
          productTitle={product.title}
          productImages={product.imageUrl}
          variants={product.variants}
          selectedVariantId={selectedVariantId}
          selectedSizeId={selectedSizeId}
          onVariantChange={setSelectedVariantId}
          onSizeChange={setSelectedSizeId}
          onConfirm={() => setVariantDialogOpen(false)}
          inventoryType={product.inventoryType}
        />
      )}

      {/* Sign In Required Dialog */}
      <SignInRequiredDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Join Organization Dialog */}
      <JoinOrganizationDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        organizationId={product?.organizationId || ''}
        organizationName={organization?.name || ''}
        organizationLogoUrl={organization?.logo}
        organizationBannerUrl={organization?.bannerImage}
        organizationSlug={organization?.slug}
        onJoined={async () => {
          // Retry the add-to-cart after joining
          try {
            const size =
              selectedSizeId && selectedSize
                ? {
                    id: selectedSize.id,
                    label: selectedSize.label,
                    price: selectedSize.price,
                  }
                : undefined;

            await addItem({
              productId: product!._id,
              variantId: selectedVariantId,
              size,
              quantity: 1,
            });
            openCartSheet();
          } catch {
            showToast({ type: 'error', title: 'Failed to add to cart' });
          }
        }}
      />
    </div>
  );
}

function ProductGallery({ imageKeys }: { imageKeys: string[] }) {
  const [current, setCurrent] = React.useState(0);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogImageIndex, setDialogImageIndex] = React.useState(0);

  if (!imageKeys || imageKeys.length === 0) {
    return <div className="h-[500px] md:h-[600px] w-full rounded-3xl bg-secondary skeleton" />;
  }

  const goPrev = () => setCurrent((c) => (c - 1 + imageKeys.length) % imageKeys.length);
  const goNext = () => setCurrent((c) => (c + 1) % imageKeys.length);

  const handleImageClick = () => {
    setDialogImageIndex(current);
    setDialogOpen(true);
  };

  return (
    <div className="w-full space-y-4">
      {/* Main image */}
      <motion.div
        className="relative overflow-hidden rounded-3xl shadow-2xl shadow-primary/10 group cursor-pointer"
        onClick={handleImageClick}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-brand-neon/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

        <div className="h-[400px] md:h-[550px] mx-auto flex items-center justify-center bg-gradient-to-br from-secondary via-secondary/80 to-secondary/60 relative">
          <R2Image
            key={imageKeys[current]}
            fileKey={imageKeys[current]}
            alt="Product image"
            width={800}
            height={600}
            className="rounded-3xl object-cover object-center animate-in fade-in transition-transform duration-500 group-hover:scale-105"
          />

          {/* Zoom indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-4 shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
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
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-3 text-foreground shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 z-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-3 text-foreground shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 z-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
              {imageKeys.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent(i);
                  }}
                  className={[
                    'h-2.5 rounded-full transition-all duration-300 touch-manipulation',
                    i === current ? 'bg-primary w-8 shadow-lg' : 'bg-white/80 w-2.5 hover:bg-white',
                  ].join(' ')}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Thumbnails */}
      {imageKeys.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {imageKeys.slice(0, 5).map((k, idx) => (
            <motion.button
              key={k}
              type="button"
              onClick={() => setCurrent(idx)}
              className={[
                'relative overflow-hidden rounded-xl transition-all duration-300 touch-manipulation aspect-square',
                idx === current
                  ? 'ring-2 ring-primary ring-offset-2 shadow-lg'
                  : 'ring-1 ring-border hover:ring-primary/50 opacity-70 hover:opacity-100',
              ].join(' ')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <R2Image fileKey={k} alt="Product image thumbnail" fill className="object-cover" sizes="100px" />
            </motion.button>
          ))}
        </div>
      )}
      <ImageDialog imageKeys={imageKeys} open={dialogOpen} onOpenChange={setDialogOpen} initialIndex={dialogImageIndex} />
    </div>
  );
}

function ImageDialog({
  imageKeys,
  open,
  onOpenChange,
  initialIndex,
}: {
  imageKeys: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex: number;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
    setImageLoaded(false); // Reset loading state when index changes
  }, [initialIndex]);

  const goPrev = React.useCallback(() => {
    setCurrentIndex((c) => (c - 1 + imageKeys.length) % imageKeys.length);
    setImageLoaded(false);
  }, [imageKeys.length]);

  const goNext = React.useCallback(() => {
    setCurrentIndex((c) => (c + 1) % imageKeys.length);
    setImageLoaded(false);
  }, [imageKeys.length]);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, goPrev, goNext]);

  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl p-0 gap-0 bg-black/50 backdrop-blur-sm border-0" showCloseButton={true}>
        <DialogTitle className="sr-only">Product Image Gallery</DialogTitle>
        <div
          className="relative w-full h-[90vh] max-h-[90vh] flex items-center justify-center p-4 md:p-8"
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
              className={`max-w-full max-h-[85vh] object-contain rounded-lg transition-all duration-300 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              priority
              onLoad={() => setImageLoaded(true)}
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
                <div className="absolute bottom-12 md:bottom-16 left-0 right-0 flex justify-center gap-1.5 md:gap-2 px-4 py-2 overflow-x-auto">
                  {imageKeys.slice(0, 8).map((k, idx) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={[
                        'relative z-10 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation',
                        idx === currentIndex ? 'border-primary shadow-lg scale-105' : 'border-primary/50 hover:border-primary/70',
                      ].join(' ')}
                    >
                      <R2Image fileKey={k} alt={`Thumbnail ${idx + 1}`} width={80} height={80} className="w-16 h-16 md:w-20 md:h-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// R2Image now centralized in src/components/ui/r2-image

// Small error boundary wrapper for client-side rendering issues
import type { Preloaded } from 'convex/react';

interface ProductDetailBoundaryProps {
  slug: string;
  orgSlug?: string;
  preloadedProduct?: Preloaded<typeof api.products.queries.index.getProductBySlug>;
  preloadedRecommendations?: Preloaded<typeof api.products.queries.index.getProductRecommendations>;
}

export class ProductDetailBoundary extends React.Component<ProductDetailBoundaryProps, { hasError: boolean }> {
  constructor(props: ProductDetailBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // TODO: replace with dynamic value: send to monitoring service
    console.error('ProductDetail render error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-24" data-testid="product-detail-fallback">
          <div className="mx-auto max-w-xl rounded-lg border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold">We hit a snag</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please refresh the page or try again later.</p>
            <div className="mt-6">
              <Button onClick={() => this.setState({ hasError: false })}>Try again</Button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <ProductDetail
        slug={this.props.slug}
        orgSlug={this.props.orgSlug}
        preloadedProduct={this.props.preloadedProduct}
        preloadedRecommendations={this.props.preloadedRecommendations}
      />
    );
  }
}
