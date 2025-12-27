import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Scale,
  FileText,
  Users,
  CreditCard,
  ShoppingBag,
  AlertTriangle,
  Shield,
  Globe,
  Gavel,
  Building2,
  Store,
  MessageSquare,
} from 'lucide-react';

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

            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Seller Platform</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins is a unified commerce platform designed for{' '}
              <strong>independent sellers, artists, freelancers, and small-to-medium enterprises (SMEs)</strong>. We provide the technology
              infrastructure, tools, and services that enable sellers to create branded storefronts, manage orders, process payments, handle
              fulfillment, and communicate with customers—all in one place.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Multi-Stakeholder Platform</h3>
            <p className="text-slate-700 leading-relaxed mb-4">The Platform serves multiple stakeholders:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Sellers (Storefront Operators):</strong> Individuals or entities who apply for, set up, and operate storefronts on the
                Platform to sell their products
              </li>
              <li>
                <strong>Buyers (Customers):</strong> Individuals who browse and purchase products from seller storefronts
              </li>
              <li>
                <strong>Merchkins:</strong> The platform operator providing infrastructure, tools, and support services
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Role as Platform Provider</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Important:</strong> Merchkins provides the platform infrastructure and tools. While we facilitate transactions between sellers
              and buyers, and may offer fulfillment services, the primary commercial relationship for product sales is between the seller and buyer.
              Sellers are responsible for their product quality, descriptions, and compliance with applicable laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Services Provided</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Custom Storefronts:</strong> Branded online stores with custom themes, logos, and optional custom domains
              </li>
              <li>
                <strong>Order Management:</strong> Unified dashboard for tracking orders, inventory, and fulfillment status
              </li>
              <li>
                <strong>Payment Processing:</strong> Secure payment processing through third-party payment gateways
              </li>
              <li>
                <strong>Fulfillment Services:</strong> Optional end-to-end order fulfillment from processing to delivery
              </li>
              <li>
                <strong>Omni-Channel Inbox:</strong> Unified messaging across Facebook Messenger, Facebook Page, website chat, and email
              </li>
              <li>
                <strong>Analytics & Reporting:</strong> Business insights and performance metrics for sellers
              </li>
              <li>
                <strong>Customer Support Tools:</strong> Tools for managing customer inquiries and support tickets
              </li>
              <li>
                <strong>Voucher & Discount Management:</strong> Promotional tools for sellers
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.5 Platform Evolution</h3>
            <p className="text-slate-700 leading-relaxed">
              Merchkins continuously develops and expands its services. Future offerings may include design services, production partnerships, and
              enhanced fulfillment options. Such new services will be subject to additional terms as applicable, and users will be notified of
              material changes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Store className="h-6 w-6 text-slate-600" />
              4. Seller Terms
            </h2>

            <p className="text-slate-700 leading-relaxed mb-4">
              This section applies to users who operate storefronts on the Merchkins platform ("Sellers"). By applying for or operating a storefront,
              you agree to these additional terms.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Storefront Application</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              To operate a storefront on Merchkins, you must submit an application providing accurate business information. Merchkins reserves the
              right to approve or reject applications at its sole discretion. Approval may be based on factors including business type, product
              category, and platform capacity.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Seller Eligibility</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sellers must be at least eighteen (18) years of age and possess the legal capacity to enter into contracts. Business entities must be
              validly registered under Philippine law. Sellers are responsible for obtaining any necessary permits, licenses, or registrations
              required for their business activities.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Seller Responsibilities</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Provide accurate and complete product information, including descriptions, images, pricing, and availability</li>
              <li>Fulfill orders in a timely manner and maintain adequate inventory</li>
              <li>Respond to customer inquiries within a reasonable timeframe (recommended within 24-48 hours)</li>
              <li>Handle customer complaints and refund requests fairly and in compliance with applicable laws</li>
              <li>Ensure products meet quality standards and safety requirements</li>
              <li>Comply with all applicable Philippine laws, including consumer protection and tax regulations</li>
              <li>Maintain accurate business and tax records</li>
              <li>Keep storefront information current and accurate</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Product Listings</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sellers are solely responsible for their product listings. Merchkins reserves the right to remove any listing that violates these Terms,
              applicable laws, or platform policies. Prohibited products include but are not limited to: counterfeit goods, weapons, hazardous
              materials, illegal substances, and items that infringe on intellectual property rights.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.5 Pre-Orders and Made-to-Order Products</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sellers offering pre-orders or made-to-order products must clearly disclose estimated production and delivery timelines. Failure to
              fulfill pre-orders within a reasonable timeframe (or as disclosed) may result in account penalties or suspension.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.6 Fulfillment Options</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sellers may choose to fulfill orders independently or utilize Merchkins' fulfillment services where available. Sellers using Merchkins
              fulfillment services agree to separate fulfillment terms as applicable.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.7 Seller Account Termination</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins may suspend or terminate seller accounts for violations of these Terms, fraudulent activity, excessive customer complaints, or
              other conduct detrimental to the Platform or its users. Upon termination:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Pending orders must be fulfilled or properly cancelled with refunds issued</li>
              <li>Outstanding payments will be settled according to standard payout schedules</li>
              <li>Customer data must be handled in accordance with privacy obligations</li>
              <li>Active vouchers issued by the seller remain valid and redeemable platform-wide</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.8 Inactive Storefronts</h3>
            <p className="text-slate-700 leading-relaxed">
              Storefronts with no activity (sales, product updates, or logins) for more than twelve (12) consecutive months may be marked as inactive
              and hidden from public view. Merchkins will attempt to notify sellers before deactivation. Sellers may reactivate their storefronts by
              contacting support.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-slate-600" />
              5. Omni-Channel Communication Terms
            </h2>

            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins provides an omni-channel inbox feature that unifies customer communications across multiple channels. This section governs the
              use of these communication tools.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Supported Channels</h3>
            <p className="text-slate-700 leading-relaxed mb-4">The omni-channel inbox may integrate with the following communication channels:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Facebook Messenger connected to seller business pages</li>
              <li>Facebook Page inbox/messages</li>
              <li>Website live chat widgets</li>
              <li>Email communications</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Third-Party Platform Terms</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Integration with third-party platforms (e.g., Facebook/Meta) is subject to those platforms' terms of service and policies. Users must
              comply with both Merchkins' terms and the applicable third-party platform terms. Merchkins is not responsible for changes, outages, or
              discontinuation of third-party platform integrations.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Acceptable Use</h3>
            <p className="text-slate-700 leading-relaxed mb-4">Users of communication tools agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Use messaging only for legitimate business purposes related to orders and customer service</li>
              <li>Not send spam, unsolicited marketing, or harassing messages</li>
              <li>Respond to customer inquiries professionally and courteously</li>
              <li>Not share customer contact information with third parties without consent</li>
              <li>Handle customer data in compliance with the Data Privacy Act of 2012</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Message Retention</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Messages sent and received through the omni-channel inbox are retained on the Platform for the purpose of customer service, dispute
              resolution, and platform improvement. Message data is retained in accordance with our Privacy Policy and applicable data retention
              requirements.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.5 Customer Data Through Messaging</h3>
            <p className="text-slate-700 leading-relaxed">
              Customer information collected through messaging channels is shared with the relevant seller for order fulfillment and customer service
              purposes. Sellers must handle this data in compliance with the Data Privacy Act of 2012 and our Privacy Policy. Sellers may not use
              customer data for purposes unrelated to their Merchkins storefront without obtaining separate consent.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-slate-600" />
              6. Purchases and Transactions
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Product Information</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sellers are responsible for the accuracy of product descriptions, images, pricing, and availability information. While we strive to
              ensure information accuracy, we do not warrant that product descriptions or other content are accurate, complete, reliable, current, or
              error-free.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Pricing and Taxes</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              All prices displayed on the Platform are in Philippine Peso (PHP) unless otherwise indicated. Prices are set by individual sellers and
              may change without notice. Any applicable taxes, duties, and shipping costs will be displayed at checkout before you complete your
              purchase.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Order Confirmation</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Your receipt of an electronic or other form of order confirmation does not signify our acceptance of your order, nor does it constitute
              confirmation of our offer to sell. We reserve the right to limit or cancel orders at any time after the order has been placed.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.4 Inventory and Availability</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Product availability is subject to change without notice. If a product becomes unavailable after you have placed an order, you will be
              notified and offered a full refund in the form of a platform voucher.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.5 Pre-Orders</h3>
            <p className="text-slate-700 leading-relaxed">
              Some products may be offered as pre-orders with extended production and delivery timelines. Pre-order items are subject to the same
              cancellation policies as regular orders, with the 24-hour window beginning from payment confirmation. Estimated delivery dates for
              pre-orders are estimates only and may be subject to delays.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-slate-600" />
              7. Payment Terms
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Payment Processing</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              All payments are processed securely through our third-party payment partners. We do not store complete credit card information on our
              servers. By submitting payment information, you authorize us and our payment processors to charge the applicable fees to your designated
              payment method.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Payment Security</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              We utilize industry-standard encryption and security measures to protect your payment information. Our payment processors are PCI-DSS
              compliant and adhere to strict security standards.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.3 Accepted Payment Methods</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Credit and debit cards (Visa, Mastercard)</li>
              <li>E-wallets (GCash, Maya)</li>
              <li>Online banking and direct bank transfer</li>
              <li>Over-the-counter payments through partner outlets</li>
              <li>Platform vouchers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.4 Currency</h3>
            <p className="text-slate-700 leading-relaxed">
              All transactions are conducted in Philippine Peso (PHP). International users may incur additional currency conversion fees from their
              payment providers, which are not controlled by Merchkins.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-slate-600" />
              8. Refund and Cancellation Policy
            </h2>

            <p className="text-slate-700 leading-relaxed mb-4">
              Our complete Refund and Cancellation Policy is available at{' '}
              <Link href="/returns" className="text-blue-600 hover:underline">
                /returns
              </Link>
              . Key points include:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Cancellation Window</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Paid orders may be cancelled within <strong>twenty-four (24) hours</strong> of payment confirmation. Unpaid orders may be cancelled at
              any time before payment.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Refund Method</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Consumer Rights and Refund Policy</p>
                  <p className="text-blue-700 text-sm mt-1 mb-2">
                    In accordance with the <strong>Consumer Act of the Philippines (R.A. 7394)</strong> and the{' '}
                    <strong>Electronic Commerce Act (R.A. 8792)</strong>, consumers retain their statutory rights to monetary refunds where required
                    by law.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm ml-4">
                    <li>
                      <strong>Customer-initiated cancellations:</strong> Refunds may be issued as platform vouchers for convenience, subject to the
                      consumer's statutory rights. Consumers retain the right to monetary refunds where required by applicable Philippine consumer
                      protection laws, including but not limited to cases involving defective, damaged, or misrepresented products.
                    </li>
                    <li>
                      <strong>Seller-initiated cancellations:</strong> Refunds will be processed promptly and in accordance with applicable Philippine
                      consumer protection statutes. Monetary refunds will be issued immediately or as required by law, without undue delay.
                    </li>
                    <li>
                      <strong>Statutory rights:</strong> These statutory consumer rights cannot be waived or limited by any policy, term, or
                      condition. The Platform will process all refunds in compliance with applicable Philippine consumer protection statutes,
                      including R.A. 7394 and R.A. 8792.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.3 Consumer Rights</h3>
            <p className="text-slate-700 leading-relaxed">
              In accordance with the <strong>Consumer Act of the Philippines (R.A. 7394)</strong>, consumers have the right to return defective,
              damaged, or misrepresented products. This right is preserved regardless of the cancellation window for returns based on product defects.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Shield className="h-6 w-6 text-slate-600" />
              9. User Conduct and Prohibited Activities
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
              10. Intellectual Property Rights
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.1 Platform Content</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              All content on the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data
              compilations, software, and the compilation thereof, is the property of Merchkins or its content suppliers and is protected by
              Philippine and international copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.2 Trademarks</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              "Merchkins" and all related logos, product and service names, designs, and slogans are trademarks of Merchkins. You may not use such
              marks without our prior written permission.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.3 User Content</h3>
            <p className="text-slate-700 leading-relaxed">
              By submitting content to the Platform (including reviews, comments, or feedback), you grant Merchkins a non-exclusive, worldwide,
              royalty-free, perpetual, irrevocable, and fully sublicensable license to use, reproduce, modify, adapt, publish, translate, create
              derivative works from, distribute, and display such content in any media.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Gavel className="h-6 w-6 text-slate-600" />
              11. Limitation of Liability
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.1 Platform Liability</h3>
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

            <h3 className="text-xl font-semibold mb-3 mt-6">11.2 Third-Party Products</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins is not responsible for the quality, safety, legality, or any other aspect of products sold by third-party sellers on the
              Platform. Any claims or disputes regarding products must be raised directly with the seller.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.3 Maximum Liability</h3>
            <p className="text-slate-700 leading-relaxed">
              In no event shall Merchkins' total liability to you for all claims exceed the amount paid by you to Merchkins in the twelve (12) months
              preceding the claim.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
            <p className="text-slate-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Merchkins, its officers, directors, employees, agents, and affiliates from and against
              any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from: (a) your
              use of the Platform; (b) your violation of these Terms; (c) your violation of any rights of another; or (d) your conduct in connection
              with the Platform.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law and Dispute Resolution</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">13.1 Governing Law</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its
              conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">13.2 Dispute Resolution</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Any dispute arising out of or relating to these Terms or the Platform shall first be submitted to good faith negotiations. If the
              dispute cannot be resolved through negotiation within thirty (30) days, either party may submit the dispute to:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Mediation:</strong> Through the DTI, BIR, or other recognized mediation body in the Philippines
              </li>
              <li>
                <strong>Arbitration:</strong> In accordance with the Alternative Dispute Resolution Act of 2004 (R.A. 9285)
              </li>
              <li>
                <strong>Litigation:</strong> In the appropriate courts of Naga City, Camarines Sur, Philippines
              </li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-6">13.3 Consumer Complaints</h3>
            <p className="text-slate-700 leading-relaxed">
              For consumer-related complaints, you may also file a complaint directly with the Department of Trade and Industry (DTI), the Bureau of
              Internal Revenue (BIR), or the appropriate government agency.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">14. Modifications to Terms</h2>
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
            <h2 className="text-2xl font-semibold mb-4">15. Severability</h2>
            <p className="text-slate-700 leading-relaxed">
              If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such invalidity,
              illegality, or unenforceability shall not affect any other provision of these Terms, and these Terms shall be construed as if such
              invalid, illegal, or unenforceable provision had never been contained herein.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">16. Entire Agreement</h2>
            <p className="text-slate-700 leading-relaxed">
              These Terms, together with the Privacy Policy and Returns & Refund Policy, constitute the entire agreement between you and Merchkins
              regarding your use of the Platform, superseding all prior or contemporaneous communications and proposals, whether oral or written.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">17. Contact Information</h2>
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
