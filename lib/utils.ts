import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Computes the effective price for a product variant, considering size-specific pricing.
 * Returns size.price if available, otherwise falls back to variant.price.
 */
export function computeEffectivePrice(
  variant: { price: number; sizes?: Array<{ id: string; label: string; price?: number }> },
  selectedSize?: { id: string; label: string; price?: number }
): number {
  if (selectedSize?.price !== undefined) {
    return selectedSize.price;
  }
  return variant.price;
}

/**
 * Builds a public URL for R2 storage files.
 * @param fileKey - The file key or full URL
 * @returns The computed public URL or null if invalid
 */
export function buildR2PublicUrl(fileKey: string | null | undefined): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  const joinUrl = (a: string, b: string): string => `${a.replace(/\/+$/u, '')}/${String(b).replace(/^\/+/, '')}`;

  if (!fileKey) return null;
  if (typeof fileKey === 'string' && /^https?:\/\//u.test(fileKey)) {
    return fileKey;
  }
  if (!baseUrl) return null;
  return joinUrl(baseUrl, fileKey);
}
