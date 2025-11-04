"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
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
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
          <p className="text-muted-foreground mb-6">
            No order ID provided. Please check your payment confirmation email.
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
            <CheckCircle className="h-16 w-16 mx-auto" />
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
  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center">
            <div className="text-green-600 mb-4">
              <CheckCircle className="h-20 w-20 mx-auto" />
            </div>
            <CardTitle className="text-3xl text-green-800">
              Payment Successful!
            </CardTitle>
            <p className="text-green-700 mt-2">
              Your payment has been processed successfully.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <span className="text-sm text-muted-foreground">{orderNumber}</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(order.totalAmount || 0)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className={`font-semibold ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isPaid ? 'Paid' : 'Processing'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-semibold">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800">What&apos;s Next?</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Your order is now being processed. We&apos;ll send you updates about your order status and shipping information.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link href={`/orders/${order._id}`} className="flex-1">
                <Button className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  View Order Details
                </Button>
              </Link>

              <Link href="/orders" className="flex-1">
                <Button variant="outline" className="w-full">
                  View All Orders
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
