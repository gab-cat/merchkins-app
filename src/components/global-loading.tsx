'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, Package, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlobalLoadingProps {
  className?: string
}

export function GlobalLoading ({ className }: GlobalLoadingProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger fade-in animation
    setIsVisible(true)
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-md',
        className
      )}
      aria-live="polite"
      aria-label="Loading"
      role="status"
    >
      {/* Floating Card */}
      <div 
        className={cn(
          'relative flex flex-col items-center gap-6 rounded-2xl bg-white px-12 py-10 shadow-2xl transition-all duration-500',
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        )}
      >
        {/* Decorative sparkles */}
        <div className="absolute -right-2 -top-2 animate-pulse">
          <Sparkles className="h-5 w-5 text-primary" style={{ animationDuration: '2s' }} />
        </div>
        <div className="absolute -bottom-2 -left-2 animate-pulse" style={{ animationDelay: '1s' }}>
          <Sparkles className="h-4 w-4 text-primary/60" style={{ animationDuration: '2s' }} />
        </div>

        {/* Animated Icon Container */}
        <div className="relative h-24 w-24">
          {/* Background pulse effect */}
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
          
          {/* Main icon container */}
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary/10">
            {/* Shopping Bag - Main Icon with bounce */}
            <ShoppingBag 
              className="h-12 w-12 animate-bounce text-primary" 
              style={{ animationDuration: '1.5s' }} 
            />
            
            {/* Orbiting Package Icon */}
            <div 
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: '4s' }}
            >
              <Package 
                className="absolute -right-2 top-0 h-6 w-6 text-primary/60" 
              />
            </div>
            
            {/* Second Orbiting Package Icon */}
            <div 
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: '4s', animationDirection: 'reverse', animationDelay: '2s' }}
            >
              <Package 
                className="absolute -left-2 bottom-0 h-6 w-6 text-primary/60" 
              />
            </div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            Loading
          </h3>
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0s', animationDuration: '1s' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.2s', animationDuration: '1s' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.4s', animationDuration: '1s' }} />
          </div>
          <p className="text-sm text-muted-foreground">
            Preparing your experience
          </p>
        </div>
      </div>
    </div>
  )
}

