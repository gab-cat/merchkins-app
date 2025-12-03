'use client';

import React from 'react';
import { GradientBackground, GridPattern, BeamsBackground } from '@/src/components/ui/backgrounds';
import { Float } from '@/src/components/ui/animations';

/**
 * Full-width animated background for the main platform pages.
 * This creates a consistent, immersive visual experience across all main platform pages.
 */
export function PlatformBackground() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
      {/* Beams with gradient background */}
      <BeamsBackground className="absolute inset-0">
        <GradientBackground variant="subtle" className="absolute inset-0" />
      </BeamsBackground>

      {/* Grid pattern overlay */}
      <GridPattern className="opacity-30" />

      {/* Floating decorative orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <Float amplitude={20} duration={8}>
          <div className="absolute top-[10%] right-[10%] w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        </Float>
        <Float amplitude={15} duration={10}>
          <div className="absolute bottom-[20%] left-[5%] w-72 h-72 rounded-full bg-brand-neon/8 blur-3xl" />
        </Float>
        <Float amplitude={12} duration={12}>
          <div className="absolute top-[40%] left-[15%] w-48 h-48 rounded-full bg-primary/8 blur-2xl" />
        </Float>
        <Float amplitude={18} duration={14}>
          <div className="absolute bottom-[40%] right-[20%] w-56 h-56 rounded-full bg-brand-neon/6 blur-3xl" />
        </Float>
        <Float amplitude={10} duration={9}>
          <div className="absolute top-[60%] right-[35%] w-40 h-40 rounded-full bg-primary/6 blur-2xl" />
        </Float>
      </div>

      {/* Diagonal gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-brand-neon/3" />

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-background/50" />
    </div>
  );
}
