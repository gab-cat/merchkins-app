'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

interface BatchBadgeProps {
  name: string;
  isArchived?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BatchBadge({ name, isArchived = false, className, size = 'sm' }: BatchBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        isArchived ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-200',
        sizeClasses[size],
        className
      )}
    >
      <Tag className={cn('h-3 w-3', size === 'lg' && 'h-4 w-4')} />
      <span>{name}</span>
      {isArchived && <span className="text-xs opacity-70">(archived)</span>}
    </Badge>
  );
}
