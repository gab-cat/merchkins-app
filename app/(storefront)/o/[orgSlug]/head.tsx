import React from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { buildR2PublicUrl } from '@/lib/utils';

export default async function Head({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });

  // Resolve logo URL directly using R2 public URL
  const logo = buildR2PublicUrl(organization?.logo as string | undefined);

  const jsonLd = organization
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: organization.name,
        url: `/${['o', organization.slug].join('/')}`,
        logo: logo || '/favicon.ico',
        description: organization.description || undefined,
        sameAs: organization.website ? [organization.website] : undefined,
      }
    : undefined;

  return <>{jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}</>;
}
