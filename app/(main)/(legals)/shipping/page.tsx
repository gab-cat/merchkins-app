import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Truck, Package, Clock, Store, AlertTriangle, MapPin, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping Policy — Merchkins',
  description: 'Learn about shipping policies on Merchkins. Orders are handled end-to-end by individual sellers unless stated otherwise.',
  keywords: ['shipping policy', 'delivery', 'order fulfillment', 'Merchkins shipping'],
};

export const revalidate = 86400; // ISR: Revalidate every 24 hours

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-slate max-w-none space-y-8">
          <h1 className="text-3xl font-bold font-heading mb-2">Shipping Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: December 24, 2025</p>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 not-prose mb-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Important Notice</h3>
                <p className="text-amber-800 text-sm leading-relaxed">
                  Unless explicitly stated in the product page or order details that Merchkins handles shipping,{' '}
                  <strong>all orders are fulfilled end-to-end by the respective seller</strong>. This includes packaging, shipping, and delivery of
                  your order.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Store className="h-6 w-6 text-slate-600" />
              1. Seller-Managed Fulfillment
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins is a unified commerce platform that connects buyers with independent sellers, artists, freelancers, and small-to-medium
              businesses. Each storefront on Merchkins is operated by an individual seller who is responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Processing and packaging orders</li>
              <li>Selecting shipping carriers and methods</li>
              <li>Setting shipping rates and delivery timelines</li>
              <li>Providing tracking information when available</li>
              <li>Handling delivery and logistics</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Shipping policies, rates, and delivery timelines may vary between sellers. Please refer to the specific product page or contact the
              seller directly for detailed shipping information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Package className="h-6 w-6 text-slate-600" />
              2. Merchkins Fulfillment Services
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              In some cases, sellers may opt to use Merchkins' fulfillment services. When Merchkins handles fulfillment, it will be clearly indicated
              on the product page or during checkout.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Merchkins-fulfilled orders typically include:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Standardized packaging and quality control</li>
              <li>Partnered courier services for reliable delivery</li>
              <li>Tracking information provided via email and order dashboard</li>
              <li>Centralized customer support for fulfillment inquiries</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> The &quot;Fulfilled by Merchkins&quot; badge on product pages indicates that Merchkins handles the shipping for
                that particular order.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-slate-600" />
              3. Estimated Delivery Times
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Delivery times vary depending on the seller&apos;s location, shipping method, and destination. General estimates are:
            </p>
            <div className="grid md:grid-cols-2 gap-4 not-prose mb-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Metro Manila</h4>
                <p className="text-slate-600 text-sm">3-7 business days</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Provincial Areas</h4>
                <p className="text-slate-600 text-sm">7-14 business days</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Pre-order Items</h4>
                <p className="text-slate-600 text-sm">As indicated on product page</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">International</h4>
                <p className="text-slate-600 text-sm">Seller-dependent (if available)</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Please note that these are estimates only. Actual delivery times may vary due to factors beyond the seller&apos;s control, including
              holidays, weather conditions, and courier delays.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Truck className="h-6 w-6 text-slate-600" />
              4. Shipping Fees
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">Shipping fees are determined by individual sellers based on:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Package weight and dimensions</li>
              <li>Destination address</li>
              <li>Selected shipping method (standard, express, etc.)</li>
              <li>Any promotional offers or free shipping thresholds</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              The exact shipping fee will be displayed during checkout before you confirm your order. Some sellers may offer free shipping promotions
              or discounted rates for orders above a certain amount.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <MapPin className="h-6 w-6 text-slate-600" />
              5. Order Tracking
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">When available, tracking information will be provided by the seller through:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Email notification with tracking number and carrier link</li>
              <li>Your Merchkins order dashboard under &quot;My Orders&quot;</li>
              <li>Direct message from the seller via the platform</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Not all shipments may include tracking, depending on the shipping method chosen by the seller. If you need tracking information, please
              contact the seller directly before placing your order.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-slate-600" />
              6. Questions About Your Shipment?
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">For questions about shipping, delivery, or tracking:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Contact the seller directly</strong> through your order page or the seller&apos;s storefront
              </li>
              <li>
                <strong>Check your order status</strong> in &quot;My Orders&quot; for the latest updates
              </li>
              <li>
                <strong>Contact Merchkins support</strong> if you need further assistance
              </li>
            </ol>

            <div className="bg-slate-50 rounded-xl p-6 not-prose">
              <h3 className="font-semibold text-slate-900 mb-3">Merchkins Support</h3>
              <ul className="space-y-2 text-slate-700 text-sm">
                <li>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:business@merchkins.com" className="text-blue-600 hover:underline">
                    business@merchkins.com
                  </a>
                </li>
                <li>
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+639999667583" className="text-blue-600 hover:underline">
                    +63 (999) 966-7583
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* Related Pages */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Related Policies</h2>
            <div className="grid md:grid-cols-2 gap-4 not-prose">
              <Link href="/returns" className="group block bg-slate-50 hover:bg-slate-100 rounded-xl p-6 transition-colors">
                <Package className="h-6 w-6 text-slate-600 mb-3 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-semibold text-slate-900 mb-2">Returns & Refunds</h3>
                <p className="text-slate-600 text-sm">Learn about our return policy and refund process.</p>
              </Link>
              <Link href="/help" className="group block bg-slate-50 hover:bg-slate-100 rounded-xl p-6 transition-colors">
                <HelpCircle className="h-6 w-6 text-slate-600 mb-3 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-semibold text-slate-900 mb-2">Help Center</h3>
                <p className="text-slate-600 text-sm">Find answers to frequently asked questions.</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
