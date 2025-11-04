'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { ReportPaymentDialog } from './report-payment-dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { showToast } from '@/lib/toast';
import type { Id } from '@/convex/_generated/dataModel';

interface OrderItemUI {
  productInfo: {
    imageUrl?: string[];
    title: string;
    variantName?: string | null;
  };
  quantity: number;
  price?: number;
}

function formatCurrency(amount: number | undefined) {
  if (amount === undefined) return '';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(amount);
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

function StatusBadge({ value }: { value: string }) {
  const variant: 'default' | 'secondary' | 'destructive' = value === 'CANCELLED' ? 'destructive' : value === 'PENDING' ? 'secondary' : 'default';
  return <Badge variant={variant}>{value}</Badge>;
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const order = useQuery(api.orders.queries.index.getOrderById, {
    orderId: orderId as Id<'orders'>,
    includeItems: true,
  });

  const createInvoice = useAction(api.payments.actions.index.createXenditInvoice);
  const updateOrderInvoice = useMutation(api.orders.mutations.index.createXenditInvoiceForOrder);

  const loading = order === undefined;

  const handleCreateInvoice = async () => {
    if (!order) return;

    try {
      showToast({ type: 'info', title: 'Creating payment link...', description: 'Please wait while we create a payment link for your order.' });

      const invoice = await createInvoice({
        orderId: order._id,
        amount: order.totalAmount || 0,
        customerEmail: order.customerInfo.email,
        externalId: order.orderNumber || `order-${order._id}`,
      });

      // Update the order with the invoice details
      await updateOrderInvoice({
        orderId: order._id,
        xenditInvoiceId: invoice.invoiceId,
        xenditInvoiceUrl: invoice.invoiceUrl,
        xenditInvoiceExpiryDate: invoice.expiryDate,
      });

      showToast({
        type: 'success',
        title: 'Payment link created',
        description: 'Redirecting to payment...',
      });

      // Redirect to payment
      window.location.href = invoice.invoiceUrl;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      showToast({
        type: 'error',
        title: 'Failed to create payment link',
        description: 'Please try again or contact support.',
      });
    }
  };

  const items = useMemo<OrderItemUI[]>(() => {
    if (!order) return [];
    if (order.embeddedItems) return order.embeddedItems as unknown as OrderItemUI[];
    // @ts-expect-error items is present when includeItems is true and not embedded
    return (order.items ?? []) as unknown as OrderItemUI[];
  }, [order]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-1/2 animate-pulse rounded bg-secondary" />
        <div className="h-5 w-1/5 animate-pulse rounded bg-secondary" />
        <div className="h-10 w-1/3 animate-pulse rounded bg-secondary" />
        <div className="grid gap-3">
          {new Array(3).fill(null).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-20 rounded-md bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (order === null) {
    return <div className="text-sm text-muted-foreground">Order not found.</div>;
  }

  return (
    <div>
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/orders">Orders</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{order.orderNumber ? `#${order.orderNumber}` : 'Order'}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.orderNumber ? `Order #${order.orderNumber}` : 'Order'}</h1>
          <div className="mt-1 text-sm text-muted-foreground">Placed on {new Date(order.orderDate).toLocaleString()}</div>
        </div>
        <StatusBadge value={order.status} />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          {items.map((it, idx) => (
            <Card key={idx}>
              <CardContent className="flex items-center gap-4 p-4">
                <ProductImage imageKey={it.productInfo.imageUrl?.[0]} />
                <div className="flex-1">
                  <div className="font-medium">{it.productInfo.title}</div>
                  <div className="text-sm text-muted-foreground">{it.productInfo.variantName ?? ''}</div>
                  <div className="text-sm">Qty: {it.quantity}</div>
                </div>
                <div className="text-right font-medium">{formatCurrency(it.price)}</div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && <div className="text-sm text-muted-foreground">No items.</div>}
        </div>

        <div>
          <div className="rounded-lg border p-4">
            <div className="text-lg font-semibold">Summary</div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-sm">
              <span>Items</span>
              <span>{order.itemCount}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span>Discount</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="mt-4 space-y-2">
              {/* Show Pay Now button for pending orders without payment links */}
              {order.status === 'PENDING' && order.paymentStatus !== 'PAID' && !order.xenditInvoiceUrl && (
                <Button className="w-full" onClick={handleCreateInvoice}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              )}

              {/* Show payment link if available */}
              {order.xenditInvoiceUrl && order.status === 'PENDING' && order.paymentStatus !== 'PAID' && (
                <Button className="w-full" onClick={() => (window.location.href = order.xenditInvoiceUrl!)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Complete Payment
                </Button>
              )}

              {/* Show manual payment reporting for other cases */}
              {order.paymentStatus !== 'PAID' && (
                <ReportPaymentDialog orderId={String(order._id)} defaultAmount={order.totalAmount} defaultCurrency={'PHP'} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductImage({ imageKey }: { imageKey?: string }) {
  const url = useQuery(api.files.queries.index.getFileUrl, imageKey ? { key: imageKey } : 'skip');
  if (!url) return <div className="h-16 w-16 rounded-md bg-secondary" />;
  return <Image src={url} alt="Product image" width={64} height={64} className="h-16 w-16 rounded-md object-cover" />;
}
