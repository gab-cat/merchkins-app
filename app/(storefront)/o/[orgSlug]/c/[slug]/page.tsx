import React from 'react';
import type { Metadata } from 'next';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { CategoryProducts } from '@/src/features/categories/components/category-products';
import { preloadQuery } from 'convex/nextjs';
import { buildR2PublicUrl } from '@/lib/utils';

interface Params {
  params: Promise<{ orgSlug: string; slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { orgSlug, slug } = await params;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });
  if (!organization) return {};

  // Resolve favicon URL using R2 public URL
  let faviconUrl = (organization.logo as string | undefined) || '/favicon.ico';
  faviconUrl = buildR2PublicUrl(faviconUrl) || '/favicon.ico';

  let category = null;
  try {
    category = await client.query(api.categories.queries.index.getCategoryBySlug, {
      slug,
      organizationId: organization._id,
    });
  } catch {}
  const title = category?.name ? `${category.name} — ${organization.name}` : `Category — ${organization.name}`;
  return {
    title,
    description: 'Browse products in this organization category.',
    alternates: { canonical: `/o/${orgSlug}/c/${slug}` },
    icons: {
      icon: faviconUrl,
    },
    openGraph: {
      title,
      url: `/o/${orgSlug}/c/${slug}`,
      description: 'Browse products in this organization category.',
    },
  };
}

export default async function Page({ params }: Params) {
  const { orgSlug, slug } = await params;
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

  // Preload organization query
  const preloadedOrganization = await preloadQuery(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });

  // Preload category query
  const preloadedCategory = await preloadQuery(api.categories.queries.index.getCategoryBySlug, { slug, organizationId: organization._id });

  // Fetch category to get categoryId for products query
  const category = await client.query(api.categories.queries.index.getCategoryBySlug, {
    slug,
    organizationId: organization._id,
  });

  // Preload products query if category exists
  const preloadedProducts = category?._id
    ? await preloadQuery(api.products.queries.index.getProducts, {
        organizationId: organization._id,
        categoryId: category._id,
        sortBy: 'newest',
        limit: 24,
        offset: 0,
        hasInventory: true,
      })
    : undefined;

  return (
    <div className="container mx-auto px-3 py-6">
      <CategoryProducts
        slug={slug}
        orgSlug={orgSlug}
        preloadedOrganization={preloadedOrganization}
        preloadedCategory={preloadedCategory}
        preloadedProducts={preloadedProducts}
      />
      {/* Structured Data */}
      {category && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: category.name,
              description: category.seoDescription || category.description || `Browse ${category.name} products on ${organization?.name}`,
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com'}/o/${orgSlug}/c/${slug}`,
              mainEntity: {
                '@type': 'ItemList',
                name: category.name,
                description: category.seoDescription || category.description || `Browse ${category.name} products on ${organization?.name}`,
                numberOfItems: category.activeProductCount || category.productCount,
              },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: organization?.name,
                    item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com'}/o/${orgSlug}`,
                  },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: category.name,
                    item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com'}/o/${orgSlug}/c/${slug}`,
                  },
                ],
              },
            }),
          }}
        />
      )}
    </div>
  );
}
