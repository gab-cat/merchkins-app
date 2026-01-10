import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Truck, Package, Clock, Store, AlertTriangle, MapPin, HelpCircle, Globe } from 'lucide-react';

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
          <p className="text-slate-600 mb-8">Last updated: January 15, 2026</p>

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
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-800 font-medium mb-1">No Delivery Guarantees</p>
                  <p className="text-amber-700 text-sm">
                    <strong>These are estimates only and are not guarantees.</strong> Actual delivery times may vary significantly due to factors
                    beyond the seller&apos;s or Merchkins' control, including but not limited to: holidays, weather conditions, courier delays,
                    customs clearance (for international shipments), natural disasters, pandemics, strikes, or government actions. Merchkins and
                    sellers do not guarantee delivery within any specific timeframe, and delays do not entitle buyers to refunds unless the product is
                    never delivered or the delay constitutes a material breach of the sale contract.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Merchkins is not responsible for shipping delays, lost packages, or damaged-in-transit items when orders are fulfilled by sellers.
              Buyers should contact the seller directly for shipping inquiries and claims.
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

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-slate-600" />
              6. Lost Packages and Damaged-in-Transit Items
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Seller-Fulfilled Orders:</strong> For orders fulfilled by sellers, the seller is responsible for handling lost package claims
              and damaged-in-transit items. If your package is lost or arrives damaged:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Contact the seller immediately through your order page or the seller&apos;s storefront</li>
              <li>Provide evidence (photos, tracking information, courier documentation)</li>
              <li>The seller should file a claim with the courier and provide a replacement or refund</li>
              <li>If the seller fails to respond within three (3) business days, escalate to Merchkins support</li>
            </ol>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Merchkins-Fulfilled Orders:</strong> For orders fulfilled by Merchkins (indicated by "Fulfilled by Merchkins" badge), Merchkins
              will handle lost package claims and damaged-in-transit items. Contact Merchkins support directly for assistance.
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-red-800 font-medium mb-1">Liability Limitations</p>
                  <p className="text-red-700 text-sm leading-relaxed mb-2">Merchkins, as a platform provider, is not liable for:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700 text-sm ml-4">
                    <li>Lost packages when orders are fulfilled by sellers (seller is responsible)</li>
                    <li>Damaged-in-transit items when orders are fulfilled by sellers (seller is responsible)</li>
                    <li>Shipping delays or delivery failures due to courier errors or force majeure events</li>
                    <li>Customs delays, duties, or import restrictions for international shipments</li>
                    <li>Incorrect shipping addresses provided by buyers</li>
                  </ul>
                  <p className="text-red-700 text-sm mt-2">
                    Merchkins' liability is limited to orders it directly fulfills. For seller-fulfilled orders, buyers must seek remedies directly
                    from sellers, subject to applicable consumer protection laws.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Globe className="h-6 w-6 text-slate-600" />
              7. International Shipping
            </h2>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-800 font-medium mb-1">International Shipping Disclaimer</p>
                  <p className="text-amber-700 text-sm">
                    International shipping is available only when offered by individual sellers. Merchkins does not guarantee international shipping
                    availability or delivery times. International shipments are subject to:
                  </p>
                </div>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Customs and Duties:</strong> Buyers are responsible for all customs duties, taxes, and import fees imposed by the destination
                country. These fees are not included in the product price or shipping fee and must be paid directly to customs authorities upon
                delivery.
              </li>
              <li>
                <strong>Import Restrictions:</strong> Some products may be restricted or prohibited in certain countries. Buyers are responsible for
                ensuring products comply with destination country laws. Merchkins and sellers are not liable if products are seized or rejected by
                customs.
              </li>
              <li>
                <strong>Delivery Times:</strong> International delivery times vary significantly (typically 14-45 business days) and are not
                guaranteed. Delays due to customs clearance, inspections, or local postal services are beyond Merchkins' and sellers' control.
              </li>
              <li>
                <strong>Tracking:</strong> International shipments may have limited or no tracking information depending on the shipping method chosen
                by the seller.
              </li>
              <li>
                <strong>Returns:</strong> International returns may be subject to additional shipping costs and customs fees, which are the
                buyer&apos;s responsibility unless the product is defective or not as described.
              </li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Merchkins is not responsible for international shipping delays, customs issues, import restrictions, or additional fees. Buyers should
              contact sellers directly for international shipping inquiries.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-slate-600" />
              8. Questions About Your Shipment?
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">For questions about shipping, delivery, or tracking:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Contact the seller directly</strong> through your order page or the seller&apos;s storefront (for seller-fulfilled orders)
              </li>
              <li>
                <strong>Check your order status</strong> in &quot;My Orders&quot; for the latest updates
              </li>
              <li>
                <strong>Contact Merchkins support</strong> if you need further assistance or if the seller fails to respond within three (3) business
                days
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
