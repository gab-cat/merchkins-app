'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminNav } from '@/src/features/admin/components/admin-nav';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { GradientBackground, GridPattern } from '@/src/components/ui/backgrounds';

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
      className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 relative overflow-hidden')}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <GradientBackground variant="subtle" className="opacity-50" />
        <GridPattern className="opacity-20" size={30} />
      </div>

      {/* Enhanced animated gradient accent bar */}
      <motion.div
        className="relative h-0.5 w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(29, 67, 216, 0.7), rgba(29, 67, 216, 1), rgba(29, 67, 216, 0.7), transparent)',
        }}
        animate={{
          backgroundPosition: ['0%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="container mx-auto flex h-12 items-center gap-4 px-4 relative z-10">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation"
                  className="h-7 w-7 transition-all duration-300 rounded-lg hover:bg-primary/10 hover:text-primary"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="px-4 py-3 border-b bg-gradient-to-br from-primary/5 to-transparent">
                <div className="text-sm text-muted-foreground font-medium">{areaLabel}</div>
                <motion.div
                  className={cn('font-semibold tracking-tight text-base', orgSlug ? '' : 'font-genty')}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {orgSlug ? (
                    `Org: ${orgSlug}`
                  ) : (
                    <>
                      <span className="text-white">Merch</span>
                      <span className="text-brand-neon">kins</span>
                    </>
                  )}
                </motion.div>
              </div>
              <div className="p-3">
                <AdminNav />
              </div>
            </SheetContent>
          </Sheet>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href={pathname?.startsWith('/super-admin') ? '/super-admin' : '/admin'}
              className="flex items-center gap-2 transition-all duration-300 rounded-lg px-2 py-1 hover:bg-primary/5"
            >
              <span className="text-base font-semibold tracking-tight font-genty">{areaLabel}</span>
            </Link>
          </motion.div>
        </div>

        <form onSubmit={onSearch} role="search" className="ml-4 hidden flex-1 items-center gap-2 md:flex group">
          <motion.div
            className="relative w-full max-w-md"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
            <motion.div
              className="absolute inset-0 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(29, 67, 216, 0.1), rgba(79, 125, 249, 0.1))',
                filter: 'blur(6px)',
              }}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${areaLabel.toLowerCase()}...`}
              aria-label="Search admin"
              className="h-8 pl-9 text-sm border-0 bg-muted/50 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-md relative z-10"
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="h-8 px-4 text-sm font-medium transition-all duration-300 rounded-md hover:bg-primary hover:text-white hover:shadow-md"
            >
              Search
            </Button>
          </motion.div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="h-8 w-8 transition-all duration-300 rounded-lg hover:bg-primary/10 hover:text-primary"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </motion.div>
          <SignedOut>
            <Link href="/sign-in">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-4 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-primary/10 hover:text-primary"
                >
                  Sign in
                </Button>
              </motion.div>
            </Link>
          </SignedOut>
          <SignedIn>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: '!size-7 hover:scale-110 transition-transform duration-300 rounded-lg',
                    userButtonPopoverCard: 'bg-white border shadow-lg rounded-lg',
                    userButtonPopoverActionButton: 'text-neutral-700 hover:bg-primary/10 hover:text-primary transition-colors rounded-md',
                  },
                }}
              />
            </motion.div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
