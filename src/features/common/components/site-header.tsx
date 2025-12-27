'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, Search, Building2, Package, User as UserIcon, ArrowRight, ArrowLeft, Sparkles, LogIn, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { SignedIn, SignedOut, UserButton, useAuth, SignInButton, SignUpButton } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CartSheet } from '@/src/features/cart/components/cart-sheet';
import { cn } from '@/lib/utils';
import { OrganizationsPage, AccountPage } from '@/src/features/common/components/user-profile-pages';
import { useThemeExclusionAuto } from '../../../stores/theme-exclusion';
import { useUnifiedCart } from '@/src/hooks/use-unified-cart';
import { BeamsBackground, GradientBackground, GridPattern } from '@/src/components/ui/backgrounds';
import { Float, PulseGlow } from '@/src/components/ui/animations';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  useNavbarScroll,
} from '@/src/components/ui/resizable-navbar';
import { useOrgLink } from '@/src/hooks/use-org-link';
import { BUSINESS_NAME, BUSINESS_CURRENCY, BUSINESS_DTI_NUMBER } from '@/src/constants/business-info';

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { userId: clerkId } = useAuth();
  const isSignedIn = !!clerkId;
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { shouldApplyTheme } = useThemeExclusionAuto();

  // Detect organization slug from hostname (for subdomains) or pathname (for direct access)
  const orgSlugFromPath = useMemo(() => {
    if (!pathname) return undefined;

    // First check if we're on a subdomain (hostname-based detection)
    // Using window.location.hostname for subdomain detection (Next.js doesn't provide client-side hostname API)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (
        hostname &&
        hostname.endsWith('.merchkins.com') &&
        !hostname.startsWith('app.') &&
        !hostname.startsWith('staging.') &&
        !hostname.startsWith('preview.')
      ) {
        const subdomain = hostname.split('.')[0];
        // Only use subdomain if we're not on the main app domain
        if (subdomain !== 'app' && subdomain !== 'staging' && !subdomain.startsWith('preview')) {
          return subdomain;
        }
      }
    }

    // Fallback to pathname-based detection for direct access or when hostname detection fails
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'o' && segments[1]) return segments[1];
    return undefined;
  }, [pathname]);

  const [persistedSlug, setPersistedSlug] = useState<string | undefined>(undefined);
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

  // Use unified cart to support both authenticated and guest users
  const { totals } = useUnifiedCart();
  const totalItems = useMemo(() => totals.totalItems ?? 0, [totals.totalItems]);

  // Get current user and their organizations to check membership
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : ('skip' as unknown as { clerkId: string }));
  const userOrganizations = useQuery(
    api.organizations.queries.index.getOrganizationsByUser,
    currentUser?._id ? { userId: currentUser._id } : ('skip' as unknown as { userId: Id<'users'> })
  );

  // Check if user is a member of the current organization
  const isMember = useMemo(() => {
    if (!organization?._id || !userOrganizations) return false;
    return userOrganizations.some((org) => org._id === organization._id);
  }, [organization?._id, userOrganizations]);

  // Show home button if on storefront or using another store's theme
  const showHomeButton = useMemo(() => {
    return !!orgSlugFromPath || (!!persistedSlug && !orgSlugFromPath);
  }, [orgSlugFromPath, persistedSlug]);

  // Subdomain-aware link builder
  const { buildOrgLink } = useOrgLink(orgSlug);

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = search.trim();
    if (q.length > 0) {
      router.push(buildOrgLink(`/search?q=${encodeURIComponent(q)}`));
    } else {
      router.push(buildOrgLink('/search'));
    }
  }

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.98]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 4]);

  // Navigation items for the resizable navbar
  const navItems = useMemo(() => {
    const baseItems = [
      { name: 'Home', link: buildOrgLink('/') },
      { name: 'Search', link: buildOrgLink('/search') },
    ];
    return baseItems;
  }, [buildOrgLink]);

  const headerClassName = cn('transition-all duration-300', 'supports-[backdrop-filter]:backdrop-blur-md');

  return (
    <>
      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-24" />
      <Navbar
        className={headerClassName}
        style={{
          backgroundColor: shouldApplyTheme ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          color: shouldApplyTheme ? 'var(--foreground)' : 'var(--foreground)',
        }}
      >
        <SiteHeaderContent
          orgSlug={orgSlug}
          organization={organization}
          shouldApplyTheme={shouldApplyTheme}
          showHomeButton={showHomeButton}
          navItems={navItems}
          search={search}
          setSearch={setSearch}
          handleSearchSubmit={handleSearchSubmit}
          totalItems={totalItems}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          router={router}
        />
      </Navbar>
    </>
  );
}

