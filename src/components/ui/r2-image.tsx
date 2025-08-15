"use client"

import React, { useMemo, useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'

interface R2ImageProps extends Omit<ImageProps, 'src'> {
  fileKey?: string | null
  fallbackClassName?: string
}

export function R2Image ({
  fileKey,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  sizes,
  fallbackClassName,
  ...rest
}: R2ImageProps) {
  const shouldQuery = Boolean(fileKey)
  const url = useQuery(
    api.files.queries.index.getFileUrl,
    shouldQuery ? { key: fileKey as string } : 'skip'
  )

  const [hasError, setHasError] = useState(false)

  const placeholder = (
    <div
      className={cn(
        'bg-secondary animate-pulse',
        fill ? 'w-full h-full' : '',
        !fill && width && height ? '' : 'aspect-square',
        fallbackClassName,
        className
      )}
      role="img"
      aria-label={alt || 'image placeholder'}
    />
  )

  if (!fileKey || !url || hasError) return placeholder

  return (
    <Image
      src={url}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      onError={() => setHasError(true)}
      {...rest}
    />
  )
}


