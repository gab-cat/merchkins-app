'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Search as SearchIcon, RotateCcw, HelpCircle, Globe, Mail, MessageSquare, Ticket, FileText, Shield, ArrowRight } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useThemeExclusionAuto } from '../../../stores/theme-exclusion';

export function SiteFooter() {
  const pathname = usePathname();
  const { shouldApplyTheme } = useThemeExclusionAuto();

  const orgSlugFromPath = useMemo(() => {
    if (!pathname) return undefined;
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'o' && segments[1]) return segments[1];
    return undefined;
  }, [pathname]);

  const [persistedSlug, setPersistedSlug] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (orgSlugFromPath) {
      localStorage.setItem('lastOrgSlug', orgSlugFromPath);
      setPersistedSlug(orgSlugFromPath);
      return;
    }
    if (pathname === '/') {
      localStorage.removeItem('lastOrgSlug');
      setPersistedSlug(undefined);
      return;
    }
    const last = localStorage.getItem('lastOrgSlug') || undefined;
    setPersistedSlug(last || undefined);
  }, [orgSlugFromPath, pathname]);

  const orgSlug = persistedSlug || orgSlugFromPath;

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  );

  const footerLinks = {
    shop: [
      { href: orgSlug ? `/o/${orgSlug}` : '/', label: 'Home' },
      { href: orgSlug ? `/o/${orgSlug}/search` : '/search', label: 'Search' },
      { href: orgSlug ? `/o/${orgSlug}/c/apparel` : '/c/apparel', label: 'Apparel' },
      { href: orgSlug ? `/o/${orgSlug}/c/accessories` : '/c/accessories', label: 'Accessories' },
    ],
    support: [
      { href: orgSlug ? `/o/${orgSlug}/chats` : '/chats', label: 'Chat' },
      { href: orgSlug ? `/o/${orgSlug}/tickets` : '/tickets', label: 'Support' },
      { href: '#returns', label: 'Returns' },
      { href: '#help', label: 'Help' },
    ],
    legal: [
      { href: '#terms', label: 'Terms' },
      { href: '#privacy', label: 'Privacy' },
    ],
  };

  return (
    <footer
      className="relative bg-white border-t border-primary"
      style={{
        backgroundColor: shouldApplyTheme ? 'var(--footer-bg)' : 'white',
        color: shouldApplyTheme ? 'var(--footer-fg)' : undefined,
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Links Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {/* Shop */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">Shop</h4>
            <ul className="space-y-1.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">Support</h4>
            <ul className="space-y-1.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">Newsletter</h4>
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const input = form.elements.namedItem('email') as HTMLInputElement | null;
                const email = input?.value?.trim() || '';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  showToast({ type: 'error', title: 'Enter a valid email address' });
                  return;
                }
                showToast({ type: 'success', title: 'Subscribed! Thanks for joining.' });
                form.reset();
              }}
            >
              <Input name="email" type="email" placeholder="Your email" className="h-10 text-sm bg-white border-border rounded-full" required />
              <Button
                type="submit"
                size="sm"
                className="w-full h-10 bg-white text-primary border border-primary hover:bg-primary/10 hover:text-primary"
              >
                Subscribe
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </div>

          {/* Social */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">Connect</h4>
            <div className="flex flex-col gap-1.5">
              {organization?.website && (
                <Link
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
                >
                  <span>Website</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              )}
              <Link
                href="mailto:business@merchkins.com"
                className="group inline-flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
              >
                <span>Email</span>
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Large Brand Name Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 md:mt-16 w-full"
        >
          <h2
            className={cn(
              'w-full text-[clamp(4rem,15vw,12rem)] font-bold tracking-tighter leading-none font-heading overflow-x-visible',
              shouldApplyTheme && organization ? 'text-primary' : 'text-foreground'
            )}
            style={{
              fontSize: 'clamp(8rem, 18vw, 16rem)',
              lineHeight: '1',
            }}
          >
            {shouldApplyTheme ? (
              organization?.name || 'Merchkins'
            ) : (
              <>
                <span className="text-primary">Merchkins</span>
              </>
            )}
          </h2>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {organization?.name || 'Merchkins'}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map((link, index) => (
              <React.Fragment key={link.label}>
                <Link href={link.href} className="text-xs transition-colors text-muted-foreground hover:text-foreground">
                  {link.label}
                </Link>
                {index < footerLinks.legal.length - 1 && <span className="text-xs text-muted-foreground/30">/</span>}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
