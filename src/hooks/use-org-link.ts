'use client';

import { useCallback, useEffect, useState } from 'react';
import { isOrgSubdomain } from '@/src/stores/theme-exclusion';

/**
 * Hook to build subdomain-aware organization links.
 *
 * When on an org subdomain (e.g., adnu-cocs.merchkins.com), returns simplified paths without /o/[orgSlug].
 * When on the main app domain, returns full paths with /o/[orgSlug].
 *
 * @param orgSlug - The organization slug
 * @returns buildOrgLink function and isOnSubdomain boolean
 *
 * @example
 * const { buildOrgLink } = useOrgLink(orgSlug);
 * // On subdomain: buildOrgLink('/search') => '/search'
 * // On main domain: buildOrgLink('/search') => '/o/adnu-cocs/search'
 */
export function useOrgLink(orgSlug: string | undefined) {
  const [isOnSubdomain, setIsOnSubdomain] = useState(false);

  useEffect(() => {
    setIsOnSubdomain(isOrgSubdomain());
  }, []);

  const buildOrgLink = useCallback(
    (path: string = '/') => {
      if (!orgSlug) return path;

      // If on subdomain, use simplified path (browser already knows the org)
      if (isOnSubdomain) {
        return path;
      }

      // On main app domain, include /o/[orgSlug] prefix
      return `/o/${orgSlug}${path === '/' ? '' : path}`;
    },
    [orgSlug, isOnSubdomain]
  );

  return { buildOrgLink, isOnSubdomain };
}
