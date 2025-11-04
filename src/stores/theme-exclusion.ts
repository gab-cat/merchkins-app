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

interface ThemeExclusionState {
  pathname: string | null;
  shouldApplyTheme: boolean;
  setPathname: (pathname: string | null) => void;
}

export const useThemeExclusion = create<ThemeExclusionState>((set) => ({
  pathname: null,
  shouldApplyTheme: false,
  setPathname: (pathname) => {
    const shouldApplyTheme = pathname ? isOrgRoute(pathname) && !isExcludedPath(pathname) : false;
    set({ pathname, shouldApplyTheme });
  },
}));

// Hook that automatically updates based on current pathname
export const useThemeExclusionAuto = () => {
  const pathname = usePathname();
  const { setPathname, shouldApplyTheme } = useThemeExclusion();

  // Update pathname whenever it changes
  React.useEffect(() => {
    setPathname(pathname);
  }, [pathname, setPathname]);

  return { shouldApplyTheme };
};
