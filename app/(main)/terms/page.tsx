import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Merchkins',
  description: 'Terms and conditions for using Merchkins platform',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold font-heading mb-2">Terms & Conditions</h1>
          <p className="text-slate-600 mb-8">Last updated: December 12, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              By accessing and using the Merchkins platform, you accept and agree to be bound by these Terms & Conditions. If you do not agree to
              these terms, please do not use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Platform Usage</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins is a multi-vendor marketplace platform that connects customers with sellers. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Use the platform only for lawful purposes</li>
              <li>Provide accurate and truthful information</li>
              <li>Respect the intellectual property rights of others</li>
              <li>Not engage in any fraudulent or deceptive activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Payment Terms</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              All payments are processed securely through our payment partners. By making a purchase, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Pay the full amount at the time of purchase (unless downpayment is available)</li>
              <li>Provide accurate payment information</li>
              <li>Authorize Merchkins to charge your payment method</li>
              <li>Understand that all prices are in Philippine Peso (PHP) unless otherwise stated</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Refund & Cancellation Policy</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Unpaid Orders</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Orders that have not been paid can be cancelled at any time before payment is completed. Once cancelled, the order will be voided and
              inventory will be restored.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Paid Orders - Cancellation Window</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              For orders that have been paid, cancellation requests must be submitted within <strong>24 hours</strong> of payment confirmation. After
              this window, cancellation requests will not be accepted.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Refund Method - Platform Vouchers Only</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>IMPORTANT:</strong> All refunds for paid orders are issued exclusively as platform vouchers. Cash refunds are not available
              under any circumstances. This policy is absolute and non-negotiable.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Refund vouchers are issued in the exact amount of the cancelled order</li>
              <li>
                Vouchers can be used at <strong>any store</strong> on the Merchkins platform
              </li>
              <li>
                Vouchers have <strong>no expiration date</strong> and remain valid indefinitely
              </li>
              <li>
                Vouchers are <strong>non-transferable</strong> and can only be used by the account holder
              </li>
              <li>If an order total exceeds the voucher value, you can pay the difference using cash or card</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Refund Request Process</h3>
            <p className="text-slate-700 leading-relaxed mb-4">To request a refund for a paid order:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Navigate to your order details page</li>
              <li>Click "Request Refund" (available within 24 hours of payment)</li>
              <li>Provide a reason for your refund request</li>
              <li>Submit your request for admin review</li>
              <li>You will receive an email notification once your request is reviewed</li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.5 Refund Approval</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Refund requests are reviewed by organization administrators. Approved refunds will result in a platform voucher being issued to your
              account. You will receive an email with your voucher code and instructions on how to use it.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.6 Non-Refundable Items</h3>
            <p className="text-slate-700 leading-relaxed mb-4">The following are not eligible for refund:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Orders cancelled after the 24-hour window</li>
              <li>Orders that have been delivered</li>
              <li>Digital products or services (unless specified otherwise)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Order Processing</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Orders are processed by individual sellers. Processing times may vary. You will receive updates on your order status through the
              platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-slate-700 leading-relaxed">
              Merchkins acts as a platform connecting buyers and sellers. We are not responsible for the quality, safety, or delivery of products sold
              by third-party sellers. Any disputes regarding products should be resolved directly with the seller.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately upon posting. Your continued
              use of the platform constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have questions about these Terms & Conditions, please contact us through the platform's support system.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
