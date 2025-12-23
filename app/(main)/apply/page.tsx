import type { Metadata } from 'next';
import { ApplyPageClient } from './apply-page-client';

export const metadata: Metadata = {
  title: 'Apply for a Storefront — Merchkins',
  description: 'Open your own storefront on Merchkins. Get unified ordering, payments, and omni-channel customer support for your business.',
  keywords: ['storefront', 'sell online', 'merchkins', 'e-commerce', 'apply', 'open store'],
  openGraph: {
    title: 'Apply for a Storefront — Merchkins',
    description: 'Open your own storefront on Merchkins. Get unified ordering, payments, and omni-channel customer support.',
    type: 'website',
  },
};

export default function ApplyPage() {
  return <ApplyPageClient />;
}
