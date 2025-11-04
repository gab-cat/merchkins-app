import React from 'react';
import { Button } from '@/components/ui/button';

interface LoadMoreProps {
  onClick: () => void;
  disabled?: boolean;
  isVisible?: boolean;
  children?: React.ReactNode;
}

export function LoadMore({ onClick, disabled, isVisible = true, children }: LoadMoreProps) {
  if (!isVisible) return null;
  return (
    <div className="mt-4 flex justify-center">
      <Button onClick={onClick} disabled={disabled} data-testid="load-more">
        {children ?? 'Load more'}
      </Button>
    </div>
  );
}

interface PagerProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pager({ page, pageCount, onPageChange, className }: PagerProps) {
  const pages = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), pages);
  const items = [] as Array<number>;
  for (let i = 1; i <= pages; i++) items.push(i);
  return (
    <div className={['flex items-center gap-2', className || ''].join(' ').trim()}>
      <Button size="sm" variant="outline" onClick={() => onPageChange(current - 1)} disabled={current <= 1}>
        Prev
      </Button>
      {items.map((i) => (
        <Button key={i} size="sm" variant={i === current ? 'default' : 'outline'} onClick={() => onPageChange(i)}>
          {i}
        </Button>
      ))}
      <Button size="sm" variant="outline" onClick={() => onPageChange(current + 1)} disabled={current >= pages}>
        Next
      </Button>
    </div>
  );
}
