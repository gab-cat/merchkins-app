'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminNav } from '@/src/features/admin/components/admin-nav';
import { AdminCommandPalette } from '@/src/features/admin/components/admin-command-palette';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

export function AdminHeader() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const areaLabel = useMemo(() => {
    if (!pathname) return 'Admin';
    if (pathname.startsWith('/super-admin')) return 'Super Admin';
    return 'Admin';
  }, [pathname]);

  const orgSlug = params.get('org') ?? undefined;

  // Keyboard shortcut handler (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchClick = () => {
    setIsCommandPaletteOpen(true);
  };

  return (
    <header
      data-testid="admin-header"
      className={cn('sticky top-0 z-50 w-full border-b border-border', 'bg-card/95 backdrop-blur-xl supports-backdrop-filter:bg-card/90', 'relative')}
    >
      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto flex h-14 items-center gap-6 px-6 relative z-10">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation" className="h-9 w-9 rounded-lg hover:bg-muted transition-colors">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-card">
              <div className="px-5 py-4 border-b border-border">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{areaLabel}</div>
                <div className={cn('text-lg font-semibold tracking-tight', orgSlug ? '' : 'font-genty')}>
                  {orgSlug ? (
                    <span className="text-foreground">Org: {orgSlug}</span>
                  ) : (
                    <>
                      <span className="text-foreground">Merch</span>
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
            className="flex items-center transition-colors rounded-md px-2 py-1.5 hover:bg-muted/50"
          >
            <span className="text-sm font-semibold tracking-tight font-admin-heading text-foreground">{areaLabel}</span>
          </Link>
        </div>

        <div className="hidden flex-1 items-center gap-3 md:flex max-w-lg">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              onClick={handleSearchClick}
              onFocus={handleSearchClick}
              readOnly
              placeholder={`Search ${areaLabel.toLowerCase()}...`}
              aria-label="Search admin"
              className="h-9 pl-9 pr-4 text-sm bg-muted/60 border border-border/50 text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-lg transition-all cursor-pointer"
            />
          </div>
          <Button
            onClick={handleSearchClick}
            variant="secondary"
            size="sm"
            className="h-9 px-4 text-sm font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Search
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2" suppressHydrationWarning>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="h-9 w-9 rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-4 w-4" />
          </Button>
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="h-9 px-4 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                Sign in
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: '!size-8 rounded-lg transition-opacity hover:opacity-80',
                  userButtonPopoverCard: 'bg-background border shadow-lg rounded-lg',
                  userButtonPopoverActionButton: 'text-foreground hover:bg-muted transition-colors rounded-md',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
      <AdminCommandPalette open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen} orgSlug={orgSlug} />
    </header>
  );
}

export default AdminHeader;
