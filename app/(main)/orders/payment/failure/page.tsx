"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw, ArrowLeft, MessageCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const order = useQuery(
    api.orders.queries.index.getOrderById,
    orderId ? { orderId: orderId as Id<'orders'> } : 'skip'
  );

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <XCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
          <p className="text-muted-foreground mb-6">
            No order ID provided. Please check your order details.
          </p>
          <Link href="/orders">
            <Button>View My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <XCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find the order you&apos;re looking for. Please contact support if you believe this is an error.
          </p>
          <Link href="/orders">
            <Button>View My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = order.orderNumber || `Order #${order._id.slice(-8)}`;
  const canRetryPayment = order.status === 'PENDING' && order.paymentStatus !== 'PAID';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="text-center">
            <div className="text-red-600 mb-4">
              <XCircle className="h-20 w-20 mx-auto" />
            </div>
            <CardTitle className="text-3xl text-red-800">
              Payment Failed
            </CardTitle>
            <p className="text-red-700 mt-2">
              Your payment could not be processed at this time.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <span className="text-sm text-muted-foreground">{orderNumber}</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-semibold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(order.totalAmount || 0)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="font-semibold text-red-600">Failed</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Status</span>
                  <span className="font-semibold">{order.status}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Common reasons for payment failure:</h4>
              <ul className="text-amber-700 text-sm space-y-1">
                <li>• Insufficient funds in your account</li>
                <li>• Payment method was declined</li>
                <li>• Network or connection issues</li>
                <li>• Payment session expired</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              {canRetryPayment && order.xenditInvoiceUrl && (
                <Button
                  className="w-full"
                  onClick={() => window.location.href = order.xenditInvoiceUrl!}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Payment Again
                </Button>
              )}

              <Link href={`/orders/${order._id}`}>
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  View Order Details
                </Button>
              </Link>

              <Link href="/orders">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800">Need Help?</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    If you&apos;re experiencing repeated payment issues, please contact our support team for assistance.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
