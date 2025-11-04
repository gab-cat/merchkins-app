'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Package, Sparkles } from 'lucide-react';
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
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary/95 via-primary/90 to-primary/95 backdrop-blur-md',
        className
      )}
      aria-live="polite"
      aria-label="Loading"
      role="status"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite',
          }}
        />
      </div>

      {/* Floating Card */}
      <div
        className={cn(
          'relative flex flex-col items-center gap-8 rounded-3xl bg-white px-16 py-12 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-100',
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        )}
      >
        {/* Decorative sparkles */}
        <div className="absolute -right-3 -top-3 animate-pulse">
          <Sparkles className="h-6 w-6 text-primary/60" style={{ animationDuration: '2s' }} />
        </div>
        <div className="absolute -bottom-3 -left-3 animate-pulse" style={{ animationDelay: '1s' }}>
          <Sparkles className="h-5 w-5 text-primary/40" style={{ animationDuration: '2s' }} />
        </div>
        <div className="absolute right-8 top-8 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <div className="h-2 w-2 rounded-full bg-primary/30" style={{ animationDuration: '2s' }} />
        </div>

        {/* Brand Logo/Icon Container */}
        <div className="relative h-32 w-32">
          {/* Outer glow ring */}
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-20" style={{ animationDuration: '2s' }} />

          {/* Main icon container with gradient */}
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 shadow-inner">
            {/* Shopping Bag - Main Icon with bounce */}
            <ShoppingBag className="h-16 w-16 animate-bounce text-primary drop-shadow-lg" style={{ animationDuration: '1.5s' }} />

            {/* Orbiting Package Icon 1 */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
              <Package className="absolute -right-3 top-2 h-8 w-8 text-primary/70 drop-shadow-md" />
            </div>

            {/* Orbiting Package Icon 2 */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse', animationDelay: '2s' }}>
              <Package className="absolute -left-3 bottom-2 h-8 w-8 text-primary/70 drop-shadow-md" />
            </div>

            {/* Accent circle */}
            <div
              className="absolute inset-0 animate-pulse rounded-full border-2 border-primary/20"
              style={{
                animationDuration: '3s',
                filter: 'blur(1px)',
              }}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-genty !text-primary text-5xl font-bold tracking-wide">Merchkins</h1>

          {/* Loading indicator dots */}
          <div className="flex gap-2">
            <span
              className="h-3 w-3 animate-bounce rounded-full bg-primary shadow-lg"
              style={{
                animationDelay: '0s',
                animationDuration: '1s',
              }}
            />
            <span
              className="h-3 w-3 animate-bounce rounded-full bg-primary shadow-lg"
              style={{
                animationDelay: '0.2s',
                animationDuration: '1s',
              }}
            />
            <span
              className="h-3 w-3 animate-bounce rounded-full bg-primary shadow-lg"
              style={{
                animationDelay: '0.4s',
                animationDuration: '1s',
              }}
            />
          </div>

          <p className="text-base font-medium text-primary/80">Preparing your experience</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  );
}
