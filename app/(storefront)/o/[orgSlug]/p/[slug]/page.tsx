import React from 'react';
import type { Metadata } from 'next';
import { ProductDetailBoundary } from '@/src/features/products/components/product-detail';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';
import { buildR2PublicUrl } from '@/lib/utils';

// Enable ISR - regenerate page every 60 seconds
export const revalidate = 60;

interface PageProps {
  params: Promise<{ orgSlug: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orgSlug, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });
  if (!organization) return {};

  // Resolve favicon URL using R2 public URL
  const faviconUrl = buildR2PublicUrl(organization.logo as string | undefined) || '/favicon.ico';

  let product = null;
  try {
    product = await client.query(api.products.queries.index.getProductBySlug, {
      slug,
      organizationId: organization._id,
    });
  } catch {}

  const title = product?.title ? `${product.title} — ${organization.name}` : `Product — ${organization.name}`;
  const description = product?.description || `View product details and purchase options from ${organization.name}.`;

  // Resolve product image URL for Open Graph using R2 public URL
  const ogImage = buildR2PublicUrl(product?.imageUrl?.[0] || (organization.logo as string | undefined)) || '/favicon.ico';

  return {
    title,
    description,
    keywords: [
      product?.title || '',
      organization.name,
      'custom merchandise',
      'personalized products',
      product?.categoryInfo?.name || '',
      ...(product?.tags || []),
    ].filter(Boolean),
    alternates: { canonical: `${baseUrl}/o/${orgSlug}/p/${slug}` },
    icons: {
      icon: faviconUrl,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/o/${orgSlug}/p/${slug}`,
      siteName: organization.name,
      locale: 'en_US',
      type: 'website',
      images: ogImage
        ? [
            {
              url: ogImage as string,
              width: 1200,
              height: 630,
              alt: product?.title || organization.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@merchkins',
      creator: '@merchkins',
      images: ogImage ? [ogImage as string] : undefined,
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

export default async function Page({ params }: PageProps) {
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

  // Fetch product to get productId for recommendations query
  const product = await client.query(api.products.queries.index.getProductBySlug, {
    slug,
    organizationId: organization._id,
  });

  // Preload product query
  const preloadedProduct = await preloadQuery(api.products.queries.index.getProductBySlug, { slug, organizationId: organization._id });

  // Preload recommendations query if product exists
  const preloadedRecommendations = product?._id
    ? await preloadQuery(api.products.queries.index.getProductRecommendations, { productId: product._id, limit: 8 })
    : undefined;

  return (
    <div>
      <ProductDetailBoundary slug={slug} orgSlug={orgSlug} preloadedProduct={preloadedProduct} preloadedRecommendations={preloadedRecommendations} />
      {/* Structured Data */}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.title,
              description: product.description || `Buy ${product.title} on Merchkins`,
              image: product.imageUrl?.[0]
                ? product.imageUrl[0].startsWith('http')
                  ? product.imageUrl[0]
                  : buildR2PublicUrl(product.imageUrl[0])
                : undefined,
              brand: organization ? { '@type': 'Brand', name: organization.name } : undefined,
              offers: {
                '@type': 'Offer',
                price: product.minPrice || 0,
                priceCurrency: 'USD',
                availability: product.inventory > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                seller: organization
                  ? {
                      '@type': 'Organization',
                      name: organization.name,
                    }
                  : undefined,
              },
              aggregateRating:
                product.reviewsCount > 0
                  ? {
                      '@type': 'AggregateRating',
                      ratingValue: product.rating,
                      reviewCount: product.reviewsCount,
                    }
                  : undefined,
              category: product.categoryInfo?.name,
            }),
          }}
        />
      )}
    </div>
  );
}
