'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type DateRangePreset = '7d' | '14d' | '30d' | 'all' | 'custom';

export interface DateRange {
  dateFrom?: number;
  dateTo?: number;
}

interface DateRangeFilterProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' },
];

function getPresetRange(preset: DateRangePreset): DateRange {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  switch (preset) {
    case '7d':
      return { dateFrom: now - 7 * dayMs, dateTo: now };
    case '14d':
      return { dateFrom: now - 14 * dayMs, dateTo: now };
    case '30d':
      return { dateFrom: now - 30 * dayMs, dateTo: now };
    case 'all':
      return {};
    case 'custom':
      return {};
    default:
      return {};
  }
}

function formatDateForInput(timestamp?: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): number | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) return undefined;
  // Set to start of day in local timezone
  return date.setHours(0, 0, 0, 0);
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [_preset, setPreset] = useState<DateRangePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  // Determine current preset based on value
  const currentPreset = useMemo(() => {
    if (!value?.dateFrom && !value?.dateTo) return 'all';

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const diff = now - (value.dateFrom || 0);

    if (Math.abs(diff - 7 * dayMs) < dayMs) return '7d';
    if (Math.abs(diff - 14 * dayMs) < dayMs) return '14d';
    if (Math.abs(diff - 30 * dayMs) < dayMs) return '30d';

    return 'custom';
  }, [value]);

  const handlePresetChange = (newPreset: DateRangePreset) => {
    setPreset(newPreset);
    if (newPreset === 'custom') {
      setIsCustomOpen(true);
      // Initialize custom inputs from current value
      if (value?.dateFrom) {
        setCustomFrom(formatDateForInput(value.dateFrom));
      }
      if (value?.dateTo) {
        setCustomTo(formatDateForInput(value.dateTo));
      }
    } else {
      setIsCustomOpen(false);
      const range = getPresetRange(newPreset);
      onChange(range);
    }
  };

  const handleCustomApply = () => {
    const dateFrom = parseDateInput(customFrom);
    const dateTo = customTo ? parseDateInput(customTo) : undefined;
    // If dateTo is set, set it to end of day
    const finalDateTo = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : undefined;
    onChange({ dateFrom, dateTo: finalDateTo });
    setIsCustomOpen(false);
  };

  const handleClear = () => {
    setPreset('all');
    setCustomFrom('');
    setCustomTo('');
    setIsCustomOpen(false);
    onChange({});
  };

  const hasActiveFilter = value?.dateFrom || value?.dateTo;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={currentPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[160px] h-9">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentPreset === 'custom' && (
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Calendar className="h-4 w-4 mr-2" />
              {value?.dateFrom || value?.dateTo ? 'Edit Range' : 'Select Range'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Input type="date" value={customFrom || formatDateForInput(value?.dateFrom)} onChange={(e) => setCustomFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Input type="date" value={customTo || formatDateForInput(value?.dateTo)} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsCustomOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCustomApply}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {hasActiveFilter && (
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={handleClear} title="Clear date filter">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
