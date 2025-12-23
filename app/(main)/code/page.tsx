import type { Metadata } from 'next';
import { CodePageClient } from './code-page-client';

export const metadata: Metadata = {
  title: 'Enter Product Code — Merchkins',
  description: 'Quick access to products using unique product codes on Merchkins. Enter your product code to find and purchase items.',
  keywords: ['product code', 'quick access', 'merchkins', 'find product'],
  openGraph: {
    title: 'Enter Product Code — Merchkins',
    description: 'Quick access to products using unique product codes on Merchkins.',
    type: 'website',
  },
};

export default function CodePage() {
  return <CodePageClient />;
}
