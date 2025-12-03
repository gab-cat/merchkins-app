'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  blurAmount?: number;
  yOffset?: number;
  once?: boolean;
}

export function BlurFade({ children, className, delay = 0, duration = 0.6, blurAmount = 10, yOffset = 20, once = true }: BlurFadeProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{
        opacity: 0,
        y: yOffset,
        filter: `blur(${blurAmount}px)`,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  scale?: number;
  once?: boolean;
}

export function ScaleIn({ children, className, delay = 0, duration = 0.5, scale = 0.9, once = true }: ScaleInProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{
        opacity: 0,
        scale,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      viewport={{ once, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

interface FloatProps {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}

export function Float({ children, className, amplitude = 10, duration = 3 }: FloatProps) {
  return (
    <motion.div
      className={cn(className)}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

interface PulseGlowProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

export function PulseGlow({ children, className, color = 'rgba(29, 67, 216, 0.5)', duration = 2 }: PulseGlowProps) {
  return (
    <motion.div
      className={cn('relative', className)}
      animate={{
        boxShadow: [`0 0 20px ${color}`, `0 0 40px ${color}`, `0 0 20px ${color}`],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
