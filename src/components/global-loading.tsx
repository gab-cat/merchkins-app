'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalLoadingProps {
  className?: string;
}

export function GlobalLoading({ className }: GlobalLoadingProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setIsVisible(true);
  }, []);

  return (
    <div
      className={cn('fixed inset-0 z-[9999] flex items-center justify-center bg-white', className)}
      aria-live="polite"
      aria-label="Loading"
      role="status"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.02]" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

      {/* Main content */}
      <div
        className={cn(
          'relative flex flex-col items-center gap-8 transition-all duration-500',
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        )}
      >
        {/* Decorative sparkles */}
        <div className="absolute -right-12 -top-8 animate-pulse">
          <Sparkles className="h-5 w-5 text-primary/30" style={{ animationDuration: '2s' }} />
        </div>
        <div className="absolute -bottom-8 -left-12 animate-pulse" style={{ animationDelay: '1s' }}>
          <Sparkles className="h-4 w-4 text-primary/20" style={{ animationDuration: '2s' }} />
        </div>

        {/* Logo Icon Container */}
        <div className="relative h-28 w-28">
          {/* Outer glow ring */}
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" style={{ animationDuration: '2.5s' }} />

          {/* Secondary ring */}
          <div className="absolute inset-2 animate-pulse rounded-full border-2 border-primary/10" style={{ animationDuration: '2s' }} />

          {/* Main icon container */}
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg shadow-primary/5">
            {/* Shopping Bag Icon */}
            <ShoppingBag
              className="h-12 w-12 text-primary drop-shadow-sm"
              style={{
                animation: 'gentle-bounce 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-5">
          <h1 className="relative z-10 inline-flex items-center bg-primary px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-md">
            <span className="font-genty text-4xl md:text-5xl font-bold tracking-wide">
              <span className="text-white">Merch</span>
              <span className="text-brand-neon">kins</span>
            </span>
          </h1>

          {/* Modern loading bar */}
          <div className="relative h-1 w-48 overflow-hidden rounded-full bg-primary/10">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary"
              style={{
                animation: 'loading-bar 1.5s ease-in-out infinite',
              }}
            />
          </div>

          <p className="text-sm font-medium text-muted-foreground">Loading your experience...</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes gentle-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
