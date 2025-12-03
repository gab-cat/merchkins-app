'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GradientBackground, GridPattern } from '@/src/components/ui/backgrounds';
import { StaggerContainer, StaggerItem } from '@/src/components/ui/animations';

export function AdminFooter() {
  const pathname = usePathname();
  const params = useSearchParams();
  const areaLabel = pathname?.startsWith('/super-admin') ? 'Super Admin' : 'Admin';
  const org = params.get('org') ?? undefined;
  const withOrg = (href: string) => (org ? `${href}?org=${encodeURIComponent(org)}` : href);

  return (
    <footer
      data-testid="admin-footer"
      className="border-t relative overflow-hidden"
      style={{ backgroundColor: 'var(--footer-bg)', color: 'var(--footer-fg)' }}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <GradientBackground variant="subtle" className="opacity-50" />
        <GridPattern className="opacity-15" size={30} />
      </div>

      <div className="container mx-auto grid gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
        <StaggerContainer staggerDelay={0.1}>
          {/* Enhanced Brand Section */}
          <StaggerItem>
            <div className="space-y-2">
              <div className="text-xs uppercase mb-2 font-semibold tracking-wide" style={{ color: 'var(--footer-fg)', opacity: 0.8 }}>
                {areaLabel}
              </div>
              <motion.div
                className={cn('text-sm font-semibold tracking-tight', org ? '' : 'font-genty')}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {org ? (
                  `Org: ${org}`
                ) : (
                  <>
                    <span className="text-white">Merch</span>
                    <span className="text-brand-neon">kins</span>
                  </>
                )}
              </motion.div>
            </div>
          </StaggerItem>

          {/* Enhanced Resources Section */}
          <StaggerItem>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold mb-3 text-primary">Resources</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { href: withOrg('/admin/overview'), label: 'Overview' },
                  { href: withOrg('/admin/analytics'), label: 'Analytics' },
                ].map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="relative group inline-block transition-all duration-300 hover:font-semibold"
                      style={{ color: 'var(--footer-fg)', opacity: 0.85 }}
                    >
                      {item.label}
                      {/* Animated underline */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Enhanced Organization Section */}
          <StaggerItem>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold mb-3 text-primary">Organization</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { href: withOrg('/admin/org-members'), label: 'Members' },
                  { href: withOrg('/admin/org-settings'), label: 'Settings' },
                ].map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="relative group inline-block transition-all duration-300 hover:font-semibold"
                      style={{ color: 'var(--footer-fg)', opacity: 0.85 }}
                    >
                      {item.label}
                      {/* Animated underline */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Enhanced Copyright Section */}
          <StaggerItem>
            <div className="text-sm space-y-2" style={{ color: 'var(--footer-fg)', opacity: 0.8 }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                &copy; {new Date().getFullYear()}{' '}
                <span className="font-genty">
                  <span className="text-white">Merch</span>
                  <span className="text-brand-neon">kins</span>
                </span>
                . All rights reserved.
              </motion.p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </footer>
  );
}

export default AdminFooter;
