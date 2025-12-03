'use client';

import React from 'react';
import { motion, type Variant } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  once?: boolean;
  amount?: number | 'some' | 'all';
}

const directionVariants: Record<string, { hidden: Variant; visible: Variant }> = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
};

/**
 * ScrollSection - A wrapper component that animates its children when they come into view
 * Uses Framer Motion's whileInView for scroll-triggered animations
 */
export function ScrollSection({ children, className, delay = 0, direction = 'up', duration = 0.6, once = true, amount = 0.2 }: ScrollSectionProps) {
  const variants = directionVariants[direction];

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: variants.hidden,
        visible: {
          ...variants.visible,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollReveal - Similar to ScrollSection but with blur effect
 */
export function ScrollReveal({ children, className, delay = 0, duration = 0.6, once = true, amount = 0.2 }: Omit<ScrollSectionProps, 'direction'>) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
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

/**
 * ScrollScale - Animates with scale effect on scroll
 */
export function ScrollScale({ children, className, delay = 0, duration = 0.6, once = true, amount = 0.2 }: Omit<ScrollSectionProps, 'direction'>) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, amount }}
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

/**
 * ParallaxSection - Creates a parallax scrolling effect
 */
export function ParallaxSection({ children, className, speed = 0.5 }: { children: React.ReactNode; className?: string; speed?: number }) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ y: 0 }}
      whileInView={{ y: 0 }}
      viewport={{ once: false, amount: 0 }}
      style={{
        willChange: 'transform',
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
}
