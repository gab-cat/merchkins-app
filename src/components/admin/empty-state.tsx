'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileSearch, Package, ShoppingBag, Users, Inbox, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({ icon, title, description, action, className, size = 'md' }: EmptyStateProps) {
  const sizes = {
    sm: { container: 'py-8', icon: 'h-10 w-10', title: 'text-base', desc: 'text-xs' },
    md: { container: 'py-12', icon: 'h-12 w-12', title: 'text-lg', desc: 'text-sm' },
    lg: { container: 'py-16', icon: 'h-16 w-16', title: 'text-xl', desc: 'text-base' },
  };

  const sizeConfig = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center text-center', sizeConfig.container, className)}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn('rounded-full bg-muted/50 p-4 mb-4', sizeConfig.icon)}
      >
        {icon || <Inbox className={cn('text-muted-foreground', sizeConfig.icon)} />}
      </motion.div>
      <h3 className={cn('font-semibold font-admin-heading text-foreground mb-1', sizeConfig.title)}>{title}</h3>
      {description && <p className={cn('text-muted-foreground max-w-sm mb-4', sizeConfig.desc)}>{description}</p>}
      {action && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Button variant={action.variant || 'default'} onClick={action.onClick}>
            <Plus className="h-4 w-4 mr-1" />
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Preset empty states
export function ProductsEmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="h-12 w-12 text-muted-foreground" />}
      title="No products yet"
      description="Get started by creating your first product to showcase in your store."
      action={onCreate ? { label: 'Create Product', onClick: onCreate } : undefined}
    />
  );
}

export function OrdersEmptyState() {
  return (
    <EmptyState
      icon={<ShoppingBag className="h-12 w-12 text-muted-foreground" />}
      title="No orders found"
      description="Orders will appear here once customers start purchasing from your store."
    />
  );
}

export function UsersEmptyState() {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12 text-muted-foreground" />}
      title="No users found"
      description="No users match your current search or filter criteria."
    />
  );
}

export function SearchEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<FileSearch className="h-12 w-12 text-muted-foreground" />}
      title="No results found"
      description={query ? `No results found for "${query}". Try adjusting your search.` : 'Try adjusting your search or filters.'}
    />
  );
}

export function ErrorEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12 text-destructive" />}
      title="Something went wrong"
      description="We couldn't load this data. Please try again."
      action={onRetry ? { label: 'Try Again', onClick: onRetry, variant: 'outline' } : undefined}
    />
  );
}

// Loading skeleton for empty state
export function EmptyStateSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', sizes[size])}>
      <div className="h-12 w-12 rounded-full bg-muted animate-pulse mb-4" />
      <div className="h-5 w-32 rounded bg-muted animate-pulse mb-2" />
      <div className="h-4 w-48 rounded bg-muted animate-pulse" />
    </div>
  );
}

export default EmptyState;
