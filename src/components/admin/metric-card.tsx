'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  description?: string;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
  prefix?: string;
  suffix?: string;
}

function AnimatedNumber({ value }: { value: string | number }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  const isNumeric = !isNaN(numericValue);
  const displayValue = typeof value === 'string' ? value : value.toLocaleString();

  if (!isNumeric) {
    return <span>{displayValue}</span>;
  }

  return (
    <motion.span key={value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
      {displayValue}
    </motion.span>
  );
}

function TrendIndicator({ trend }: { trend: MetricCardProps['trend'] }) {
  if (!trend) return null;

  const isPositive = trend.isPositive ?? trend.value > 0;
  const isNeutral = trend.value === 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isNeutral ? 'text-muted-foreground' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

  return (
    <motion.div
      className={cn('flex items-center gap-1 text-xs font-medium', colorClass)}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Icon className="h-3 w-3" />
      <span>
        {trend.value > 0 ? '+' : ''}
        {trend.value}%
      </span>
      {trend.label && <span className="text-muted-foreground font-normal">{trend.label}</span>}
    </motion.div>
  );
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  variant = 'default',
  size = 'md',
  loading = false,
  onClick,
  prefix,
  suffix,
}: MetricCardProps) {
  const variants = {
    default: 'bg-card border border-border shadow-sm',
    gradient: 'bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/20',
    glass: 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30',
    bordered: 'bg-card border-2 border-primary/20 hover:border-primary/40',
  };

  const sizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const valueSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  // Format value with prefix/suffix
  const formattedValue = `${prefix || ''}${typeof value === 'number' ? value.toLocaleString() : value}${suffix || ''}`;

  if (loading) {
    return (
      <div className={cn('rounded-xl', variants[variant], sizes[size], className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-8 w-20 rounded bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          </div>
          <div className={cn('rounded-xl bg-muted animate-pulse', iconSizes[size])} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn('rounded-xl transition-all duration-300', variants[variant], sizes[size], onClick && 'cursor-pointer', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        onClick
          ? {
              y: -4,
              boxShadow: '0 20px 40px -15px rgba(29, 67, 216, 0.15)',
            }
          : undefined
      }
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className={cn('font-bold font-admin-heading tracking-tight', valueSizes[size])}>
            <AnimatedNumber value={formattedValue} />
          </p>
          <TrendIndicator trend={trend} />
          {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
        </div>
        {Icon && (
          <motion.div
            className={cn('rounded-xl bg-primary/10 flex items-center justify-center shrink-0', iconSizes[size])}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Icon className={cn('text-primary', size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6')} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

interface MetricGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricGrid({ children, columns = 3, className }: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {React.Children.map(children, (child, index) => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
          {child}
        </motion.div>
      ))}
    </div>
  );
}

export default MetricCard;
