'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AdminFooter() {
  const pathname = usePathname();
  const params = useSearchParams();
  const areaLabel = pathname?.startsWith('/super-admin') ? 'Super Admin' : 'Admin';
  const org = params.get('org') ?? undefined;
  const withOrg = (href: string) => (org ? `${href}?org=${encodeURIComponent(org)}` : href);

  return (
    <footer
      data-testid="admin-footer"
      className="border-t border-border bg-card/80 backdrop-blur-sm"
    >
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
              {areaLabel}
            </div>
            <div className={cn('text-lg font-semibold tracking-tight', org ? '' : 'font-genty')}>
              {org ? (
                <span className="text-foreground">Org: {org}</span>
              ) : (
                <>
                  <span className="text-foreground">Merch</span>
                  <span className="text-brand-neon">kins</span>
                </>
              )}
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
              <ul className="space-y-2.5">
                {[
                  { href: withOrg('/admin/overview'), label: 'Overview' },
                  { href: withOrg('/admin/analytics'), label: 'Analytics' },
                  { href: withOrg('/admin/org-members'), label: 'Members' },
                  { href: withOrg('/admin/org-settings'), label: 'Settings' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group relative inline-block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="sm:col-span-2 lg:col-span-1 lg:col-start-3">
            <div className="text-xs text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()}{' '}
                <span className="font-genty">
                  <span className="text-foreground">Merch</span>
                  <span className="text-brand-neon">kins</span>
                </span>
                . All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AdminFooter;
