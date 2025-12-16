import React from 'react';
import { create } from 'zustand';
import { usePathname } from 'next/navigation';

// Paths to exclude from organization theming
export const ORG_THEME_EXCLUDED_PATHS: readonly string[] = [
  '/checkout',
  // add more here
];

export const EXCLUDED_PREFIXES: readonly string[] = [
  // e.g. '/account', '/orders'
];

export const isExcludedPath = (pathname: string) => {
  return ORG_THEME_EXCLUDED_PATHS.includes(pathname) || EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix + '/'));
};

export const isOrgRoute = (pathname: string) => {
  if (!pathname) return false;
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] === 'o' && segments[1] !== undefined;
};

/**
 * Check if we're on an organization subdomain (e.g., org-slug.merchkins.com)
 * This is client-side only as it requires window.location
 */
export const isOrgSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  if (!hostname || !hostname.endsWith('.merchkins.com')) return false;

  const subdomain = hostname.split('.')[0];
  // Skip reserved subdomains
  if (subdomain === 'app' || subdomain === 'staging' || subdomain.startsWith('preview') || subdomain === 'www') {
    return false;
  }

  return true;
};

/**
 * Get the organization slug from subdomain if on an org subdomain
 */
export const getOrgSlugFromSubdomain = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  const hostname = window.location.hostname;
  if (!hostname || !hostname.endsWith('.merchkins.com')) return undefined;

  const subdomain = hostname.split('.')[0];
  // Skip reserved subdomains
  if (subdomain === 'app' || subdomain === 'staging' || subdomain.startsWith('preview') || subdomain === 'www') {
    return undefined;
  }

  return subdomain;
};

interface ThemeExclusionState {
  pathname: string | null;
  shouldApplyTheme: boolean;
  isSubdomainOrg: boolean;
  setPathname: (pathname: string | null) => void;
  setIsSubdomainOrg: (isSubdomain: boolean) => void;
}

export const useThemeExclusion = create<ThemeExclusionState>((set, get) => ({
  pathname: null,
  shouldApplyTheme: false,
  isSubdomainOrg: false,
  setPathname: (pathname) => {
    const { isSubdomainOrg } = get();
    // Apply theme if:
    // 1. On a /o/slug route (pathname-based), OR
    // 2. On an organization subdomain (hostname-based)
    // AND not on an excluded path
    const isOnOrgRoute = pathname ? isOrgRoute(pathname) : false;
    const isNotExcluded = pathname ? !isExcludedPath(pathname) : true;
    const shouldApplyTheme = (isOnOrgRoute || isSubdomainOrg) && isNotExcluded;
    set({ pathname, shouldApplyTheme });
  },
  setIsSubdomainOrg: (isSubdomain) => {
    const { pathname } = get();
    const isOnOrgRoute = pathname ? isOrgRoute(pathname) : false;
    const isNotExcluded = pathname ? !isExcludedPath(pathname) : true;
    const shouldApplyTheme = (isOnOrgRoute || isSubdomain) && isNotExcluded;
    set({ isSubdomainOrg: isSubdomain, shouldApplyTheme });
  },
}));

// Hook that automatically updates based on current pathname and subdomain
export const useThemeExclusionAuto = () => {
  const pathname = usePathname();
  const { setPathname, setIsSubdomainOrg, shouldApplyTheme, isSubdomainOrg } = useThemeExclusion();

  // Check for subdomain on mount (client-side only)
  React.useEffect(() => {
    const onSubdomain = isOrgSubdomain();
    setIsSubdomainOrg(onSubdomain);
  }, [setIsSubdomainOrg]);

  // Update pathname whenever it changes
  React.useEffect(() => {
    setPathname(pathname);
  }, [pathname, setPathname]);

  return { shouldApplyTheme, isSubdomainOrg };
};
