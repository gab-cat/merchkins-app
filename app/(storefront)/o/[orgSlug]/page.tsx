import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { notFound } from 'next/navigation';
import { preloadQuery } from 'convex/nextjs';
import { MessageSquare, Ticket } from 'lucide-react';
import { AnimatedBanner } from '@/src/components/animated-banner';
import { AnimatedAnnouncements } from '@/src/components/animated-announcements';
import { AnimatedPopularProducts } from '@/src/components/animated-popular-products';
import { AnimatedFeaturedCategories } from '@/src/components/animated-featured-categories';
import { buildR2PublicUrl } from '@/lib/utils';

interface PageParams {
  params: Promise<{ orgSlug: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { orgSlug } = await params;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });
  if (!organization) {
    return {
      title: 'Organization — Merchkins',
      description: 'Organization storefront',
    };
  }
  // Resolve signed URLs if values are R2 keys
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');
  let ogImage = (organization.bannerImage as string | undefined) || (organization.logo as string | undefined) || '/favicon.ico';
  let faviconUrl = (organization.logo as string | '') || '/favicon.ico';
  if (isKey(ogImage)) {
    try {
      ogImage = await client.query(api.files.queries.index.getFileUrl, { key: ogImage as string });
    } catch {}
  }
  if (isKey(faviconUrl) && faviconUrl) {
    faviconUrl = buildR2PublicUrl(faviconUrl) || '/favicon.ico';
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

  return {
    title: `${organization.name} — Merchkins`,
    description: organization.description || 'Organization storefront on Merchkins',
    keywords: [organization.name, 'custom merch', 'personalized products', 'merchandise', 'organization', 'storefront'],
    alternates: { canonical: `${baseUrl}/o/${organization.slug}` },
    icons: {
      icon: faviconUrl,
    },
    openGraph: {
      title: `${organization.name} — Merchkins`,
      description: organization.description || 'Organization storefront on Merchkins',
      url: `${baseUrl}/o/${organization.slug}`,
      siteName: 'Merchkins',
      locale: 'en_US',
      type: 'website',
      images: ogImage
        ? [
            {
              url: ogImage as string,
              width: 1200,
              height: 630,
              alt: organization.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${organization.name} — Merchkins`,
      description: organization.description || 'Organization storefront on Merchkins',
      images: ogImage ? [ogImage as string] : undefined,
      creator: '@merchkins',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function Page({ params }: PageParams) {
  const { orgSlug } = await params;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');
  let bannerUrl = organization?.bannerImage as string | undefined;
  if (bannerUrl && isKey(bannerUrl)) {
    try {
      bannerUrl = await client.query(api.files.queries.index.getFileUrl, { key: bannerUrl });
    } catch {}
  }
  let logoUrl = organization?.logo as string | undefined;
  if (logoUrl && isKey(logoUrl)) {
    try {
      logoUrl = await client.query(api.files.queries.index.getFileUrl, { key: logoUrl });
    } catch {}
  }

  if (!organization || organization.isDeleted) return notFound();

  const orgPinned = organization._id
    ? await client.query(api.announcements.queries.index.getPinnedAnnouncements, { organizationId: organization._id })
    : [];

  // Preload organization query
  const preloadedOrganization = await preloadQuery(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });

  // Preload products query
  const preloadedProducts = await preloadQuery(api.products.queries.index.getPopularProducts, { limit: 8, organizationId: organization._id });

  // Preload categories query
  const preloadedCategories = await preloadQuery(api.categories.queries.index.getCategories, {
    organizationId: organization._id,
    isFeatured: true,
    isActive: true,
    limit: 6,
  });

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Compact banner with integrated organization info */}
      <AnimatedBanner bannerUrl={bannerUrl} logoUrl={logoUrl} organization={organization} orgSlug={orgSlug} />

      {/* Pinned announcements */}
      <AnimatedAnnouncements announcements={orgPinned} />

      {/* Featured content */}
      <AnimatedPopularProducts orgSlug={orgSlug} preloadedOrganization={preloadedOrganization} preloadedProducts={preloadedProducts} />
      <AnimatedFeaturedCategories orgSlug={orgSlug} preloadedOrganization={preloadedOrganization} preloadedCategories={preloadedCategories} />

      {/* Helpful links */}
      <section className="container mx-auto px-3 pb-8">
        <div className="mt-2 flex gap-3 text-sm">
          <Link href={`/o/${orgSlug}/chats`} className="inline-flex items-center gap-1.5 text-primary underline">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat with us</span>
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href={`/o/${orgSlug}/tickets/new`} className="inline-flex items-center gap-1.5 text-primary underline">
            <Ticket className="h-3.5 w-3.5" />
            <span>Create a ticket</span>
          </Link>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: organization.name,
            description: organization.description || `Custom merch and personalized products from ${organization.name}`,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com'}/o/${organization.slug}`,
            logo: logoUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com'}/favicon.ico`,
            image: bannerUrl || logoUrl,
            sameAs: [
              // Add social media URLs if available
            ],
          }),
        }}
      />
    </div>
  );
}
