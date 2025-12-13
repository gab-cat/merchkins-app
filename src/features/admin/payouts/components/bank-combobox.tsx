'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Building2, Wallet, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface BankChannel {
  code: string;
  type: 'Bank' | 'E-Wallet';
  name: string;
  country: string;
  currency: string;
  minAmount: number;
  maxAmount: number;
  flightTime: string;
}

interface BankComboboxProps {
  value?: string;
  onValueChange: (value: string, bankData?: BankChannel) => void;
  bankName?: string;
  onBankNameChange?: (name: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Parse CSV data from public folder
async function fetchBankData(): Promise<BankChannel[]> {
  try {
    const response = await fetch('/Philippines.csv', {
      cache: 'force-cache',
    });
    const text = await response.text();
    const lines = text.split('\n').filter((line) => line.trim());

    // Skip header line
    const dataLines = lines.slice(1);

    return dataLines
      .map((line) => {
        // Handle CSV with quoted fields containing commas
        const matches = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g);
        if (!matches) return null;

        const fields = matches.map((field) => {
          // Remove leading comma and quotes
          return field.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        });

        return {
          code: fields[0] || '',
          type: fields[1] as 'Bank' | 'E-Wallet',
          name: fields[2] || '',
          country: fields[3] || '',
          currency: fields[4] || '',
          minAmount: parseInt(fields[5] || '0', 10),
          maxAmount: parseInt(fields[6] || '0', 10),
          flightTime: fields[7] || '',
        };
      })
      .filter((item): item is BankChannel => item !== null && item.code !== '');
  } catch (error) {
    console.error('Failed to fetch bank data:', error);
    return [];
  }
}

export function BankCombobox({
  value,
  onValueChange,
  bankName,
  onBankNameChange,
  placeholder = 'Select bank or e-wallet...',
  className,
  disabled = false,
}: BankComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [banks, setBanks] = React.useState<BankChannel[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchBankData().then((data) => {
      setBanks(data);
      setLoading(false);
    });
  }, []);

  const selectedBank = React.useMemo(() => {
    if (value) {
      return banks.find((b) => b.code === value);
    }
    if (bankName) {
      return banks.find((b) => b.name.toLowerCase() === bankName.toLowerCase());
    }
    return undefined;
  }, [value, bankName, banks]);

  const bankChannels = React.useMemo(() => banks.filter((b) => b.type === 'Bank'), [banks]);
  const ewalletChannels = React.useMemo(() => banks.filter((b) => b.type === 'E-Wallet'), [banks]);

  const handleSelect = (bankCode: string) => {
    const bank = banks.find((b) => b.code === bankCode);
    if (bank) {
      onValueChange(bank.code, bank);
      onBankNameChange?.(bank.name);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn('w-full justify-between h-auto min-h-10 py-2 px-3 font-normal', !selectedBank && 'text-muted-foreground', className)}
        >
          {loading ? (
            <span className="text-muted-foreground">Loading banks...</span>
          ) : selectedBank ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={cn(
                  'shrink-0 h-6 w-6 rounded-md flex items-center justify-center',
                  selectedBank.type === 'Bank'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                )}
              >
                {selectedBank.type === 'Bank' ? <Building2 className="h-3.5 w-3.5" /> : <Wallet className="h-3.5 w-3.5" />}
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="font-medium text-foreground truncate w-full text-left">{selectedBank.name}</span>
                <span className="text-xs text-muted-foreground">{selectedBank.code}</span>
              </div>
            </div>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search banks and e-wallets..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No bank or e-wallet found.</p>
              </div>
            </CommandEmpty>

            {bankChannels.length > 0 && (
              <CommandGroup heading="Banks">
                {bankChannels.map((bank) => (
                  <CommandItem
                    key={bank.name}
                    value={`${bank.code} ${bank.name}`}
                    onSelect={() => handleSelect(bank.code)}
                    className="cursor-pointer py-2.5"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="shrink-0 h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{bank.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                            {bank.code}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">• {bank.flightTime}</span>
                        </div>
                      </div>
                      <Check className={cn('shrink-0 h-4 w-4', value === bank.code ? 'opacity-100 text-primary' : 'opacity-0')} />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {ewalletChannels.length > 0 && (
              <CommandGroup heading="E-Wallets">
                {ewalletChannels.map((wallet) => (
                  <CommandItem
                    key={wallet.code}
                    value={`${wallet.code} ${wallet.name}`}
                    onSelect={() => handleSelect(wallet.code)}
                    className="cursor-pointer py-2.5"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="shrink-0 h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{wallet.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4 font-mono bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          >
                            {wallet.code}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">• {wallet.flightTime}</span>
                        </div>
                      </div>
                      <Check className={cn('shrink-0 h-4 w-4', value === wallet.code ? 'opacity-100 text-emerald-600' : 'opacity-0')} />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export type { BankChannel };
