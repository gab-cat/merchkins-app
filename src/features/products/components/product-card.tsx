'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingBag } from 'lucide-react';
import { R2Image } from '@/src/components/ui/r2-image';
import { cn } from '@/lib/utils';
import { useOrgLink } from '@/src/hooks/use-org-link';

export interface ProductCardProps {
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
  orgSlug?: string;
  organizationName?: string;
  index?: number;
  className?: string;
}

export function ProductCard({
  _id,
  slug,
  title,
  description,
  imageUrl,
  minPrice,
  rating,
  reviewsCount,
  isBestPrice,
  discountLabel,
  orgSlug,
  organizationName,
  index = 0,
  className = '',
}: ProductCardProps) {
  const { buildOrgLink } = useOrgLink(orgSlug);
  const href = buildOrgLink(`/p/${slug}`);
  const formattedPrice = minPrice !== undefined ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(minPrice) : '';

  return (
    <Link href={href} aria-label={`View ${title}`} className={cn('group block h-full', className)} data-testid={`product-card-${_id}`} prefetch>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
      >
        <Card className="relative flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-card shadow-md py-0 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20">

          {/* Image container - Tighter spacing */}
          <div className="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-secondary to-secondary/50">
            <div className="absolute inset-0 h-full w-full">
              <R2Image
                fileKey={imageUrl?.[0]}
                alt={title}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              />
            </div>

            {/* Badges - Refined positioning */}
            <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5 z-10">
              {isBestPrice && (
                <Badge className="text-[10px] px-2.5 py-1 font-semibold bg-green-500 text-white border-0 shadow-lg shadow-green-500/30 backdrop-blur-sm">
                  Best price
                </Badge>
              )}
              {discountLabel && (
                <Badge className="text-[10px] px-2.5 py-1 font-semibold bg-red-500 text-white border-0 shadow-lg shadow-red-500/30 backdrop-blur-sm">
                  {discountLabel}
                </Badge>
              )}
            </div>


            {/* Quick view indicator - Refined */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold text-primary shadow-xl border border-primary/10">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>View Product</span>
              </div>
            </div>
          </div>

          {/* Content - Tighter spacing */}
          <CardHeader className="flex-1 space-y-1 p-3.5 pt-3 min-h-[85px] relative z-10">
            <CardTitle
              className="line-clamp-2 text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors duration-300 font-outfit"
              data-testid="product-card-title"
            >
              {title}
            </CardTitle>
            {description && <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed mt-1">{description}</p>}
          </CardHeader>

          {/* Footer - Enhanced spacing and hierarchy */}
          <CardContent className="flex items-center justify-between p-3.5 pt-0 relative z-10">
            <div className="flex flex-col gap-0.5">
              {formattedPrice && (
                <span className="text-lg font-bold text-primary font-heading tracking-tight" data-testid="product-card-price">
                  {formattedPrice}
                </span>
              )}
              <div className="flex items-center gap-1">
                {rating && rating > 0 ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                    {reviewsCount && <span className="text-muted-foreground/60">({reviewsCount})</span>}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                    <Star size={12} className="text-muted-foreground/30" />
                    <span>No reviews</span>
                  </span>
                )}
              </div>
              {/* Seller badge */}
              {organizationName && (
                <span className="text-[10px] text-muted-foreground/70 truncate max-w-[140px] mt-0.5">Sold by {organizationName}</span>
              )}
            </div>

            {/* Arrow indicator - Enhanced hover */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="h-8 w-8 rounded-full bg-primary/5 group-hover:bg-primary flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md"
            >
              <svg
                className="h-4 w-4 text-primary/50 group-hover:text-white transition-colors duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
