"use client"

import React, { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
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
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  const joinUrl = (a: string, b: string) =>
    `${a.replace(/\/+$/u, '')}/${String(b).replace(/^\/+/, '')}`

  const computedUrl = (() => {
    if (!fileKey) return null
    if (typeof fileKey === 'string' && /^https?:\/\//u.test(fileKey)) {
      return fileKey
    }
    if (!baseUrl) return null
    return joinUrl(baseUrl, fileKey as string)
  })()

  const placeholder = (
    <div
      className={cn(
        'bg-muted skeleton',
        'transition-opacity duration-300',
        fill ? 'w-full h-full' : '',
        !fill && width && height ? '' : 'aspect-square',
        fallbackClassName,
        className
      )}
      role="img"
      aria-label={alt || 'image placeholder'}
    />
  )

  if (!computedUrl || hasError) return placeholder

  return (
    <div className="relative overflow-hidden">
      <Image
        src={computedUrl}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        className={cn(
          'object-cover transition-all duration-300',
          !isLoaded && 'opacity-0 scale-105',
          isLoaded && 'opacity-100 scale-100',
          className
        )}
        priority={priority}
        sizes={sizes}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        {...rest}
      />
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-muted skeleton',
            fill ? 'w-full h-full' : '',
            !fill && width && height ? '' : 'aspect-square'
          )}
        />
      )}
    </div>
  )
}


