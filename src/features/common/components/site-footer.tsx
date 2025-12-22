'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Home,
  Search as SearchIcon,
  RotateCcw,
  HelpCircle,
  Globe,
  Mail,
  MessageSquare,
  Ticket,
  FileText,
  Shield,
  ArrowRight,
  Phone,
  MapPin,
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useThemeExclusionAuto, getOrgSlugFromSubdomain } from '../../../stores/theme-exclusion';
import { useOrgLink } from '@/src/hooks/use-org-link';

export function SiteFooter() {
  const pathname = usePathname();
  const { shouldApplyTheme } = useThemeExclusionAuto();
  const brandTextRef = React.useRef<HTMLHeadingElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const orgSlugFromPath = useMemo(() => {
    if (!pathname) return undefined;
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'o' && segments[1]) return segments[1];
    return undefined;
  }, [pathname]);

  // Also check for subdomain-based org detection
  const [subdomainSlug, setSubdomainSlug] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const slug = getOrgSlugFromSubdomain();
    setSubdomainSlug(slug);
  }, []);

  // Prefer subdomain slug over path-based slug for subdomain access
  const detectedSlug = subdomainSlug || orgSlugFromPath;

  const [persistedSlug, setPersistedSlug] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (detectedSlug) {
      localStorage.setItem('lastOrgSlug', detectedSlug);
      setPersistedSlug(detectedSlug);
      return;
    }
    if (pathname === '/' && !subdomainSlug) {
      localStorage.removeItem('lastOrgSlug');
      setPersistedSlug(undefined);
      return;
    }
    const last = localStorage.getItem('lastOrgSlug') || undefined;
    setPersistedSlug(last || undefined);
  }, [detectedSlug, pathname, subdomainSlug]);

  const orgSlug = persistedSlug || detectedSlug;

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  );

  // Scale text to fit container width
  React.useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    const CLAMP_VALUE = 'clamp(6rem, 18vw, 24rem)';

    const scaleText = () => {
      if (!brandTextRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const text = brandTextRef.current;

      // Restore clamp value first to get accurate measurement
      text.style.fontSize = CLAMP_VALUE;

      // Force reflow to get accurate measurements with clamp applied
      void text.offsetWidth;

      // Get computed styles after clamp is applied
      const containerWidth = container.offsetWidth;
      const textWidth = text.scrollWidth;

      // Only scale if there's significant overflow (more than 10px)
      if (textWidth > containerWidth + 10 && containerWidth > 0) {
        // Text overflows - calculate scale factor to fit
        const scale = (containerWidth - 10) / textWidth; // 10px padding
        const currentFontSize = parseFloat(getComputedStyle(text).fontSize);
        // Scale down to fit
        text.style.fontSize = `${currentFontSize * scale}px`;
      } else {
        // Text fits - keep the clamp value for maximum size
        text.style.fontSize = CLAMP_VALUE;
      }
    };

    const debouncedScaleText = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(scaleText, 50);
    };

    // Small delay to ensure DOM is ready and animations complete
    const initialTimeout = setTimeout(scaleText, 100);
    window.addEventListener('resize', debouncedScaleText);

    // Use ResizeObserver for more accurate container size tracking
    const resizeObserver = new ResizeObserver(debouncedScaleText);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedScaleText);
      resizeObserver.disconnect();
    };
  }, [organization?.name]);

  // Subdomain-aware link builder
  const { buildOrgLink } = useOrgLink(orgSlug);

  const footerLinks = {
    support: [
      { href: buildOrgLink('/tickets'), label: 'Support' },
      { href: '/returns', label: 'Returns' },
      { href: '/help', label: 'Help' },
    ],
    legal: [
      { href: '/terms', label: 'Terms' },
      { href: '/privacy', label: 'Privacy' },
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
          {/* Merchkins */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">Merchkins</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your one-stop platform for custom merchandise. We help organizations create, manage, and sell branded products with ease.
            </p>
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

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">Contact</h4>
            <div className="flex flex-col gap-2.5">
              <Link
                href="mailto:business@merchkins.com"
                className="group inline-flex items-start gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <span>business@merchkins.com</span>
              </Link>
              <Link
                href="tel:+639999667583"
                className="group inline-flex items-start gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span>+63 (999) 966-7583</span>
              </Link>
              <div className="inline-flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="leading-relaxed">
                  Magis TBI Richie Hall, Ateneo de Naga University, Ateneo Avenue, Bagumbayan Sur, Naga City, Camarines Sur, 4400, PH
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Large Brand Name Section */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 md:mt-24 w-full overflow-hidden"
        >
          <h2
            ref={brandTextRef}
            className={cn(
              'w-full font-bold tracking-tighter leading-none font-heading whitespace-nowrap',
              shouldApplyTheme && organization ? 'text-primary' : 'text-foreground'
            )}
            style={{
              fontSize: 'clamp(6rem, 18vw, 24rem)',
              lineHeight: '1',
            }}
          >
            {shouldApplyTheme ? (
              organization?.name || 'Merchkins'
            ) : (
              <>
                <span className="text-primary whitespace-nowrap">Merchkins</span>
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
