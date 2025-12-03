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
import { Home, Search as SearchIcon, RotateCcw, HelpCircle, Globe, Mail, MessageSquare, Ticket, FileText, Shield, Sparkles } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useThemeExclusionAuto } from '../../../stores/theme-exclusion';
import { GradientBackground, GridPattern, BeamsBackground } from '@/src/components/ui/backgrounds';
import { StaggerContainer, StaggerItem } from '@/src/components/ui/animations';

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

  const footerClassName = cn('border-t relative overflow-hidden');

  return (
    <footer
      className={footerClassName}
      style={{
        backgroundColor: 'var(--footer-bg)',
        color: 'var(--footer-fg)',
      }}
    >
      {/* Animated Background Effects */}
      {!shouldApplyTheme && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BeamsBackground className="opacity-20" />
          <GradientBackground variant="subtle" className="opacity-40" />
          <GridPattern className="opacity-15" size={30} />
          
          {/* Floating decorative elements */}
          <motion.div
            className="absolute bottom-10 right-[10%] w-32 h-32 rounded-full bg-brand-neon/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-10 left-[5%] w-24 h-24 rounded-full bg-primary/10 blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </div>
      )}

      <div className="w-full px-4 py-8 md:py-12 relative z-10">
        <StaggerContainer className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
          {/* Enhanced Brand / About Section */}
          <StaggerItem>
            <div className="space-y-4">
              <motion.div
                className={cn('text-lg font-semibold md:text-2xl relative inline-block', shouldApplyTheme && organization?.name ? '' : 'font-genty')}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {shouldApplyTheme ? (
                  organization?.name
                ) : (
                  <>
                    <span className="text-white">Merch</span>
                    <span className="text-brand-neon">kins</span>
                    {/* Decorative sparkle */}
                    <motion.div
                      className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="h-4 w-4 text-brand-neon" />
                    </motion.div>
                  </>
                )}
              </motion.div>
              {shouldApplyTheme && organization?.description ? (
                <p className="line-clamp-3 text-sm opacity-80 leading-relaxed">{organization.description}</p>
              ) : (
                <p className="text-sm opacity-80 leading-relaxed">
                  Custom merch made easy — shop, manage, and fulfill with{' '}
                  <span className="font-genty">
                    <span className="text-white">Merch</span>
                    <span className="text-brand-neon">kins</span>
                  </span>
                  .
                </p>
              )}
              <div className="flex items-center gap-3" aria-label="Social links" role="navigation">
                {organization?.website ? (
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300',
                        shouldApplyTheme
                          ? 'hover:bg-primary/10 text-primary hover:text-primary hover:shadow-sm'
                          : 'hover:bg-white/10 text-white hover:text-brand-neon hover:shadow-[0_0_12px_rgba(173,252,4,0.3)]'
                      )}
                      aria-label="Website"
                      data-testid="footer-social-website"
                    >
                      <Globe className="h-4 w-4" />
                    </Link>
                  </motion.div>
                ) : null}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="mailto:business@merchkins.com"
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300',
                      shouldApplyTheme
                        ? 'hover:bg-primary/10 text-primary hover:text-primary hover:shadow-sm'
                        : 'hover:bg-white/10 text-white hover:text-brand-neon hover:shadow-[0_0_12px_rgba(173,252,4,0.3)]'
                    )}
                    aria-label="Email"
                    data-testid="footer-social-email"
                  >
                    <Mail className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </StaggerItem>

          {/* Enhanced Shop Section */}
          <StaggerItem>
            <div className="space-y-4">
              <h3 className={cn(
                'text-sm font-semibold uppercase tracking-wide mb-4',
                shouldApplyTheme ? 'text-primary' : 'text-white'
              )}>
                Shop
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { href: orgSlug ? `/o/${orgSlug}` : '/', icon: Home, label: 'Home' },
                  { href: orgSlug ? `/o/${orgSlug}/search` : '/search', icon: SearchIcon, label: 'Search' },
                  { href: orgSlug ? `/o/${orgSlug}/c/apparel` : '/c/apparel', icon: null, label: 'Apparel' },
                  { href: orgSlug ? `/o/${orgSlug}/c/accessories` : '/c/accessories', icon: null, label: 'Accessories' },
                ].map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'inline-flex items-center gap-2 relative group transition-all duration-300',
                        shouldApplyTheme
                          ? 'text-foreground/85 hover:text-primary hover:font-semibold'
                          : 'text-white/85 hover:text-white hover:font-semibold'
                      )}
                    >
                      {item.icon && <item.icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />}
                      <span>{item.label}</span>
                      {/* Animated underline */}
                      <motion.div
                        className={cn(
                          'absolute bottom-0 left-0 right-0 h-0.5 origin-left',
                          shouldApplyTheme ? 'bg-primary' : 'bg-brand-neon'
                        )}
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

          {/* Enhanced Support & Legal Section */}
          <StaggerItem>
            <div className="space-y-4">
              <h3 className={cn(
                'text-sm font-semibold uppercase tracking-wide mb-4',
                shouldApplyTheme ? 'text-primary' : 'text-white'
              )}>
                Support & legal
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { href: orgSlug ? `/o/${orgSlug}/chats` : '/chats', icon: MessageSquare, label: 'Chat' },
                  { href: orgSlug ? `/o/${orgSlug}/tickets` : '/tickets', icon: Ticket, label: 'Support tickets' },
                  { href: '#returns', icon: RotateCcw, label: 'Returns' },
                  { href: '#help', icon: HelpCircle, label: 'Help center' },
                  { href: '#terms', icon: FileText, label: 'Terms' },
                  { href: '#privacy', icon: Shield, label: 'Privacy' },
                ].map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'inline-flex items-center gap-2 relative group transition-all duration-300',
                        shouldApplyTheme
                          ? 'text-foreground/85 hover:text-primary hover:font-semibold'
                          : 'text-white/85 hover:text-white hover:font-semibold'
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
                      <span>{item.label}</span>
                      {/* Animated underline */}
                      <motion.div
                        className={cn(
                          'absolute bottom-0 left-0 right-0 h-0.5 origin-left',
                          shouldApplyTheme ? 'bg-primary' : 'bg-brand-neon'
                        )}
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

          {/* Enhanced Newsletter Section */}
          <StaggerItem>
            <div className="space-y-4">
              <h3 className={cn(
                'text-sm font-semibold uppercase tracking-wide mb-4',
                shouldApplyTheme ? 'text-primary' : 'text-white'
              )}>
                Stay in the loop
              </h3>
              <form
                className="flex w-full max-w-sm flex-col gap-3"
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
                data-testid="footer-newsletter-form"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="flex-1 relative"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      aria-label="Email address"
                      className={cn(
                        'h-10 flex-1 text-sm transition-all duration-300 rounded-lg',
                        shouldApplyTheme
                          ? 'bg-white/80 backdrop-blur-sm border-border hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20'
                          : 'bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/60 hover:border-white/40 focus:border-brand-neon/60 focus:ring-2 focus:ring-brand-neon/30'
                      )}
                      required
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      size="sm"
                      className={cn(
                        'h-10 px-4 text-sm font-medium transition-all duration-300 rounded-lg shadow-lg',
                        shouldApplyTheme
                          ? 'bg-primary hover:bg-primary/90 hover:shadow-xl text-white'
                          : 'bg-brand-neon text-black hover:bg-brand-neon/90 hover:shadow-[0_0_20px_rgba(173,252,4,0.5)]'
                      )}
                    >
                      Subscribe
                    </Button>
                  </motion.div>
                </div>
              </form>
              <p className={cn(
                'text-xs leading-relaxed',
                shouldApplyTheme ? 'text-foreground/70' : 'text-white/70'
              )}>
                By subscribing, you agree to our{' '}
                <Link
                  href="#privacy"
                  className={cn(
                    'underline transition-all duration-300 hover:font-semibold',
                    shouldApplyTheme ? 'hover:text-primary' : 'hover:text-brand-neon'
                  )}
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Enhanced Footer Bottom Section */}
      <div className={cn(
        'border-t relative',
        shouldApplyTheme ? 'border-border/50' : 'border-white/10'
      )}>
        {/* Animated gradient accent line */}
        {!shouldApplyTheme && (
          <motion.div
            className="absolute top-0 left-0 h-[1px] w-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(173, 252, 4, 0.3), transparent)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
        
        <div className="w-full px-4 py-4 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <motion.p
              className={cn(
                'font-medium',
                shouldApplyTheme ? 'text-foreground/80' : 'text-white/80'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              &copy; {new Date().getFullYear()}{' '}
              {shouldApplyTheme ? organization?.name : (
                <span className="font-genty">
                  <span className="text-white">Merch</span>
                  <span className="text-brand-neon">kins</span>
                </span>
              )}
              . All rights reserved.
            </motion.p>
            <div className="flex items-center gap-3">
              <Link
                href="#terms"
                className={cn(
                  'relative group transition-all duration-300',
                  shouldApplyTheme
                    ? 'text-foreground/80 hover:text-primary hover:font-semibold'
                    : 'text-white/80 hover:text-white hover:font-semibold'
                )}
              >
                Terms
                <motion.div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5 origin-left',
                    shouldApplyTheme ? 'bg-primary' : 'bg-brand-neon'
                  )}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <span aria-hidden className={shouldApplyTheme ? 'text-foreground/40' : 'text-white/40'}>•</span>
              <Link
                href="#privacy"
                className={cn(
                  'relative group transition-all duration-300',
                  shouldApplyTheme
                    ? 'text-foreground/80 hover:text-primary hover:font-semibold'
                    : 'text-white/80 hover:text-white hover:font-semibold'
                )}
              >
                Privacy
                <motion.div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5 origin-left',
                    shouldApplyTheme ? 'bg-primary' : 'bg-brand-neon'
                  )}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
