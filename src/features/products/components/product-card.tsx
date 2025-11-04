'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { R2Image } from '@/src/components/ui/r2-image'
import { fadeInUp } from '@/lib/animations'

export interface ProductCardProps {
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
  orgSlug?: string
  index?: number
  className?: string
}

export function ProductCard ({
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
  const href = orgSlug ? `/o/${orgSlug}/p/${slug}` : `/p/${slug}`
  const formattedPrice = minPrice !== undefined
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(minPrice)
    : ''

  return (
    <Link
      href={href}
      aria-label={`View ${title}`}
      className={`group block h-full ${className}`}
      data-testid="product-card"
    >
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <Card
          className="flex h-full flex-col hover:border-primary/50 hover:shadow-primary/20 overflow-hidden rounded-xl border bg-card shadow-sm py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
          <div className="absolute inset-0 h-full w-full">
            <R2Image
              fileKey={imageUrl?.[0]}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
          </div>
          <div className="pointer-events-none absolute left-1.5 top-1.5 flex flex-wrap gap-1 z-10">
            {isBestPrice && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-medium bg-green-500 text-white border-transparent shadow-sm">
                Best price
              </Badge>
            )}
            {discountLabel && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-medium bg-red-500 text-white border-transparent shadow-sm">
                {discountLabel}
              </Badge>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        </div>
        <CardHeader className="flex-1 space-y-1 p-3 pt-0">
          <CardTitle
            className="line-clamp-2 text-md font-semibold leading-tight text-primary group-hover:text-primary/90 transition-colors"
            data-testid="product-card-title"
          >
            {title}
          </CardTitle>
          {description && (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </CardHeader>
        <CardContent className="flex items-center justify-between p-3 pt-0">
          <div className="flex items-center gap-2">
            {formattedPrice && (
              <span className="text-sm font-bold text-primary" data-testid="product-card-price">
                {formattedPrice}
              </span>
            )}
            {rating && rating > 0 ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star size={12} className="fill-current text-yellow-400" />
                {rating.toFixed(1)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                <Star size={12} className="text-muted-foreground/40" />
                <span className="text-muted-foreground/60">No reviews yet</span>
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-primary font-medium">
            View →
          </span>
        </CardContent>
      </Card>
      </motion.div>
    </Link>
  )
}

