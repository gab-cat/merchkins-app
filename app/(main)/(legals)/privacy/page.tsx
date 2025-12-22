import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, Share2, UserCheck, Clock, Globe, Bell, FileText, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Merchkins',
  description:
    'Learn how Merchkins collects, uses, and protects your personal information in compliance with the Data Privacy Act of 2012 (RA 10173).',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-slate max-w-none space-y-8">
          <h1 className="text-3xl font-bold font-heading mb-2">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: December 22, 2025</p>

          {/* Data Privacy Compliance Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 not-prose mb-10">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-900 mb-2">Data Privacy Act Compliance</h3>
                <p className="text-emerald-700 text-sm leading-relaxed">
                  Merchkins is committed to protecting your privacy and ensuring compliance with the
                  <strong> Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and its Implementing Rules and Regulations (IRR), as enforced by
                  the <strong>National Privacy Commission (NPC)</strong> of the Philippines.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-slate-600" />
              1. Introduction
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              This Privacy Policy describes how Merchkins ("we", "us", or "our") collects, uses, stores, shares, and protects your personal
              information when you use our platform ("Platform"), including our website and any associated services.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              By accessing or using our Platform, you consent to the collection, use, and disclosure of your personal information in accordance with
              this Privacy Policy. If you do not agree with this policy, please do not use our Platform.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Merchkins is operated by Merchkins, with principal place of business at Magis TBI Richie Hall, Ateneo de Naga University, Ateneo Avenue,
              Bagumbayan Sur, Naga City, Camarines Sur, 4400, Philippines.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Database className="h-6 w-6 text-slate-600" />
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide Directly</h3>
            <p className="text-slate-700 leading-relaxed mb-4">We collect information you provide when you:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Create an account:</strong> Name, email address, phone number, password
              </li>
              <li>
                <strong>Complete your profile:</strong> Profile picture, shipping addresses, billing information
              </li>
              <li>
                <strong>Make a purchase:</strong> Payment information, shipping details, order preferences
              </li>
              <li>
                <strong>Contact us:</strong> Messages, support tickets, feedback, complaints
              </li>
              <li>
                <strong>Request a refund:</strong> Reason for refund, supporting documentation
              </li>
              <li>
                <strong>Participate in surveys or promotions:</strong> Responses, preferences, demographic information
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Information We Collect Automatically</h3>
            <p className="text-slate-700 leading-relaxed mb-4">When you use our Platform, we automatically collect:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Device information:</strong> Device type, operating system, browser type, unique device identifiers
              </li>
              <li>
                <strong>Log data:</strong> IP address, access times, pages viewed, referring URL, actions taken on the Platform
              </li>
              <li>
                <strong>Location information:</strong> General location based on IP address (we do not collect precise GPS location without consent)
              </li>
              <li>
                <strong>Cookies and similar technologies:</strong> Session data, preferences, authentication tokens
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Information from Third Parties</h3>
            <p className="text-slate-700 leading-relaxed mb-4">We may receive information about you from:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>
                <strong>Social login providers:</strong> When you sign in using Google, Facebook, or other social accounts
              </li>
              <li>
                <strong>Payment processors:</strong> Transaction details, payment status, fraud indicators
              </li>
              <li>
                <strong>Sellers:</strong> Order fulfillment status, delivery information
              </li>
              <li>
                <strong>Analytics providers:</strong> Aggregated usage data
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Omni-Channel Communication Data</h3>
            <p className="text-slate-700 leading-relaxed mb-4">When you communicate through our omni-channel inbox, we collect:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Facebook Messenger:</strong> Messages, profile information (name, profile picture) as permitted by Facebook's data policies
              </li>
              <li>
                <strong>Facebook Page messages:</strong> Inquiries, comments, and replies on connected business pages
              </li>
              <li>
                <strong>Website chat:</strong> Chat messages, session data, and any information you voluntarily provide
              </li>
              <li>
                <strong>Email:</strong> Email address, message content, and attachments
              </li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              This data is collected to provide customer support, process orders, and maintain communication history for dispute resolution.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Eye className="h-6 w-6 text-slate-600" />
              3. How We Use Your Information
            </h2>

            <p className="text-slate-700 leading-relaxed mb-4">
              Under the Data Privacy Act of 2012, we process your personal information based on the following lawful bases and for the following
              purposes:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Contractual Necessity</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Process and fulfill your orders</li>
              <li>Manage your account and provide customer support</li>
              <li>Process payments and refunds (including voucher issuance)</li>
              <li>Communicate order status, delivery updates, and transaction confirmations</li>
              <li>Facilitate dispute resolution between buyers and sellers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Legitimate Interest</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Improve and optimize our Platform and services</li>
              <li>Analyze usage patterns and trends</li>
              <li>Detect, prevent, and address fraud, security issues, and technical problems</li>
              <li>Personalize your experience and provide relevant recommendations</li>
              <li>Conduct research and analytics to enhance our services</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Legal Compliance</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Comply with applicable laws, regulations, and legal processes</li>
              <li>Respond to lawful requests from government authorities</li>
              <li>Maintain proper business records as required by law</li>
              <li>Enforce our Terms and Conditions and other agreements</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Consent</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Send promotional communications and newsletters (with your opt-in consent)</li>
              <li>Use cookies for analytics and advertising purposes</li>
              <li>Share your information with third parties for marketing purposes (only with explicit consent)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Share2 className="h-6 w-6 text-slate-600" />
              4. How We Share Your Information
            </h2>

            <p className="text-slate-700 leading-relaxed mb-4">We may share your personal information with:</p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Sellers (Storefront Operators)</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              When you place an order or communicate with a seller through our platform, we share your information with the relevant seller. Sellers
              receive:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Shipping and billing address</li>
              <li>Order details (products, quantities, preferences)</li>
              <li>Communication history through our omni-channel inbox</li>
              <li>Payment status (not payment method details)</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Seller obligations:</strong> Sellers are contractually required to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Use customer data only for order fulfillment and customer service</li>
              <li>Handle data in compliance with the Data Privacy Act of 2012</li>
              <li>Not share customer data with third parties without consent</li>
              <li>Not use customer data for unrelated marketing without separate consent</li>
              <li>Implement reasonable security measures to protect customer data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Service Providers</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              We engage trusted third-party service providers who assist us in operating our Platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Payment processors:</strong> To process your payments securely (e.g., Xendit, GCash, Maya)
              </li>
              <li>
                <strong>Cloud hosting providers:</strong> To host and maintain our Platform infrastructure
              </li>
              <li>
                <strong>Email service providers:</strong> To send transactional and promotional emails
              </li>
              <li>
                <strong>Analytics providers:</strong> To analyze Platform usage and improve our services
              </li>
              <li>
                <strong>Customer support tools:</strong> To manage and respond to your inquiries
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Legal and Regulatory Authorities</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may disclose your information when required by law, to respond to legal process, to protect our rights, or in connection with a
              merger, acquisition, or sale of assets.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 No Sale of Personal Data</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-blue-800">
                <strong>We do not sell your personal information to third parties.</strong> Your data is never traded or exchanged for monetary
                consideration.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Share2 className="h-6 w-6 text-slate-600" />
              5. Third-Party API Integrations
            </h2>

            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins integrates with third-party platforms to provide omni-channel communication features for sellers. This section describes how
              we access, use, store, and protect data from these integrations.
            </p>

            {/* Google API Disclosure Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 not-prose mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shrink-0">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Google API Services User Data Disclosure</h3>
                  <p className="text-slate-600 text-sm">Gmail integration for omni-channel inbox (available to organization administrators)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Accessed</h4>
                  <p className="text-slate-600 text-sm mb-2">When organization administrators connect their Gmail account, we access:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm ml-2">
                    <li>Email messages (read-only) from the connected inbox</li>
                    <li>Email metadata (sender, recipient, subject, date)</li>
                    <li>User profile information (email address, name)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Usage</h4>
                  <p className="text-slate-600 text-sm mb-2">Google user data is used exclusively to:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm ml-2">
                    <li>Display email messages within our omni-channel inbox interface</li>
                    <li>Enable sellers to respond to customer inquiries from a unified dashboard</li>
                    <li>Synchronize email communications for customer support purposes</li>
                  </ul>
                  <p className="text-slate-600 text-sm mt-2">
                    <strong>
                      We do not use Google user data for advertising, profiling, or any purpose unrelated to providing the omni-channel inbox feature.
                    </strong>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Sharing</h4>
                  <p className="text-slate-600 text-sm">
                    Google user data is <strong>not shared with any third parties</strong>. Data is only accessible to the organization administrator
                    who connected the account and authorized team members within their organization. We do not sell, rent, or trade Google user data.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Storage & Protection</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm ml-2">
                    <li>Google OAuth tokens are encrypted at rest using AES-256 encryption</li>
                    <li>Email content is cached temporarily for display purposes only</li>
                    <li>Data is stored on secure, access-controlled cloud infrastructure</li>
                    <li>Access is restricted to authorized personnel only</li>
                    <li>We implement industry-standard security measures including TLS encryption for data in transit</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Retention & Deletion</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm ml-2">
                    <li>OAuth tokens are retained only while the integration is active</li>
                    <li>Cached email data is retained for up to 30 days for display purposes</li>
                    <li>Users can disconnect their Google account at any time via Settings {'>'} Integrations</li>
                    <li>Upon disconnection, all Google user data (tokens and cached content) is deleted within 7 days</li>
                    <li>Users may request immediate deletion by contacting business@merchkins.com</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mt-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Google API Services User Data Policy Compliance:</strong> Merchkins' use and transfer of information received from Google
                    APIs adheres to the{' '}
                    <a
                      href="https://developers.google.com/terms/api-services-user-data-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Google API Services User Data Policy
                    </a>
                    , including the Limited Use requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Facebook/Meta API Disclosure Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 not-prose">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shrink-0">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Meta (Facebook) API User Data Disclosure</h3>
                  <p className="text-slate-600 text-sm">Facebook Messenger and Page integration for omni-channel inbox</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Accessed</h4>
                  <p className="text-slate-600 text-sm mb-2">When sellers connect their Facebook Page, we access:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm ml-2">
                    <li>Facebook Messenger conversations from the connected Page</li>
                    <li>Facebook Page inbox messages and comments</li>
                    <li>User profile information of message senders (name, profile picture as permitted by Facebook)</li>
                    <li>Page access tokens for sending/receiving messages</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Usage</h4>
                  <p className="text-slate-600 text-sm mb-2">Facebook/Meta user data is used exclusively to:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm ml-2">
                    <li>Display Messenger and Page conversations in our unified inbox</li>
                    <li>Enable sellers to respond to customer messages from one dashboard</li>
                    <li>Facilitate order inquiries and customer support through Messenger</li>
                    <li>Associate conversations with customer orders when applicable</li>
                  </ul>
                  <p className="text-slate-600 text-sm mt-2">
                    <strong>
                      We do not use Facebook user data for advertising, building user profiles, or any purpose beyond providing customer communication
                      features.
                    </strong>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Sharing</h4>
                  <p className="text-slate-600 text-sm">
                    Facebook user data is shared only with the seller (storefront operator) who connected the Facebook Page. Data is{' '}
                    <strong>not shared with any other third parties</strong>. We do not sell, rent, or trade Facebook user data.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Storage & Protection</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm ml-2">
                    <li>Facebook access tokens are encrypted at rest</li>
                    <li>Conversation data is stored in secure, access-controlled databases</li>
                    <li>All data transfers use TLS encryption</li>
                    <li>Access is restricted to the connected seller and their authorized team members</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Data Retention & Deletion</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm ml-2">
                    <li>Conversation history is retained while the integration is active for customer service continuity</li>
                    <li>Access tokens are retained only while the integration is connected</li>
                    <li>Sellers can disconnect their Facebook Page at any time via Settings {'>'} Integrations</li>
                    <li>Upon disconnection, access tokens are deleted immediately; conversation data is deleted within 30 days</li>
                    <li>Users may request immediate deletion by contacting business@merchkins.com</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mt-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Meta Platform Terms Compliance:</strong> Merchkins' use of data received from Meta APIs complies with the{' '}
                    <a
                      href="https://developers.facebook.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Meta Platform Terms
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://developers.facebook.com/policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Developer Policies
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Globe className="h-6 w-6 text-slate-600" />
              6. International Data Transfers
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Your personal information may be transferred to and processed in countries outside the Philippines where our service providers operate.
              When such transfers occur, we ensure appropriate safeguards are in place, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Standard contractual clauses or data protection agreements with service providers</li>
              <li>Assessment of the recipient country's level of data protection</li>
              <li>Implementation of technical and organizational security measures</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              In accordance with NPC Circular No. 2016-02, we ensure that cross-border data transfers comply with the requirements of the Data Privacy
              Act.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Lock className="h-6 w-6 text-slate-600" />
              7. Data Security
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We implement robust technical, organizational, and physical security measures to protect your personal information from unauthorized
              access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Encryption:</strong> SSL/TLS encryption for data in transit; encryption at rest for sensitive data
              </li>
              <li>
                <strong>Access controls:</strong> Role-based access controls limiting data access to authorized personnel
              </li>
              <li>
                <strong>Authentication:</strong> Secure authentication mechanisms including multi-factor authentication options
              </li>
              <li>
                <strong>Monitoring:</strong> Continuous monitoring for security threats and suspicious activities
              </li>
              <li>
                <strong>Regular audits:</strong> Periodic security assessments and vulnerability testing
              </li>
              <li>
                <strong>Employee training:</strong> Data privacy and security training for all staff
              </li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to protect your
              personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-slate-600" />
              8. Data Retention
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by
              law. Specific retention periods include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Account information:</strong> Retained while your account is active and for 5 years after deletion (for legal/tax purposes)
              </li>
              <li>
                <strong>Transaction records:</strong> Retained for 10 years as required by Philippine tax regulations
              </li>
              <li>
                <strong>Support communications:</strong> Retained for 3 years after resolution
              </li>
              <li>
                <strong>Marketing consent records:</strong> Retained until consent is withdrawn, plus 2 years for proof of consent
              </li>
              <li>
                <strong>Log data:</strong> Retained for 90 days for security and analytics purposes
              </li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Upon expiration of the retention period, your personal information will be securely deleted or anonymized in accordance with our data
              destruction procedures.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <UserCheck className="h-6 w-6 text-slate-600" />
              9. Your Rights Under the Data Privacy Act
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Under the Data Privacy Act of 2012, you have the following rights regarding your personal information:
            </p>

            <div className="grid md:grid-cols-2 gap-4 not-prose mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Right to Be Informed</h4>
                <p className="text-slate-600 text-sm">Know how your personal data is being processed, including its purpose, scope, and method.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Right to Access</h4>
                <p className="text-slate-600 text-sm">
                  Obtain a copy of your personal data in our possession and information about how it is processed.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Right to Rectification</h4>
                <p className="text-slate-600 text-sm">Correct or update inaccurate or incomplete personal information.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Right to Erasure</h4>
                <p className="text-slate-600 text-sm">Request deletion of your personal data when it is no longer necessary or lawfully processed.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Right to Object</h4>
                <p className="text-slate-600 text-sm">Object to the processing of your personal data, including for direct marketing purposes.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Right to Data Portability</h4>
                <p className="text-slate-600 text-sm">Receive your personal data in a structured, commonly used, and machine-readable format.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Right to Block</h4>
                <p className="text-slate-600 text-sm">Suspend, withdraw, or order the blocking or removal of your personal data.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Right to Damages</h4>
                <p className="text-slate-600 text-sm">
                  Claim compensation for damages sustained due to inaccurate, incomplete, or unauthorized processing.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">9.1 Exercising Your Rights</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              To exercise any of these rights, please contact our Data Protection Officer at
              <a href="mailto:business@merchkins.com" className="text-blue-600 hover:underline">
                {' '}
                business@merchkins.com
              </a>
              . We will respond to your request within thirty (30) days as required by the Data Privacy Act.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Please note that some rights may be limited where we have overriding legitimate grounds, or where data is needed for legal claims or
              compliance with legal obligations.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">10. Cookies and Tracking Technologies</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.1 What Are Cookies?</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Cookies are small text files stored on your device when you visit our Platform. They help us provide a better user experience, remember
              your preferences, and analyze how you use our services.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.2 Types of Cookies We Use</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Essential cookies:</strong> Required for Platform functionality (authentication, security, cart)
              </li>
              <li>
                <strong>Performance cookies:</strong> Help us understand how visitors use our Platform
              </li>
              <li>
                <strong>Functional cookies:</strong> Remember your preferences and settings
              </li>
              <li>
                <strong>Advertising cookies:</strong> Deliver relevant ads and track campaign effectiveness (with consent)
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.3 Managing Cookies</h3>
            <p className="text-slate-700 leading-relaxed">
              You can control cookies through your browser settings. Most browsers allow you to refuse cookies or delete existing cookies. However,
              disabling essential cookies may affect Platform functionality.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Our Platform is not intended for children under the age of thirteen (13). We do not knowingly collect personal information from children
              under 13. If we become aware that we have collected personal data from a child under 13 without parental consent, we will take steps to
              delete that information promptly.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Users between 13 and 18 years old must have parental or guardian consent to use our Platform. Parents or guardians who believe their
              child has provided personal information without consent should contact us immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">12. Third-Party Links</h2>
            <p className="text-slate-700 leading-relaxed">
              Our Platform may contain links to third-party websites or services that are not owned or controlled by Merchkins. We are not responsible
              for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Bell className="h-6 w-6 text-slate-600" />
              13. Data Breach Notification
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Notify the National Privacy Commission (NPC) within seventy-two (72) hours of becoming aware of the breach</li>
              <li>Notify affected data subjects when the breach is likely to result in high risk to their rights and freedoms</li>
              <li>Document all breaches including their effects and remedial actions taken</li>
              <li>Implement measures to address the breach and prevent future occurrences</li>
            </ol>
            <p className="text-slate-700 leading-relaxed">This is in compliance with NPC Circular No. 16-03 on Personal Data Breach Management.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">14. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other
              factors. When we make material changes, we will:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Update the "Last updated" date at the top of this page</li>
              <li>Provide notice through the Platform or via email for significant changes</li>
              <li>Obtain fresh consent where required by law</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">We encourage you to review this Privacy Policy periodically for any changes.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-slate-600" />
              15. Complaints and Contact Information
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have questions, concerns, or complaints about this Privacy Policy or our data practices, please contact our Data Protection
              Officer:
            </p>
            <div className="bg-slate-50 rounded-xl p-6 not-prose mb-6">
              <ul className="space-y-3 text-slate-700">
                <li>
                  <strong>Data Protection Officer</strong>
                </li>
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

            <h3 className="text-xl font-semibold mb-3">15.1 Filing a Complaint with the NPC</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you are not satisfied with our response, you have the right to file a complaint with the National Privacy Commission:
            </p>
            <div className="bg-slate-50 rounded-xl p-6 not-prose">
              <ul className="space-y-2 text-slate-700">
                <li>
                  <strong>National Privacy Commission (NPC)</strong>
                </li>
                <li>3rd Floor, Core G, GSIS Headquarters Building</li>
                <li>Financial Center, Pasay City, Metro Manila, Philippines</li>
                <li>
                  Website:{' '}
                  <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    https://privacy.gov.ph
                  </a>
                </li>
                <li>
                  Email:{' '}
                  <a href="mailto:info@privacy.gov.ph" className="text-blue-600 hover:underline">
                    info@privacy.gov.ph
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
