import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <section className="relative isolate min-h-dvh overflow-hidden">
      {/* Background aesthetics */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 size-[520px] rounded-full bg-brand-gradient blur-3xl opacity-20 dark:opacity-25" />
        <div className="absolute -bottom-24 -right-24 size-[520px] rounded-full bg-brand-gradient-subtle blur-3xl opacity-30 dark:opacity-20" />
        <svg className="absolute inset-0 size-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto grid min-h-dvh place-items-center px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground glass">
            <span className="inline-block size-2 rounded-full bg-primary" />
            Something went off the grid
          </div>

          <h1 className="mb-2 text-7xl font-extrabold tracking-tight gradient-text sm:text-8xl">404</h1>
          <p className="mb-1 text-2xl font-semibold">Page not found</p>
          <p className="mx-auto mb-8 max-w-md text-balance text-sm text-muted-foreground">
            The page you are looking for might have been moved, renamed, or might never have existed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="https://app.merchkins.com" className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}>
              <Home className="mr-1.5" />
              Back to home
            </Link>
            <Link href="/search" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              <Search className="mr-1.5" />
              Browse & search
            </Link>
          </div>

          <div className="mt-10 rounded-xl border bg-card p-4 text-left shadow-modern">
            <div className="flex items-start gap-3">
              <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Tip: Check the URL for typos or explore our latest products from the homepage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
