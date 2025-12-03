'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AdminBentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminBentoGrid({ children, className }: AdminBentoGridProps) {
  return <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]', className)}>{children}</div>;
}

interface AdminBentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  variant?: 'default' | 'gradient' | 'glass' | 'bordered' | 'elevated';
  onClick?: () => void;
  href?: string;
}

export function AdminBentoItem({ children, className, colSpan = 1, rowSpan = 1, variant = 'default', onClick, href }: AdminBentoItemProps) {
  const colSpanClasses = {
    1: 'col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
  };

  const rowSpanClasses = {
    1: 'row-span-1',
    2: 'row-span-2',
  };

  const variants = {
    default: 'bg-card border border-border shadow-sm',
    gradient: 'bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/20',
    glass: 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30',
    bordered: 'bg-card border-2 border-primary/20 hover:border-primary/40',
    elevated: 'bg-card border border-border shadow-lg hover:shadow-xl',
  };

  const Component = href ? motion.a : motion.div;
  const interactiveProps =
    onClick || href
      ? {
          whileHover: { y: -4, boxShadow: '0 20px 40px -15px rgba(29, 67, 216, 0.15)' },
          whileTap: { scale: 0.98 },
        }
      : {};

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'rounded-xl p-5 transition-all duration-300 overflow-hidden relative',
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        variants[variant],
        (onClick || href) && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      {...interactiveProps}
    >
      {children}
    </Component>
  );
}

// Featured item with special styling
interface AdminBentoFeaturedProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  backgroundGradient?: boolean;
}

export function AdminBentoFeatured({ children, className, title, description, backgroundGradient = true }: AdminBentoFeaturedProps) {
  return (
    <AdminBentoItem colSpan={2} rowSpan={2} variant="gradient" className={cn('relative overflow-hidden', className)}>
      {backgroundGradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-brand-neon/5 pointer-events-none" />
      )}
      <div className="relative z-10 h-full flex flex-col">
        {(title || description) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-semibold font-admin-heading">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </AdminBentoItem>
  );
}

// Quick action card for bento grid
interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function QuickActionCard({ icon, title, description, onClick, href, className }: QuickActionCardProps) {
  return (
    <AdminBentoItem variant="bordered" onClick={onClick} href={href} className={cn('group', className)}>
      <div className="flex flex-col h-full">
        <motion.div
          className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <span className="text-primary">{icon}</span>
        </motion.div>
        <h4 className="font-semibold font-admin-heading group-hover:text-primary transition-colors">{title}</h4>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        <div className="mt-auto pt-3">
          <span className="text-xs text-primary font-medium group-hover:underline">Get started →</span>
        </div>
      </div>
    </AdminBentoItem>
  );
}

export default AdminBentoGrid;
