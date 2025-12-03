'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'subtle' | 'dark' | 'neon';
  animated?: boolean;
}

export function GradientBackground({ children, className, variant = 'primary', animated = true }: GradientBackgroundProps) {
  const gradients = {
    primary: 'from-primary/20 via-primary/5 to-accent/10',
    subtle: 'from-primary/5 via-transparent to-accent/5',
    dark: 'from-primary via-primary/80 to-primary/60',
    neon: 'from-primary/30 via-brand-neon/10 to-primary/30',
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        className={cn('absolute inset-0 bg-gradient-to-br', gradients[variant])}
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: 1 } : undefined}
        transition={{ duration: 1 }}
      />
      {animated && (
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(29, 67, 216, 0.15), transparent 50%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface GridPatternProps {
  className?: string;
  size?: number;
  color?: string;
}

export function GridPattern({ className, size = 40, color = 'rgba(29, 67, 216, 0.05)' }: GridPatternProps) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

interface DotPatternProps {
  className?: string;
  size?: number;
  color?: string;
  spacing?: number;
}

export function DotPattern({ className, size = 1, color = 'rgba(29, 67, 216, 0.15)', spacing = 20 }: DotPatternProps) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        backgroundImage: `radial-gradient(${color} ${size}px, transparent ${size}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
      }}
    />
  );
}

interface BeamsBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function BeamsBackground({ children, className }: BeamsBackgroundProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[2px] w-[400px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              left: '-400px',
              rotate: `${-15 + i * 5}deg`,
            }}
            animate={{
              x: [0, 1500],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2,
            }}
          />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
