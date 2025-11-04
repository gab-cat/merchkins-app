import React from 'react';
import type { Metadata } from 'next';
import { SearchResults } from '@/src/features/products/components/search-results';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export async function generateMetadata({ params }: { params: Promise<{ orgSlug: string }> }): Promise<Metadata> {
  const { orgSlug } = await params;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });
  if (!organization) return {};

  // Resolve favicon URL if key
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');
  let faviconUrl = (organization.logo as string | undefined) || '/favicon.ico';
  if (isKey(faviconUrl)) {
    try {
      faviconUrl = await client.query(api.files.queries.index.getFileUrl, { key: faviconUrl as string });
    } catch {}
  }

  const title = `Search — ${organization.name}`;
  return {
    title,
    description: 'Search for products in this organization.',
    alternates: { canonical: `/o/${orgSlug}/search` },
    icons: {
      icon: faviconUrl,
    },
    openGraph: {
      title,
      url: `/o/${orgSlug}/search`,
      description: 'Search for products in this organization.',
    },
  };
}

export default async function Page({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  // Validate org exists to avoid leakage between orgs
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });
  if (!organization) {
    return (
      <div className="container mx-auto px-3 py-12 text-center">
        <p className="text-muted-foreground">Organization not found.</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-3 py-6">
      <SearchResults orgSlug={orgSlug} />
    </div>
  );
}
