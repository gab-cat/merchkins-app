'use client';

import { useDebounce } from 'use-debounce';

/**
 * Hook for debouncing search input values
 * @param value - The search value to debounce
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns The debounced search value
 */
export function useDebouncedSearch(value: string, delay = 300): string {
  const [debouncedValue] = useDebounce(value, delay);
  return debouncedValue;
}
