import React from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';

export default async function Head({ params }: { params: Promise<{ orgSlug: string; slug: string }> }) {
  const { orgSlug, slug } = await params;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });
  if (!organization) return null;

  let product: Doc<'products'> | null = null;
  try {
    product = await client.query(api.products.queries.index.getProductBySlug, {
      slug,
      organizationId: organization._id,
    });
  } catch {}

  if (!product) return null;

  let imageUrl: string | undefined;
  const imageKey = Array.isArray(product.imageUrl) ? product.imageUrl[0] : undefined;
  if (imageKey) {
    try {
      imageUrl = await client.query(api.files.queries.index.getFileUrl, { key: imageKey });
    } catch {}
  }

  const offerPrice: number | undefined = product.minPrice ?? product.supposedPrice ?? product.maxPrice;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: imageUrl ? [imageUrl] : undefined,
    brand: {
      '@type': 'Organization',
      name: organization.name,
    },
    aggregateRating:
      product.rating && product.reviewsCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(product.rating.toFixed(1)),
            reviewCount: product.reviewsCount,
          }
        : undefined,
    offers:
      typeof offerPrice === 'number'
        ? {
            '@type': 'Offer',
            priceCurrency: 'PHP',
            price: Number(offerPrice.toFixed(2)),
            availability: (product.inventory ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `/o/${organization.slug}/p/${product.slug}`,
          }
        : undefined,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
