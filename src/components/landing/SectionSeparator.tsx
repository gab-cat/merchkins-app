'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionSeparatorProps {
  className?: string;
  label?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'subtle';
}

export function SectionSeparator({ className, label, icon, variant = 'default' }: SectionSeparatorProps) {
  return (
    <div className={cn('relative w-full py-12 md:py-16', className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex items-center justify-center">
          {/* Left line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={cn(
              'flex-1 h-px origin-right',
              variant === 'default' && 'bg-linear-to-r from-transparent via-slate-200 to-slate-200 dark:via-slate-800 dark:to-slate-800',
              variant === 'accent' && 'bg-linear-to-r from-transparent via-[#1d43d8]/20 to-[#1d43d8]/20',
              variant === 'subtle' && 'bg-linear-to-r from-transparent to-slate-100 dark:to-slate-900'
            )}
          />

          {/* Center element */}
          {(label || icon) && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
              className="px-4"
            >
              {icon ? (
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    variant === 'default' && 'bg-slate-100 dark:bg-slate-800',
                    variant === 'accent' && 'bg-[#1d43d8]/10',
                    variant === 'subtle' && 'bg-slate-50 dark:bg-slate-900'
                  )}
                >
                  {icon}
                </div>
              ) : (
                <span
                  className={cn(
                    'text-xs font-medium tracking-[0.2em] uppercase',
                    variant === 'default' && 'text-slate-400',
                    variant === 'accent' && 'text-[#1d43d8]/60',
                    variant === 'subtle' && 'text-slate-300 dark:text-slate-700'
                  )}
                >
                  {label}
                </span>
              )}
            </motion.div>
          )}

          {/* Right line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={cn(
              'flex-1 h-px origin-left',
              variant === 'default' && 'bg-linear-to-l from-transparent via-slate-200 to-slate-200 dark:via-slate-800 dark:to-slate-800',
              variant === 'accent' && 'bg-linear-to-l from-transparent via-[#1d43d8]/20 to-[#1d43d8]/20',
              variant === 'subtle' && 'bg-linear-to-l from-transparent to-slate-100 dark:to-slate-900'
            )}
          />
        </div>

        {/* Decorative dot */}
        {variant === 'accent' && (
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-4 w-1 h-1 rounded-full bg-brand-neon"
          />
        )}
      </div>
    </div>
  );
}
