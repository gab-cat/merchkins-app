'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { R2Image } from '@/src/components/ui/r2-image';

interface ComboboxOption {
  value: string;
  label: string;
  imageUrl?: string;
  price?: number;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No option found.',
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full justify-between', className)}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {selectedOption?.imageUrl && (
              <div className="h-5 w-5 rounded overflow-hidden border flex-shrink-0">
                <R2Image fileKey={selectedOption.imageUrl} alt={selectedOption.label} width={20} height={20} className="h-full w-full object-cover" />
              </div>
            )}
            <span className="truncate">
              {selectedOption
                ? `${selectedOption.label}${selectedOption.price !== undefined ? ` - ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(selectedOption.price)}` : ''}`
                : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    {option.imageUrl && (
                      <div className="h-10 w-10 rounded-md overflow-hidden border flex-shrink-0">
                        <R2Image fileKey={option.imageUrl} alt={option.label} width={40} height={40} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{option.label}</div>
                      {option.price !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          {new Intl.NumberFormat(undefined, {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(option.price)}
                        </div>
                      )}
                    </div>
                    <Check className={cn('ml-auto h-4 w-4 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
