import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OrdersList } from '@/src/features/orders/components/orders-list';

export const metadata: Metadata = {
  title: 'Your Orders — Merchkins Storefront',
  description: 'View your past orders on Merchkins.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  // Handle payment redirects
  const params = await searchParams;
  const paymentStatus = params.payment as string;
  const orderId = params.orderId as string;

  if (paymentStatus && orderId) {
    if (paymentStatus === 'success') {
      redirect(`/orders/payment/success?orderId=${orderId}`);
    } else if (paymentStatus === 'failed') {
      redirect(`/orders/payment/failure?orderId=${orderId}`);
    }
  }

  return (
    <div className="container mx-auto px-3 py-6">
      <OrdersList />
    </div>
  );
}