function SiteHeaderContent({
  orgSlug,
  organization,
  shouldApplyTheme,
  showHomeButton,
  navItems,
  search,
  setSearch,
  handleSearchSubmit,
  totalItems,

  mobileMenuOpen,
  setMobileMenuOpen,
  router,
}: {
  orgSlug: string | undefined;
  organization: any;
  shouldApplyTheme: boolean;
  showHomeButton: boolean;
  navItems: Array<{ name: string; link: string }>;
  search: string;
  setSearch: (value: string) => void;
  handleSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  totalItems: number;

  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  router: any;
}) {
  const { isScrolled } = useNavbarScroll();
  const { buildOrgLink } = useOrgLink(orgSlug);

  return (
    <>
      {/* Animated Background Effects - only show when not scrolled */}
      {!shouldApplyTheme && !isScrolled && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BeamsBackground className="opacity-30" />
          <GradientBackground variant="subtle" className="opacity-50" />
          <GridPattern className="opacity-20" />

          {/* Floating decorative sparkles */}
          <Float amplitude={8} duration={4}>
            <div className="absolute top-4 right-[15%] w-2 h-2 rounded-full bg-brand-neon/60 blur-sm" />
          </Float>
          <Float amplitude={6} duration={5}>
            <div className="absolute top-6 left-[20%] w-1.5 h-1.5 rounded-full bg-white/80 blur-sm" />
          </Float>
          <Float amplitude={10} duration={6}>
            <div className="absolute top-8 right-[30%] w-1 h-1 rounded-full bg-brand-neon/40 blur-sm" />
          </Float>
        </div>
      )}

      <NavBody>
        {/* Left side: Logo with Business Info */}
        <div className="flex items-center gap-3 md:gap-4">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Link
              href={buildOrgLink('/')}
              className="flex items-center gap-2 font-bold tracking-tight transition-all duration-300 group relative"
              style={{ color: isScrolled ? 'white' : shouldApplyTheme ? 'var(--foreground)' : 'var(--foreground)' }}
              title={BUSINESS_NAME}
            >
              {!shouldApplyTheme && !isScrolled && (
                <>
                  {/* Decorative sparkle near logo */}
                  <motion.div
                    className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-3 w-3 text-brand-neon" />
                  </motion.div>

                  {/* Glow effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                    style={{ background: 'radial-gradient(circle, rgba(173, 252, 4, 0.3), transparent 70%)' }}
                  />
                </>
              )}

              <span
                className={cn(
                  'text-2xl md:text-4xl font-bold! tracking-tighter relative z-10 transition-all duration-300 whitespace-nowrap',
                  isScrolled ? 'text-white' : shouldApplyTheme && organization?.name ? 'text-primary' : 'font-genty',
                  !shouldApplyTheme && !isScrolled && 'group-hover:drop-shadow-[0_0_8px_rgba(173,252,4,0.5)]',
                  organization && 'font-outfit'
                )}
              >
                {shouldApplyTheme ? (
                  organization?.name
                ) : isScrolled ? (
                  <span className="relative z-10 inline-flex items-center px-3 py-1 md:px-4 md:py-1.5 transition-shadow duration-300">
                    <span className="font-genty">
                      <span className="text-white">Merch</span>
                      <span className="text-brand-neon">kins</span>
                    </span>
                  </span>
                ) : (
                  <span className="relative z-10 inline-flex items-center bg-primary px-3 py-1 md:px-4 md:py-1.5 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
                    <span className="font-genty">
                      <span className="text-white">Merch</span>
                      <span className="text-brand-neon">kins</span>
                    </span>
                  </span>
                )}
              </span>
            </Link>
          </motion.div>

          {/* Business name and DTI number - displayed prominently */}
          {!shouldApplyTheme && !isScrolled && (
            <div className="hidden md:flex flex-col gap-0.5 max-w-[220px]">
              <p className={cn('text-[10px] leading-tight text-muted-foreground break-words')}>{BUSINESS_NAME}</p>
              <p className={cn('text-[10px] leading-tight text-muted-foreground')}>
                DTI No.: <span className="font-semibold text-foreground">{BUSINESS_DTI_NUMBER}</span>
              </p>
            </div>
          )}

          {/* Center: Navigation Items - less prominent, smaller text links */}
          {!isScrolled && (
            <div className="hidden lg:flex items-center gap-1 ml-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className={cn(
                    'px-2 py-1 text-xs font-medium transition-colors rounded-md',
                    shouldApplyTheme
                      ? 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      : 'text-muted-foreground/80 hover:text-foreground hover:bg-white/5'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* Home button - shown when on storefront, less prominent */}
          {showHomeButton && !isScrolled && (
            <Link
              href={process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.merchkins.com'}
              className={cn(
                'hidden lg:flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors rounded-md',
                shouldApplyTheme
                  ? 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  : 'text-muted-foreground/80 hover:text-foreground hover:bg-white/5'
              )}
              aria-label="Go back home"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Home</span>
            </Link>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Enhanced Search Bar with Glassmorphism */}
          <form onSubmit={handleSearchSubmit} role="search" className="hidden md:flex group">
            <motion.div className="relative w-64" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Search
                className={cn(
                  'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 z-20 transition-colors duration-300',
                  isScrolled
                    ? 'text-white/80 group-focus-within:text-white'
                    : shouldApplyTheme
                      ? 'text-foreground/60 group-focus-within:text-primary'
                      : 'text-foreground/60 group-focus-within:text-primary'
                )}
              />
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                style={{
                  background: shouldApplyTheme
                    ? 'linear-gradient(135deg, rgba(29, 67, 216, 0.1), rgba(79, 125, 249, 0.1))'
                    : 'linear-gradient(135deg, rgba(173, 252, 4, 0.15), rgba(29, 67, 216, 0.15))',
                  filter: 'blur(8px)',
                }}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className={cn(
                  'h-9 pl-10 text-sm pr-10 rounded-full border transition-all duration-300 relative z-10',
                  isScrolled
                    ? 'bg-white/20 backdrop-blur-sm text-white border-white/20 placeholder:text-white/60 hover:border-white/40 focus:border-white/60 focus:ring-2 focus:ring-white/20'
                    : shouldApplyTheme
                      ? 'bg-white/80 backdrop-blur-sm text-foreground border-border placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20'
                      : 'bg-white/80 backdrop-blur-sm text-foreground border-border placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20'
                )}
              />
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full transition-all duration-300',
                    isScrolled
                      ? 'hover:bg-white/10 text-white hover:text-white'
                      : shouldApplyTheme
                        ? 'hover:bg-primary/10 text-muted-foreground hover:text-primary'
                        : 'hover:bg-primary/10 text-muted-foreground hover:text-primary'
                  )}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span className="sr-only">Search</span>
                </Button>
              </motion.div>
            </motion.div>
          </form>
          {/* My Orders Button - hidden when compressed */}
          <SignedIn>
            {!isScrolled && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'hidden md:flex gap-1.5 px-2.5 h-9 relative transition-all duration-300 rounded-lg',
                    isScrolled
                      ? 'hover:bg-white/10 text-white hover:text-white hover:shadow-sm'
                      : shouldApplyTheme
                        ? 'hover:bg-primary/10 text-foreground hover:text-primary hover:shadow-sm'
                        : 'hover:bg-primary/10 text-foreground hover:text-primary hover:shadow-sm'
                  )}
                >
                  <Link href="/orders" className="flex items-center gap-1.5">
                    <Package
                      className={cn(
                        'h-4 w-4 transition-transform duration-300',
                        isScrolled ? 'text-white' : shouldApplyTheme ? 'text-foreground' : 'text-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'hidden sm:inline text-sm font-medium',
                        isScrolled ? 'text-white' : shouldApplyTheme ? 'text-foreground' : 'text-foreground'
                      )}
                    >
                      My Orders
                    </span>
                  </Link>
                </Button>
              </motion.div>
            )}
          </SignedIn>

          {/* Currency Indicator - shown beside cart */}
          {!shouldApplyTheme && (
            <div
              className={cn(
                'hidden md:flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-xs font-medium transition-colors',
                isScrolled ? 'text-white/80' : 'text-muted-foreground'
              )}
              aria-label={`Currency: ${BUSINESS_CURRENCY}`}
            >
              {BUSINESS_CURRENCY === 'PHP' ? (
                <>
                  <span
                    className={cn('text-base font-semibold leading-none', isScrolled ? 'text-white/80' : 'text-muted-foreground')}
                    aria-hidden="true"
                  >
                    ₱
                  </span>
                  <span>{BUSINESS_CURRENCY}</span>
                </>
              ) : BUSINESS_CURRENCY === 'USD' ? (
                <>
                  <DollarSign className={cn('h-3.5 w-3.5', isScrolled ? 'text-white/80' : 'text-muted-foreground')} aria-hidden="true" />
                  <span>{BUSINESS_CURRENCY}</span>
                </>
              ) : (
                <span>{BUSINESS_CURRENCY}</span>
              )}
            </div>
          )}

          {/* Cart Sheet - Show for both authenticated and unauthenticated users */}
          <CartSheet initialCount={totalItems}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                aria-label="Cart"
                size="sm"
                className={cn(
                  'gap-1.5 px-2.5 h-9 relative transition-all duration-300 rounded-lg',
                  isScrolled
                    ? 'hover:bg-white/10 text-white hover:text-white hover:shadow-sm'
                    : shouldApplyTheme
                      ? 'hover:bg-primary/10 text-foreground hover:text-primary hover:shadow-sm'
                      : 'hover:bg-primary/10 text-foreground hover:text-primary hover:shadow-sm'
                )}
              >
                <ShoppingCart
                  className={cn(
                    'h-4 w-4 transition-transform duration-300 group-hover:scale-110',
                    isScrolled ? 'text-white' : shouldApplyTheme ? 'text-foreground' : 'text-foreground'
                  )}
                />
                {totalItems > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-neon text-black text-xs flex items-center justify-center font-bold shadow-lg"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </motion.div>
          </CartSheet>

          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    className={cn(
                      'px-4! md:px-8! h-9 text-sm font-medium transition-all duration-300 rounded-full shadow-lg',
                      isScrolled
                        ? 'bg-white/20 hover:bg-white/30 text-white hover:shadow-xl backdrop-blur-sm'
                        : shouldApplyTheme
                          ? 'bg-primary hover:bg-primary/90 hover:shadow-xl text-white'
                          : 'bg-brand-neon text-black hover:bg-brand-neon/90 hover:shadow-[0_0_20px_rgba(173,252,4,0.5)]'
                    )}
                    style={isScrolled ? undefined : !shouldApplyTheme ? { backgroundColor: '#adfc04', color: '#000000' } : undefined}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </motion.div>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: '!size-8 hover:scale-105 transition-transform duration-200 ring-2 ring-transparent hover:ring-[#1d43d8]/20',
                  userButtonPopoverCard: 'bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden',
                  userButtonPopoverActionButton: 'text-slate-700 hover:bg-slate-50 transition-colors rounded-lg mx-1',
                  userButtonPopoverActionButtonText: 'font-medium text-sm',
                  userButtonPopoverActionButtonIcon: 'text-slate-500',
                  userButtonPopoverFooter: 'hidden',
                  userProfileSection: 'p-0',
                  userProfileSectionContent: 'p-0',
                  pageScrollBox: 'p-0',
                  page: 'p-0 gap-0',
                  profilePage: 'p-0',
                  profileSection: 'p-0',
                  profileSectionContent: 'p-0',
                  profileSectionHeader: 'hidden',
                  profileSectionPrimaryButton: 'hidden',
                  formContainer: 'p-0',
                  formHeader: 'hidden',
                  formButtonPrimary: 'bg-[#1d43d8] hover:bg-[#1d43d8]/90 rounded-xl font-semibold shadow-sm',
                  formFieldInput: 'rounded-lg border-slate-200 focus:border-[#1d43d8] focus:ring-2 focus:ring-[#1d43d8]/20',
                  card: 'shadow-none border-0 p-0',
                  navbar: 'border-b border-slate-100 bg-slate-50/50',
                  navbarButton:
                    'text-sm font-medium text-slate-600 hover:text-[#1d43d8] data-[active=true]:text-[#1d43d8] data-[active=true]:border-[#1d43d8]',
                  navbarButtonIcon: 'text-slate-500',
                  scrollBox: 'bg-white',
                  rootBox: 'w-full',
                },
                variables: {
                  colorPrimary: '#1d43d8',
                  colorText: '#0f172a',
                  colorTextSecondary: '#64748b',
                  colorBackground: '#ffffff',
                  colorInputBackground: '#ffffff',
                  colorInputText: '#0f172a',
                  borderRadius: '0.75rem',
                  fontFamily: 'var(--font-dm-sans)',
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Action label="Account" open="account" labelIcon={<UserIcon className="h-4 w-4" />} />
                <UserButton.Action label="Organizations" open="organizations" labelIcon={<Building2 className="h-4 w-4" />} />
                <UserButton.Link href="/orders" label="My Orders" labelIcon={<Package className="h-4 w-4" />} />
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
              <UserButton.UserProfilePage label="Account" url="account" labelIcon={<UserIcon className="h-4 w-4" />}>
                <AccountPage />
              </UserButton.UserProfilePage>
              <UserButton.UserProfilePage label="Organizations" url="organizations" labelIcon={<Building2 className="h-4 w-4" />}>
                <OrganizationsPage />
              </UserButton.UserProfilePage>
            </UserButton>
          </SignedIn>
        </div>

        {/* Mobile Navigation - removed on mobile since there's a floating button for navigation */}
      </NavBody>
    </>
  );
}
