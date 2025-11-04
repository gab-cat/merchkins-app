import React from 'react';
import type { Metadata } from 'next';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';
import { SiteHeader } from '@/src/features/common/components/site-header';
import { SiteFooter } from '@/src/features/common/components/site-footer';
import { OrgThemeProvider } from '@/src/features/organizations/components/org-theme-provider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Organization — Merchkins',
  description: 'Organization storefront',
};

export default async function OrgLayout({ children, params }: { children: React.ReactNode; params: Promise<{ orgSlug: string }> }) {
  // Apply lightweight theming per organization via CSS variables
  // We rely on Tailwind CSS variables in globals.css
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const { orgSlug } = await params;
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });
  const t = organization?.themeSettings;

  // Preload organization query for client-side hydration
  const preloadedOrganization = await preloadQuery(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });

  const styleVars: Record<string, string> = {};
  if (t?.primaryColor) styleVars['--primary'] = t.primaryColor;
  if (t?.secondaryColor) styleVars['--accent'] = t.secondaryColor;
  if (t?.fontFamily) styleVars['--font-sans'] = t.fontFamily;
  if (t?.borderRadius) {
    const radiusMap: Record<string, string> = {
      none: '0rem',
      small: '0.375rem',
      medium: '0.75rem',
      large: '1rem',
    };
    styleVars['--radius'] = radiusMap[t.borderRadius] || '0.75rem';
  }

  if (t?.headerBackgroundColor) styleVars['--header-bg'] = t.headerBackgroundColor;
  if (t?.headerForegroundColor) styleVars['--header-fg'] = t.headerForegroundColor;
  if (t?.headerTitleColor) styleVars['--header-title'] = t.headerTitleColor;
  if (t?.footerBackgroundColor) styleVars['--footer-bg'] = t.footerBackgroundColor;
  if (t?.footerForegroundColor) styleVars['--footer-fg'] = t.footerForegroundColor;

  const wrapperClassName = t?.mode === 'dark' ? 'dark' : undefined;

  return (
    <div className={wrapperClassName} style={styleVars as React.CSSProperties}>
      <OrgThemeProvider preloadedOrganization={preloadedOrganization} />
      <SiteHeader />
      <div className="flex-1 max-w-7xl mx-auto w-full min-h-[80vh]">{children}</div>
      <SiteFooter />
    </div>
  );
}
