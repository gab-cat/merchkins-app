'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminNav } from '@/src/features/admin/components/admin-nav';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

export function AdminHeader() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState('');

  const areaLabel = useMemo(() => {
    if (!pathname) return 'Admin';
    if (pathname.startsWith('/super-admin')) return 'Super Admin';
    return 'Admin';
  }, [pathname]);

  const orgSlug = params.get('org') ?? undefined;

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length === 0) return;
    const base = pathname?.startsWith('/super-admin') ? '/super-admin' : '/admin';
    const qp = new URLSearchParams();
    qp.set('q', q);
    if (orgSlug) qp.set('org', orgSlug);
    window.location.href = `${base}?${qp.toString()}`;
  };

  return (
    <header
      data-testid="admin-header"
      className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60')}
    >
      <div className="relative h-0.5 w-full bg-gradient-to-r from-primary/70 via-primary to-primary/70" />
      <div className="container mx-auto flex h-12 items-center gap-4 px-4">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation" className="h-7 w-7 hover:scale-105 transition-all duration-200">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="px-4 py-3 border-b">
                <div className="text-sm text-muted-foreground">{areaLabel}</div>
                <div className={cn('font-semibold tracking-tight text-base', orgSlug ? '' : 'font-genty')}>
                  {orgSlug ? (
                    `Org: ${orgSlug}`
                  ) : (
                    <>
                      <span className="text-white">Merch</span>
                      <span className="text-brand-neon">kins</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3">
                <AdminNav />
              </div>
            </SheetContent>
          </Sheet>
          <Link
            href={pathname?.startsWith('/super-admin') ? '/super-admin' : '/admin'}
            className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
          >
            <span className="text-base font-semibold tracking-tight font-genty">{areaLabel}</span>
          </Link>
        </div>

        <form onSubmit={onSearch} role="search" className="ml-4 hidden flex-1 items-center gap-2 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${areaLabel.toLowerCase()}...`}
              aria-label="Search admin"
              className="h-8 pl-9 text-sm border-0 bg-muted/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-8 px-4 text-sm hover:scale-105 transition-all duration-200">
            Search
          </Button>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications" className="h-8 w-8 hover:scale-105 transition-all duration-200">
            <Bell className="h-4 w-4" />
          </Button>
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="h-8 px-4 text-sm hover:scale-105 transition-all duration-200">
                Sign in
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: '!size-7 hover:scale-110 transition-transform duration-200',
                  userButtonPopoverCard: 'bg-white border shadow-lg',
                  userButtonPopoverActionButton: 'text-neutral-700 hover:bg-accent/50 transition-colors',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
