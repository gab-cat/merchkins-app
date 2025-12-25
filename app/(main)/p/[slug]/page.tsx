import React from 'react';
import { ProductDetailBoundary } from '@/src/features/products/components/product-detail';
import { preloadQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import type { Metadata } from 'next';
import { buildR2PublicUrl } from '@/lib/utils';
import { notFound } from 'next/navigation';

// Enable ISR - regenerate page every 60 seconds
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  // Fetch product first to get productId for recommendations query
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const product = await client.query(api.products.queries.index.getProductBySlug, { slug });

  // Preload product query
  const preloadedProduct = await preloadQuery(api.products.queries.index.getProductBySlug, { slug });

  // Preload recommendations query if product exists
  const preloadedRecommendations = product?._id
    ? await preloadQuery(api.products.queries.index.getProductRecommendations, { productId: product._id, limit: 8 })
    : undefined;

  return (
    <div className="max-w-7xl mx-auto w-full">
      <ProductDetailBoundary slug={slug} preloadedProduct={preloadedProduct} preloadedRecommendations={preloadedRecommendations} />
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
              brand: product.organizationInfo ? { '@type': 'Brand', name: product.organizationInfo.name } : undefined,
              offers: {
                '@type': 'Offer',
                price: product.minPrice || 0,
                priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                priceCurrency: 'PHP',
                availability: product.inventory > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                seller: product.organizationInfo
                  ? {
                      '@type': 'Organization',
                      name: product.organizationInfo.name,
                    }
                  : undefined,
                shippingDetails: {
                  '@type': 'OfferShippingDetails',
                  shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: 0,
                    currency: 'PHP',
                  },
                  shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'PH',
                  },
                  deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: {
                      '@type': 'QuantitativeValue',
                      minValue: 1,
                      maxValue: 3,
                      unitCode: 'DAY',
                    },
                    transitTime: {
                      '@type': 'QuantitativeValue',
                      minValue: 3,
                      maxValue: 7,
                      unitCode: 'DAY',
                    },
                  },
                },
                hasMerchantReturnPolicy: {
                  '@type': 'MerchantReturnPolicy',
                  applicableCountry: 'PH',
                  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                  merchantReturnDays: 7,
                  returnMethod: 'https://schema.org/ReturnByMail',
                  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
                },
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
    const product = await client.query(api.products.queries.index.getProductBySlug, { slug });

    if (!product) {
      return {
        title: 'Product Not Found — Merchkins',
        description: 'The requested product could not be found.',
      };
    }

    const title = `${product.title} — Merchkins Storefront`;
    const description =
      product.description ||
      `Discover and purchase ${product.title}. ${product.categoryInfo?.name ? `Browse ${product.categoryInfo.name} products` : ''} on Merchkins.`;

    // Resolve product image URL for Open Graph using R2 public URL
    let ogImage = product.imageUrl?.[0] || '/favicon.ico';
    if (product.imageUrl?.[0] && !product.imageUrl[0].startsWith('http')) {
      ogImage = buildR2PublicUrl(product.imageUrl[0]) || '/favicon.ico';
    }

    return {
      title,
      description,
      keywords: [
        product.title,
        'custom merch',
        'personalized products',
        product.categoryInfo?.name || '',
        product.organizationInfo?.name || '',
        ...(product.tags || []),
      ].filter(Boolean),
      authors: product.creatorInfo ? [{ name: `${product.creatorInfo.firstName || ''} ${product.creatorInfo.lastName || ''}`.trim() }] : undefined,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/p/${slug}`,
        siteName: 'Merchkins',
        locale: 'en_US',
        type: 'website',
        images: ogImage
          ? [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: product.title,
              },
            ]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
        creator: '@merchkins',
      },
      alternates: {
        canonical: `${baseUrl}/p/${slug}`,
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
  } catch (error) {
    // If product not found or other error, return basic metadata
    return {
      title: 'Product — Merchkins Storefront',
      description: 'Discover unique custom merchandise on Merchkins.',
      alternates: {
        canonical: `${baseUrl}/p/${slug}`,
      },
    };
  }
}
