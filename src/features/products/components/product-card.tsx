'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingBag } from 'lucide-react';
import { R2Image } from '@/src/components/ui/r2-image';
import { cn } from '@/lib/utils';

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
  index = 0,
  className = '',
}: ProductCardProps) {
  const href = orgSlug ? `/o/${orgSlug}/p/${slug}` : `/p/${slug}`;
  const formattedPrice = minPrice !== undefined ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(minPrice) : '';

  return (
    <Link href={href} aria-label={`View ${title}`} className={cn('group block h-full', className)} data-testid="product-card" prefetch>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -8 }}
        className="h-full"
      >
        <Card className="relative flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-card shadow-md py-0 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10">
          {/* Gradient border effect on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-[1px] rounded-2xl bg-card" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/50 via-transparent to-brand-neon/30" />
          </div>

          {/* Image container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-secondary to-secondary/50">
            <div className="absolute inset-0 h-full w-full">
              <R2Image
                fileKey={imageUrl?.[0]}
                alt={title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              />
            </div>

            {/* Badges */}
            <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5 z-10">
              {isBestPrice && (
                <Badge className="text-[10px] px-2 py-0.5 font-semibold bg-green-500 text-white border-0 shadow-lg shadow-green-500/25">
                  Best price
                </Badge>
              )}
              {discountLabel && (
                <Badge className="text-[10px] px-2 py-0.5 font-semibold bg-red-500 text-white border-0 shadow-lg shadow-red-500/25">
                  {discountLabel}
                </Badge>
              )}
            </div>

            {/* Hover overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10" />

            {/* Quick view indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-primary shadow-lg">
                <ShoppingBag className="h-3 w-3" />
                <span>View Product</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <CardHeader className="flex-1 space-y-1.5 p-4 pt-3 min-h-[90px] relative z-10">
            <CardTitle
              className="line-clamp-2 text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors duration-300 font-heading"
              data-testid="product-card-title"
            >
              {title}
            </CardTitle>
            {description && <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">{description}</p>}
          </CardHeader>

          {/* Footer */}
          <CardContent className="flex items-center justify-between p-4 pt-0 relative z-10">
            <div className="flex flex-col gap-1">
              {formattedPrice && (
                <span className="text-lg font-bold text-primary font-heading" data-testid="product-card-price">
                  {formattedPrice}
                </span>
              )}
              <div className="flex items-center gap-1">
                {rating && rating > 0 ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                    {reviewsCount && <span className="text-muted-foreground/60">({reviewsCount})</span>}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                    <Star size={12} className="text-muted-foreground/30" />
                    <span>No reviews</span>
                  </span>
                )}
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="h-8 w-8 rounded-full bg-primary/5 group-hover:bg-primary flex items-center justify-center transition-all duration-300">
              <svg
                className="h-4 w-4 text-primary/50 group-hover:text-white transition-colors duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
