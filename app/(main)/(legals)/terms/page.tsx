import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Scale, FileText, Users, CreditCard, ShoppingBag, AlertTriangle, Shield, Globe, Gavel, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Merchkins',
  description:
    'Terms and conditions governing the use of Merchkins platform, compliant with Philippine laws including the Consumer Act and E-Commerce Act.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-slate max-w-none space-y-8">
          <h1 className="text-3xl font-bold font-heading mb-2">Terms & Conditions</h1>
          <p className="text-slate-600 mb-8">Last updated: December 22, 2025</p>

          {/* Legal Notice Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 not-prose mb-10">
            <div className="flex items-start gap-3">
              <Scale className="h-6 w-6 text-slate-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Legal Notice</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This agreement is governed by and construed in accordance with the laws of the Republic of the Philippines, including but not
                  limited to the <strong>Consumer Act of the Philippines (R.A. 7394)</strong>, the{' '}
                  <strong>Electronic Commerce Act (R.A. 8792)</strong>, the <strong>Data Privacy Act of 2012 (R.A. 10173)</strong>, and other
                  applicable laws and regulations.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-slate-600" />
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              By accessing, browsing, registering for, or using the Merchkins platform ("Platform"), you ("User", "you", or "your") acknowledge that
              you have read, understood, and agree to be legally bound by these Terms and Conditions ("Terms"), along with our Privacy Policy and
              Returns & Refund Policy, which are incorporated herein by reference.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you do not agree to these Terms, you must immediately discontinue your use of the Platform. Your continued use of the Platform
              following the posting of any changes to these Terms constitutes acceptance of those changes.
            </p>
            <p className="text-slate-700 leading-relaxed">
              These Terms constitute a legally binding agreement between you and <strong>Merchkins</strong> ("we", "us", or "our"), operated by
              Merchkins, with principal place of business at Magis TBI Richie Hall, Ateneo de Naga University, Ateneo Avenue, Bagumbayan Sur, Naga
              City, Camarines Sur, 4400, Philippines.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Users className="h-6 w-6 text-slate-600" />
              2. User Eligibility and Account Registration
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Eligibility</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              To use the Platform, you must be at least eighteen (18) years of age and possess the legal capacity to enter into binding contracts
              under Philippine law. If you are below 18 years old, you may only use the Platform under the supervision and with the consent of a
              parent or legal guardian, who agrees to be bound by these Terms on your behalf.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Account Registration</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              To access certain features of the Platform, you may be required to register for an account. When registering, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Provide accurate, current, and complete information as required by the registration form</li>
              <li>Maintain and promptly update your registration information to keep it accurate, current, and complete</li>
              <li>Maintain the security and confidentiality of your account credentials</li>
              <li>Notify us immediately of any unauthorized use of your account or any other breach of security</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Account Termination</h3>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at our sole discretion, without prior notice, for conduct that we determine
              violates these Terms, is harmful to other users, third parties, or us, or for any other reason we deem appropriate. You may also request
              to delete your account by contacting our support team.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Globe className="h-6 w-6 text-slate-600" />
              3. Platform Description and Nature of Service
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Marketplace Platform</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins is a multi-vendor e-commerce marketplace platform that connects buyers with sellers (organizations, businesses, and other
              entities). We provide the technology infrastructure and services that enable sellers to list and sell products, and buyers to discover
              and purchase such products.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Role as Intermediary</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Important:</strong> Merchkins acts solely as an intermediary platform. We are not a party to the transactions between buyers and
              sellers. Sellers are independent third parties, and Merchkins does not take ownership or possession of the products sold through the
              Platform.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Services Provided</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Product listing and storefront management for sellers</li>
              <li>Order management and processing tools</li>
              <li>Secure payment processing through third-party payment gateways</li>
              <li>Customer communication and support tools</li>
              <li>Analytics and reporting for sellers</li>
              <li>Voucher and discount management</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-slate-600" />
              4. Purchases and Transactions
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Product Information</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sellers are responsible for the accuracy of product descriptions, images, pricing, and availability information. While we strive to
              ensure information accuracy, we do not warrant that product descriptions or other content are accurate, complete, reliable, current, or
              error-free.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Pricing and Taxes</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              All prices displayed on the Platform are in Philippine Peso (PHP) unless otherwise indicated. Prices are set by individual sellers and
              may change without notice. Any applicable taxes, duties, and shipping costs will be displayed at checkout before you complete your
              purchase.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Order Confirmation</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Your receipt of an electronic or other form of order confirmation does not signify our acceptance of your order, nor does it constitute
              confirmation of our offer to sell. We reserve the right to limit or cancel orders at any time after the order has been placed.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Inventory and Availability</h3>
            <p className="text-slate-700 leading-relaxed">
              Product availability is subject to change without notice. If a product becomes unavailable after you have placed an order, you will be
              notified and offered a full refund in the form of a platform voucher.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-slate-600" />
              5. Payment Terms
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Payment Processing</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              All payments are processed securely through our third-party payment partners. We do not store complete credit card information on our
              servers. By submitting payment information, you authorize us and our payment processors to charge the applicable fees to your designated
              payment method.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Payment Security</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              We utilize industry-standard encryption and security measures to protect your payment information. Our payment processors are PCI-DSS
              compliant and adhere to strict security standards.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Accepted Payment Methods</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Credit and debit cards (Visa, Mastercard)</li>
              <li>E-wallets (GCash, Maya)</li>
              <li>Online banking and direct bank transfer</li>
              <li>Over-the-counter payments through partner outlets</li>
              <li>Platform vouchers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Currency</h3>
            <p className="text-slate-700 leading-relaxed">
              All transactions are conducted in Philippine Peso (PHP). International users may incur additional currency conversion fees from their
              payment providers, which are not controlled by Merchkins.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-slate-600" />
              6. Refund and Cancellation Policy
            </h2>

            <p className="text-slate-700 leading-relaxed mb-4">
              Our complete Refund and Cancellation Policy is available at{' '}
              <Link href="/returns" className="text-blue-600 hover:underline">
                /returns
              </Link>
              . Key points include:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Cancellation Window</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Paid orders may be cancelled within <strong>twenty-four (24) hours</strong> of payment confirmation. Unpaid orders may be cancelled at
              any time before payment.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Refund Method</h3>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-800 font-medium">Important Notice</p>
                  <p className="text-amber-700 text-sm mt-1">
                    All refunds are issued exclusively as <strong>platform vouchers</strong>. Cash refunds, bank transfers, or refunds to original
                    payment methods are <strong>not available</strong> under any circumstances. This policy is disclosed prior to purchase.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Consumer Rights</h3>
            <p className="text-slate-700 leading-relaxed">
              In accordance with the <strong>Consumer Act of the Philippines (R.A. 7394)</strong>, consumers have the right to return defective,
              damaged, or misrepresented products. This right is preserved regardless of the cancellation window for returns based on product defects.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Shield className="h-6 w-6 text-slate-600" />
              7. User Conduct and Prohibited Activities
            </h2>

            <p className="text-slate-700 leading-relaxed mb-4">By using the Platform, you agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Violate any applicable local, national, or international law or regulation</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Transmit any material that is defamatory, obscene, or otherwise objectionable</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity</li>
              <li>Interfere with or disrupt the Platform or servers or networks connected to the Platform</li>
              <li>Use any automated means (bots, scrapers, etc.) to access the Platform without our express written permission</li>
              <li>Attempt to gain unauthorized access to any portion of the Platform or any other systems or networks</li>
              <li>Engage in any fraudulent activity, including but not limited to chargebacks, false claims, or identity theft</li>
              <li>Manipulate prices, engage in fake reviews, or perform any action intended to deceive other users</li>
              <li>Harass, threaten, or abuse other users or our staff</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Violation of any of these prohibitions may result in immediate termination of your account and potential legal action.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-slate-600" />
              8. Intellectual Property Rights
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Platform Content</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              All content on the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data
              compilations, software, and the compilation thereof, is the property of Merchkins or its content suppliers and is protected by
              Philippine and international copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Trademarks</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              "Merchkins" and all related logos, product and service names, designs, and slogans are trademarks of Merchkins. You may not use such
              marks without our prior written permission.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.3 User Content</h3>
            <p className="text-slate-700 leading-relaxed">
              By submitting content to the Platform (including reviews, comments, or feedback), you grant Merchkins a non-exclusive, worldwide,
              royalty-free, perpetual, irrevocable, and fully sublicensable license to use, reproduce, modify, adapt, publish, translate, create
              derivative works from, distribute, and display such content in any media.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Gavel className="h-6 w-6 text-slate-600" />
              9. Limitation of Liability
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.1 Platform Liability</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              To the fullest extent permitted by Philippine law, Merchkins shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Your access to or use of (or inability to access or use) the Platform</li>
              <li>Any conduct or content of any third party on the Platform</li>
              <li>Any content obtained from the Platform</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Third-Party Products</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins is not responsible for the quality, safety, legality, or any other aspect of products sold by third-party sellers on the
              Platform. Any claims or disputes regarding products must be raised directly with the seller.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.3 Maximum Liability</h3>
            <p className="text-slate-700 leading-relaxed">
              In no event shall Merchkins' total liability to you for all claims exceed the amount paid by you to Merchkins in the twelve (12) months
              preceding the claim.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p className="text-slate-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Merchkins, its officers, directors, employees, agents, and affiliates from and against
              any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from: (a) your
              use of the Platform; (b) your violation of these Terms; (c) your violation of any rights of another; or (d) your conduct in connection
              with the Platform.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law and Dispute Resolution</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.1 Governing Law</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its
              conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.2 Dispute Resolution</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Any dispute arising out of or relating to these Terms or the Platform shall first be submitted to good faith negotiations. If the
              dispute cannot be resolved through negotiation within thirty (30) days, either party may submit the dispute to:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Mediation:</strong> Through the DTI or other recognized mediation body in the Philippines
              </li>
              <li>
                <strong>Arbitration:</strong> In accordance with the Alternative Dispute Resolution Act of 2004 (R.A. 9285)
              </li>
              <li>
                <strong>Litigation:</strong> In the appropriate courts of Naga City, Camarines Sur, Philippines
              </li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.3 Consumer Complaints</h3>
            <p className="text-slate-700 leading-relaxed">
              For consumer-related complaints, you may also file a complaint directly with the Department of Trade and Industry (DTI) or the
              appropriate government agency.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">12. Modifications to Terms</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. Material changes will be notified through the Platform or via email to
              registered users. Your continued use of the Platform after any such modifications constitutes your acceptance of the new Terms.
            </p>
            <p className="text-slate-700 leading-relaxed">
              We encourage you to review these Terms periodically for any changes. The "Last updated" date at the top of this page indicates when
              these Terms were last revised.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">13. Severability</h2>
            <p className="text-slate-700 leading-relaxed">
              If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such invalidity,
              illegality, or unenforceability shall not affect any other provision of these Terms, and these Terms shall be construed as if such
              invalid, illegal, or unenforceable provision had never been contained herein.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">14. Entire Agreement</h2>
            <p className="text-slate-700 leading-relaxed">
              These Terms, together with the Privacy Policy and Returns & Refund Policy, constitute the entire agreement between you and Merchkins
              regarding your use of the Platform, superseding all prior or contemporaneous communications and proposals, whether oral or written.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              For any questions or concerns regarding these Terms & Conditions, please contact us:
            </p>
            <div className="bg-slate-50 rounded-xl p-6 not-prose">
              <ul className="space-y-3 text-slate-700">
                <li>
                  <strong>Company:</strong> Merchkins
                </li>
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
                <li>
                  <strong>Address:</strong> Magis TBI Richie Hall, Ateneo de Naga University, Ateneo Avenue, Bagumbayan Sur, Naga City, Camarines Sur,
                  4400, Philippines
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
