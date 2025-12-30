'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default' | 'pending';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

const STATUS_STYLES: Record<StatusType, { bg: string; text: string; border: string; dot: string }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  pending: {
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
    dot: 'bg-slate-500',
  },
  default: {
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-800',
    dot: 'bg-gray-500',
  },
};

// Auto-detect status type from common status strings
function detectStatusType(status: string): StatusType {
  const lower = status.toLowerCase();

  if (['active', 'completed', 'delivered', 'paid', 'success', 'approved', 'verified', 'ready'].some((s) => lower.includes(s))) {
    return 'success';
  }
  if (['pending', 'waiting', 'processing', 'in_progress', 'draft'].some((s) => lower.includes(s))) {
    return 'pending';
  }
  if (['warning', 'downpayment', 'partial'].some((s) => lower.includes(s))) {
    return 'warning';
  }
  if (['error', 'failed', 'cancelled', 'canceled', 'rejected', 'refunded', 'inactive', 'deleted'].some((s) => lower.includes(s))) {
    return 'error';
  }
  if (['info', 'new', 'updated'].some((s) => lower.includes(s))) {
    return 'info';
  }

  return 'default';
}

export function StatusBadge({ status, type, pulse = false, size = 'md', className, icon }: StatusBadgeProps) {
  const statusType = type || detectStatusType(status);
  const styles = STATUS_STYLES[statusType];

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        styles.bg,
        styles.text,
        styles.border,
        sizes[size],
        className
      )}
    >
      <span className={cn('rounded-full shrink-0', styles.dot, dotSizes[size], pulse && 'animate-pulse')} />
      {icon}
      <span className="capitalize">{status.toLowerCase().replace(/_/g, ' ')}</span>
    </motion.span>
  );
}

// Preset badges for common order/payment statuses
interface OrderStatusBadgeProps {
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED' | string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const typeMap: Record<string, StatusType> = {
    PENDING: 'pending',
    PROCESSING: 'info',
    READY: 'warning',
    DELIVERED: 'success',
    CANCELLED: 'error',
  };

  return <StatusBadge status={status} type={typeMap[status] || 'default'} className={className} />;
}

interface PaymentStatusBadgeProps {
  status: 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED' | string;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const typeMap: Record<string, StatusType> = {
    PENDING: 'pending',
    DOWNPAYMENT: 'warning',
    PAID: 'success',
    REFUNDED: 'error',
  };

  return <StatusBadge status={status} type={typeMap[status] || 'default'} className={className} />;
}

// Active/Inactive badge
interface ActiveBadgeProps {
  isActive: boolean;
  className?: string;
}

export function ActiveBadge({ isActive, className }: ActiveBadgeProps) {
  return <StatusBadge status={isActive ? 'Active' : 'Inactive'} type={isActive ? 'success' : 'error'} className={className} />;
}

export default StatusBadge;
