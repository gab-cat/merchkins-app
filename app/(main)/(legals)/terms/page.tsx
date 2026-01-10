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
  Ban,
  Package,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Merchkins',
  description:
    'Terms and conditions governing the use of Merchkins platform, compliant with Philippine laws including the Consumer Act, E-Commerce Act, and Internet Transactions Act (R.A. 11967).',
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
          <p className="text-slate-600 mb-8">Last updated: January 15, 2025</p>

          {/* Legal Notice Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 not-prose mb-10">
            <div className="flex items-start gap-3">
              <Scale className="h-6 w-6 text-slate-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Legal Notice</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This agreement is governed by and construed in accordance with the laws of the Republic of the Philippines, including but not
                  limited to the <strong>Consumer Act of the Philippines (R.A. 7394)</strong>, the{' '}
                  <strong>Electronic Commerce Act (R.A. 8792)</strong>, the <strong>Internet Transactions Act of 2023 (R.A. 11967)</strong>, the{' '}
                  <strong>Data Privacy Act of 2012 (R.A. 10173)</strong>, and other applicable laws and regulations.
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
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins reserves the right to suspend or terminate your account at its sole discretion, without prior notice, for conduct that
              Merchkins determines violates these Terms, applicable laws, or platform policies, or is harmful to other users, third parties, or
              Merchkins. Grounds for termination include but are not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Violation of these Terms and Conditions or any platform policies</li>
              <li>Fraudulent, illegal, or deceptive activity</li>
              <li>Infringement of intellectual property rights</li>
              <li>Harassment, abuse, or threats directed at other users or Merchkins staff</li>
              <li>Repeated violations despite warnings</li>
              <li>Failure to comply with applicable laws or government orders</li>
              <li>Any conduct that exposes Merchkins to legal liability or reputational harm</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              You may also request to delete your account by contacting Merchkins support team. Upon account termination, your access to the Platform
              will be immediately revoked, and Merchkins may delete or retain your data in accordance with applicable laws and our Privacy Policy.
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
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium mb-2">Platform Provider Disclaimer</p>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    <strong>Merchkins is NOT a party to transactions between sellers and buyers.</strong> Merchkins is a technology service provider
                    that operates an online platform connecting independent sellers with buyers. Merchkins provides the platform infrastructure,
                    tools, and services, but does not sell, purchase, own, or take title to any products listed on the Platform. The commercial
                    relationship for product sales exists solely between the seller and buyer. Merchkins facilitates transactions but is not a
                    merchant, retailer, or party to the sale contract.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins provides the platform infrastructure and tools. While Merchkins facilitates transactions between sellers and buyers, and may
              offer fulfillment services, Merchkins is not a party to the transaction. The primary commercial relationship for product sales is
              between the seller and buyer. Sellers are solely responsible for their product quality, descriptions, pricing, fulfillment, and
              compliance with applicable laws. Merchkins does not warrant, guarantee, or assume liability for products sold by sellers.
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

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Product Listings and Restrictions</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sellers are solely responsible for their product listings and must ensure all products comply with Philippine laws and regulations.
              Merchkins reserves the right to remove any listing that violates these Terms, applicable laws, or platform policies. This section
              outlines prohibited goods, regulated goods, and the platform's focus on merchandise sales.
            </p>

            <h4 className="text-lg font-semibold mb-3 mt-6">4.4.1 Prohibited Goods and Services</h4>
            <p className="text-slate-700 leading-relaxed mb-4">
              In accordance with <strong>Republic Act No. 11967 (Internet Transactions Act of 2023)</strong> and{' '}
              <strong>DTI Joint Administrative Order No. 22-01</strong>, the following goods and services are strictly prohibited from being sold on
              the Merchkins platform:
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <Ban className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-red-800 font-medium mb-2">Strictly Prohibited Items</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700 text-sm ml-4">
                    <li>
                      <strong>Counterfeit goods and pirated products:</strong> Items that infringe on intellectual property rights, including fake
                      branded merchandise, unauthorized replicas, and pirated content
                    </li>
                    <li>
                      <strong>Weapons, firearms, and ammunition:</strong> Any type of weapon, firearm, ammunition, explosives, or related accessories
                    </li>
                    <li>
                      <strong>Precious metals and conflict minerals:</strong> Precious metals and minerals sourced from conflict zones or without
                      proper documentation
                    </li>
                    <li>
                      <strong>Cultural artifacts and antiquities:</strong> Historical artifacts, cultural treasures, and antiquities protected under
                      Philippine heritage laws
                    </li>
                    <li>
                      <strong>Illegal substances and controlled drugs:</strong> Any illegal drugs, controlled substances, or drug paraphernalia
                    </li>
                    <li>
                      <strong>Sexual services and illegal adult content:</strong> Prostitution services, illegal adult content, or any services
                      prohibited by Philippine law
                    </li>
                    <li>
                      <strong>Seditious or treasonous materials:</strong> Content that promotes sedition, treason, or violates national security laws
                    </li>
                    <li>
                      <strong>Hazardous materials:</strong> Items that pose immediate danger to health, safety, or the environment
                    </li>
                    <li>
                      <strong>Any goods or services specifically banned by Philippine law:</strong> Any other items prohibited by applicable laws,
                      regulations, or government orders
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Penalties:</strong> Violations of these prohibitions may result in fines ranging from{' '}
              <strong>PHP 20,000 to PHP 1,000,000</strong> under Republic Act No. 11967, in addition to potential criminal liability and immediate
              removal of listings and account termination.
            </p>

            <h4 className="text-lg font-semibold mb-3 mt-6">4.4.2 Regulated Goods and Services</h4>
            <p className="text-slate-700 leading-relaxed mb-4">
              Certain goods and services require appropriate permits, licenses, or certifications from relevant government agencies before they can be
              sold online. Sellers offering regulated goods must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Obtain all necessary permits and licenses from the appropriate government agencies</li>
              <li>Display permit or license numbers prominently on product listings as required by law</li>
              <li>Comply with all sale procedures, limitations, and conditions imposed by relevant regulations</li>
              <li>Maintain valid permits and licenses throughout the duration of product sales</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Examples of regulated goods include:</strong>
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <ul className="list-disc list-inside space-y-2 text-amber-800 text-sm ml-4">
                <li>
                  <strong>Food and beverages:</strong> Requires permits from the Food and Drug Administration (FDA) and/or Local Government Unit (LGU)
                </li>
                <li>
                  <strong>Medicines and pharmaceutical products:</strong> Requires FDA registration and permits
                </li>
                <li>
                  <strong>Consumer electronics:</strong> May require DTI certification and compliance with safety standards
                </li>
                <li>
                  <strong>Alcoholic beverages:</strong> Requires LGU permits and Bureau of Internal Revenue (BIR) registration
                </li>
                <li>
                  <strong>Pet food and animal products:</strong> Requires permits from the Bureau of Animal Industry (BAI)
                </li>
                <li>
                  <strong>Other regulated items:</strong> Any product requiring specific government agency permits or certifications
                </li>
              </ul>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              Failure to obtain and display required permits or licenses will result in immediate removal of the product listing and may lead to
              account suspension or termination.
            </p>

            <h4 className="text-lg font-semibold mb-3 mt-6">4.4.3 Platform Focus on Merchandise</h4>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium mb-2">Merchandise-Focused Platform</p>
                  <p className="text-blue-700 text-sm leading-relaxed mb-2">
                    <strong>Merchkins primarily focuses on merchandise sales.</strong> Our platform is designed for sellers offering physical goods
                    and merchandise, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm ml-4">
                    <li>Clothing and apparel (t-shirts, hoodies, accessories)</li>
                    <li>Branded merchandise and promotional items</li>
                    <li>Custom-designed products and personalized items</li>
                    <li>Art prints, posters, and creative merchandise</li>
                    <li>Collectibles and limited edition items</li>
                    <li>Physical products and tangible goods</li>
                  </ul>
                  <p className="text-blue-700 text-sm leading-relaxed mt-2">
                    While Merchkins may accommodate merchandise-related services such as customization, printing, or design services that support
                    merchandise sales, the primary focus remains on physical products and merchandise. Sellers offering services must ensure such
                    services are directly related to merchandise production or enhancement.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sellers are encouraged to focus their storefronts on merchandise and physical products. Any services offered should be ancillary to
              merchandise sales (e.g., custom printing, personalization, design consultation for merchandise).
            </p>

            <h4 className="text-lg font-semibold mb-3 mt-6">4.4.4 Compliance Requirements and Penalties</h4>
            <p className="text-slate-700 leading-relaxed mb-4">
              All sellers must comply with applicable Philippine laws and regulations, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Republic Act No. 11967 (Internet Transactions Act of 2023):</strong> Governing online transactions and e-commerce activities
              </li>
              <li>
                <strong>DTI Joint Administrative Order No. 22-01:</strong> Consolidated rules and guidelines for online businesses
              </li>
              <li>
                <strong>Consumer Act of the Philippines (R.A. 7394):</strong> Consumer protection and product safety requirements
              </li>
              <li>
                <strong>Electronic Commerce Act (R.A. 8792):</strong> E-commerce regulations and electronic transactions
              </li>
              <li>
                <strong>Data Privacy Act of 2012 (R.A. 10173):</strong> Data protection and privacy requirements
              </li>
              <li>All other applicable laws, regulations, and government agency requirements</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Penalties for Non-Compliance:</strong> Violations of these Terms or applicable laws may result in:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <ul className="list-disc list-inside space-y-2 text-red-800 text-sm ml-4">
                <li>Immediate removal of non-compliant product listings</li>
                <li>Fines ranging from PHP 20,000 to PHP 1,000,000 under R.A. 11967</li>
                <li>Account suspension or permanent termination</li>
                <li>Legal action and potential criminal liability</li>
                <li>Reporting to relevant government agencies (DTI, FDA, BIR, etc.)</li>
              </ul>
            </div>

            <h4 className="text-lg font-semibold mb-3 mt-6">4.4.5 Enforcement</h4>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins actively monitors the platform for prohibited and non-compliant listings. Our enforcement actions include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Automated and manual review:</strong> Regular monitoring of product listings for compliance
              </li>
              <li>
                <strong>Immediate removal:</strong> Prohibited items are removed immediately upon detection
              </li>
              <li>
                <strong>Seller notification:</strong> Sellers are notified of violations and given an opportunity to correct non-compliant listings
                (where applicable)
              </li>
              <li>
                <strong>Account actions:</strong> Repeated violations or serious infractions may result in account suspension or termination
              </li>
              <li>
                <strong>Legal reporting:</strong> Serious violations may be reported to relevant government agencies for investigation
              </li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Sellers are responsible for ensuring their listings comply with all applicable laws and these Terms. Merchkins reserves the right to
              remove any listing, suspend or terminate any account, and take any other action deemed necessary to ensure platform compliance and user
              safety.
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
              Merchkins may suspend or terminate seller accounts for violations of these Terms, fraudulent activity, or other conduct detrimental to
              the Platform or its users. Grounds for termination include but are not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Repeated violations of these Terms or platform policies despite warnings</li>
              <li>Fraudulent activity, including but not limited to fake products, payment fraud, or identity theft</li>
              <li>
                <strong>Excessive customer complaints:</strong> A pattern of unresolved customer complaints (defined as three or more valid complaints
                within a 30-day period that result in refunds, replacements, or platform intervention)
              </li>
              <li>Failure to fulfill orders or respond to customer inquiries in a timely manner</li>
              <li>Sale of prohibited goods or failure to obtain required permits for regulated goods</li>
              <li>Violation of data privacy obligations or misuse of customer data</li>
              <li>Any conduct that exposes Merchkins to legal liability or reputational harm</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-4">Upon termination:</p>
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
              Sellers are solely responsible for the accuracy of product descriptions, images, pricing, and availability information. While Merchkins
              strives to ensure information accuracy on the Platform, Merchkins does not warrant that product descriptions or other content provided
              by sellers are accurate, complete, reliable, current, or error-free. Merchkins is not responsible for verifying the accuracy of
              seller-provided product information.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Pricing and Taxes</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              All prices displayed on the Platform are in Philippine Peso (PHP) unless otherwise indicated. Prices are set by individual sellers and
              may change without notice. Any applicable taxes, duties, and shipping costs will be displayed at checkout before you complete your
              purchase.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Order Confirmation</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Your receipt of an electronic or other form of order confirmation does not signify Merchkins' or the seller's acceptance of your order,
              nor does it constitute confirmation of an offer to sell. Merchkins, as the platform provider, reserves the right to limit or cancel
              orders that violate these Terms, applicable laws, or platform policies. Individual sellers also reserve the right to limit or cancel
              orders at their discretion, subject to applicable consumer protection laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.4 Inventory and Availability</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Product availability is subject to change without notice. If a product becomes unavailable after you have placed an order due to seller
              inventory issues, you will be notified by the seller. In such cases, you are entitled to a full refund. Refunds may be issued as
              platform vouchers for convenience, but you retain your statutory right to monetary refunds under the Consumer Act of the Philippines
              (R.A. 7394) and Electronic Commerce Act (R.A. 8792), which cannot be waived.
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
              All payments are processed securely through Merchkins' third-party payment partners. Merchkins does not store complete credit card
              information on its servers. By submitting payment information, you authorize Merchkins and its payment processors to charge the
              applicable fees to your designated payment method for orders placed through the Platform.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Payment Security</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins utilizes industry-standard encryption and security measures to protect your payment information. Merchkins' payment processors
              are PCI-DSS compliant and adhere to strict security standards. However, Merchkins is not responsible for security breaches occurring at
              payment processor facilities or due to user negligence in protecting account credentials.
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
              Merchkins' complete Refund and Cancellation Policy is available at{' '}
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
              <li>Use any automated means (bots, scrapers, etc.) to access the Platform without Merchkins' express written permission</li>
              <li>Attempt to gain unauthorized access to any portion of the Platform or any other systems or networks</li>
              <li>Engage in any fraudulent activity, including but not limited to chargebacks, false claims, or identity theft</li>
              <li>Manipulate prices, engage in fake reviews, or perform any action intended to deceive other users</li>
              <li>Harass, threaten, or abuse other users or Merchkins staff</li>
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
              marks without Merchkins' prior written permission. Unauthorized use of Merchkins trademarks may result in legal action.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.3 User Content</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              By submitting content to the Platform (including reviews, comments, or feedback), you grant Merchkins a non-exclusive, worldwide,
              royalty-free, perpetual, irrevocable, and fully sublicensable license to use, reproduce, modify, adapt, publish, translate, create
              derivative works from, distribute, and display such content in any media.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.4 Intellectual Property Takedown Procedures</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins respects intellectual property rights and will respond to valid notices of alleged infringement. If you believe that content
              on the Platform infringes your intellectual property rights, you may submit a takedown notice to Merchkins containing:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Identification of the copyrighted work or intellectual property claimed to have been infringed</li>
              <li>Identification of the allegedly infringing material and its location on the Platform</li>
              <li>Your contact information (name, address, email, phone)</li>
              <li>A statement that you have a good faith belief that the use is not authorized</li>
              <li>A statement that the information is accurate and you are authorized to act on behalf of the rights owner</li>
              <li>Your physical or electronic signature</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-4">
              Takedown notices should be sent to Merchkins at{' '}
              <a href="mailto:business@merchkins.com" className="text-blue-600 hover:underline">
                business@merchkins.com
              </a>{' '}
              with the subject line "IP Takedown Request". Merchkins will review valid notices and take appropriate action, which may include removing
              or disabling access to the allegedly infringing content. Merchkins reserves the right to terminate accounts of repeat infringers.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Counter-Notification:</strong> If you believe your content was removed in error, you may submit a counter-notification with the
              same information requirements. False or fraudulent takedown notices may result in legal liability.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Gavel className="h-6 w-6 text-slate-600" />
              11. Limitation of Liability
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.1 Platform Liability</h3>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-800 font-medium mb-1">Consumer Protection Rights Preserved</p>
                  <p className="text-amber-700 text-sm">
                    Nothing in this section limits or waives your statutory rights under the Consumer Act of the Philippines (R.A. 7394), Electronic
                    Commerce Act (R.A. 8792), or any other applicable consumer protection laws. These statutory rights cannot be waived by contract.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              To the fullest extent permitted by Philippine law (subject to the exceptions below), Merchkins shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other
              intangible losses, resulting from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Your access to or use of (or inability to access or use) the Platform</li>
              <li>Any conduct or content of any third party (including sellers) on the Platform</li>
              <li>Any content obtained from the Platform</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content (except where due to Merchkins' gross negligence)</li>
              <li>Platform downtime, interruptions, or technical failures (except where due to Merchkins' gross negligence or willful misconduct)</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Exceptions:</strong> The limitations above do not apply to: (a) damages caused by Merchkins' gross negligence or willful
              misconduct; (b) personal injury or death; (c) violations of consumer protection laws where Merchkins is directly responsible; (d) any
              liability that cannot be excluded under Philippine law.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.2 Third-Party Products and Seller Liability</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins, as a platform provider, is not responsible for the quality, safety, legality, or any other aspect of products sold by
              third-party sellers on the Platform. The commercial relationship for product sales exists solely between the seller and buyer. Any
              claims or disputes regarding products, including but not limited to defective products, misrepresentation, or failure to deliver, must
              be raised directly with the seller. Merchkins may facilitate dispute resolution but is not a party to the transaction.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              However, Merchkins may be held liable to the extent required by applicable law, including but not limited to cases where Merchkins has
              actual knowledge of seller violations and fails to take appropriate action, or where Merchkins directly causes harm through its own
              actions or omissions.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.3 Maximum Liability</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Subject to the exceptions in Section 11.1 and applicable consumer protection laws, in no event shall Merchkins' total liability to you
              for all claims arising from Merchkins' provision of platform services (excluding transactions between you and sellers) exceed the amount
              paid by you directly to Merchkins for platform services in the twelve (12) months preceding the claim, or PHP 10,000, whichever is
              greater.
            </p>
            <p className="text-slate-700 leading-relaxed">
              This limitation does not apply to: (a) liability arising from Merchkins' gross negligence or willful misconduct; (b) personal injury or
              death; (c) statutory consumer protection claims where Merchkins is directly responsible; (d) any liability that cannot be limited under
              Philippine law, including the Consumer Act of the Philippines (R.A. 7394).
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You agree to indemnify, defend, and hold harmless Merchkins, its officers, directors, employees, agents, and affiliates from and against
              any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms or any applicable laws</li>
              <li>Your violation of any rights of another (including intellectual property rights, privacy rights, or consumer rights)</li>
              <li>Your conduct in connection with the Platform</li>
              <li>
                <strong>For sellers:</strong> Any claims arising from products you sell, including but not limited to product defects,
                misrepresentation, failure to deliver, or violation of consumer protection laws
              </li>
              <li>
                <strong>For sellers:</strong> Any claims arising from your handling of customer data in violation of the Data Privacy Act of 2012
              </li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              This indemnification obligation does not apply to claims arising solely from Merchkins' gross negligence or willful misconduct. You will
              not be required to indemnify Merchkins for Merchkins' own violations of law or these Terms.
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
              Any dispute arising out of or relating to these Terms or the Platform shall first be submitted to good faith negotiations. The parties
              agree to negotiate in good faith for a period of thirty (30) calendar days from the date one party notifies the other in writing of the
              dispute. If the dispute cannot be resolved through negotiation within thirty (30) days, either party may submit the dispute to:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Mediation:</strong> Through the DTI, BIR, or other recognized mediation body in the Philippines. Mediation must be completed
                within sixty (60) days unless extended by mutual agreement.
              </li>
              <li>
                <strong>Arbitration:</strong> In accordance with the Alternative Dispute Resolution Act of 2004 (R.A. 9285). Arbitration proceedings
                must be initiated within one (1) year from the date the dispute arose, or the claim is forever barred.
              </li>
              <li>
                <strong>Litigation:</strong> In the appropriate courts of Naga City, Camarines Sur, Philippines. Legal action must be commenced within
                the applicable statute of limitations under Philippine law.
              </li>
            </ol>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Time Limits:</strong> All claims against Merchkins must be brought within one (1) year from the date the claim arose, except
              where a longer period is required by applicable law (such as consumer protection claims under R.A. 7394).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">13.3 Consumer Complaints</h3>
            <p className="text-slate-700 leading-relaxed">
              For consumer-related complaints, you may also file a complaint directly with the Department of Trade and Industry (DTI), the Bureau of
              Internal Revenue (BIR), or the appropriate government agency. Merchkins will cooperate fully with any government investigation or
              regulatory proceeding.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">13A. Force Majeure</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins shall not be liable for any failure or delay in performance under these Terms that is due to causes beyond Merchkins'
              reasonable control, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Acts of God, natural disasters, earthquakes, floods, fires, or other natural calamities</li>
              <li>War, terrorism, civil unrest, riots, or acts of government</li>
              <li>Pandemics, epidemics, or public health emergencies</li>
              <li>Strikes, labor disputes, or work stoppages</li>
              <li>Internet or telecommunications failures, cyberattacks, or distributed denial-of-service attacks</li>
              <li>Power outages or utility failures</li>
              <li>Changes in laws, regulations, or government orders</li>
              <li>Failure of third-party service providers (payment processors, hosting providers, etc.)</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-4">
              If a force majeure event occurs, Merchkins will use reasonable efforts to mitigate the effects and resume performance as soon as
              practicable. If the force majeure event continues for more than thirty (30) days, either party may terminate these Terms upon written
              notice.
            </p>
            <p className="text-slate-700 leading-relaxed">
              This force majeure clause does not excuse Merchkins from obligations that can be performed despite the force majeure event, and does not
              limit consumers' statutory rights under Philippine consumer protection laws.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">13B. Service Availability and Disclaimers</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins strives to provide continuous, uninterrupted access to the Platform, but does not guarantee that the Platform will be
              available at all times or free from errors, defects, or interruptions. The Platform is provided on an "as is" and "as available" basis.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Service Interruptions:</strong> Merchkins may temporarily suspend or restrict access to the Platform for maintenance, updates,
              security reasons, or due to force majeure events. Merchkins will use reasonable efforts to provide advance notice of planned
              maintenance, but is not required to do so for emergency maintenance or security issues.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>No Warranties:</strong> To the fullest extent permitted by law, Merchkins disclaims all warranties, express or implied,
              including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, and accuracy. Merchkins
              does not warrant that the Platform will meet your requirements, be uninterrupted, secure, or error-free.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Third-Party Services:</strong> The Platform may integrate with third-party services (payment processors, shipping providers,
              etc.). Merchkins is not responsible for the availability, functionality, or performance of third-party services. Your use of third-party
              services is subject to their respective terms and conditions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">14. Modifications to Terms</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins reserves the right to modify these Terms at any time. Material changes (defined as changes that substantially affect your
              rights or obligations, including but not limited to changes to fees, refund policies, liability limitations, or dispute resolution
              procedures) will be notified through the Platform or via email to registered users at least thirty (30) days before the changes take
              effect. Your continued use of the Platform after any such modifications constitutes your acceptance of the new Terms.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins encourages you to review these Terms periodically for any changes. The "Last updated" date at the top of this page indicates
              when these Terms were last revised. If you do not agree to modified Terms, you must discontinue use of the Platform and may request
              account deletion.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Non-material changes</strong> (such as typographical corrections, clarifications, or administrative updates) may be made without
              prior notice but will be reflected in the "Last updated" date.
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
