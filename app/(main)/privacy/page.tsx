import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Merchkins',
  description: 'Privacy policy for Merchkins platform',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold font-heading mb-2">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: December 12, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-slate-700 leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Account information (name, email, phone number)</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Order history and preferences</li>
              <li>Communication records (messages, support tickets)</li>
              <li>Refund request information and related communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Process and fulfill your orders</li>
              <li>Process refund requests and issue refund vouchers</li>
              <li>Send order confirmations, updates, and refund notifications</li>
              <li>Provide customer support</li>
              <li>Improve our platform and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="text-slate-700 leading-relaxed mb-4">We share your information only in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>With sellers to fulfill your orders</li>
              <li>With payment processors to process payments</li>
              <li>With service providers who assist in platform operations</li>
              <li>When required by law or to protect our rights</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">We do not sell your personal information to third parties.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Refund Request Data</h2>
            <p className="text-slate-700 leading-relaxed mb-4">When you submit a refund request, we collect and store:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Your refund request message and reason</li>
              <li>Order details and payment information</li>
              <li>Admin review decisions and responses</li>
              <li>Voucher issuance records</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              This information is used to process your refund request, issue refund vouchers, and maintain records for accounting and legal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-slate-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-slate-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information (subject to legal requirements)</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-slate-700 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, and assist in marketing efforts. You can control
              cookies through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us through the platform's support system.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
