import { redirect, notFound } from 'next/navigation';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ code: string }>;
}

export const metadata: Metadata = {
  title: 'Redirecting... — Merchkins',
  description: 'Redirecting to product page',
};

export default async function CodeRedirectPage({ params }: PageProps) {
  const { code } = await params;

  // Lookup product by code
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const product = await client.query(api.products.queries.index.getProductByCode, {
    code: code.toUpperCase(),
  });

  if (!product || !product.organizationInfo?.slug || !product.slug) {
    notFound();
  }

  // Redirect to the product page
  redirect(`/o/${product.organizationInfo.slug}/p/${product.slug}`);
}
