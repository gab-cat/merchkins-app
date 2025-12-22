import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Database, Server, Shield, Users, FileText, ExternalLink, Building2, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Processing — Merchkins',
  description: 'Learn how Merchkins processes your data, our data processing agreement, and the subprocessors we use to deliver our services.',
};

const subprocessors = [
  {
    company: 'Amazon Web Services (AWS)',
    location: 'United States (with global data centers)',
    purpose: 'Cloud Infrastructure & Security',
    activities: [
      'Compute instances (EC2) for application hosting',
      'Static IP addresses for reliable connectivity',
      'CloudFront CDN for content delivery and performance optimization',
      'Web Application Firewall (WAF) for security and threat protection',
      'SSL/TLS certificates for encrypted communications',
    ],
    dataProcessed: 'Application data, user sessions, static assets, request logs',
    website: 'https://aws.amazon.com',
  },
  {
    company: 'Convex, Inc.',
    location: 'United States',
    purpose: 'Database & Backend Services',
    activities: [
      'Real-time database hosting and management',
      'Serverless function execution',
      'Data synchronization across clients',
      'Automatic backups and data recovery',
    ],
    dataProcessed: 'User accounts, orders, products, organization data, transaction records',
    website: 'https://convex.dev',
  },
  {
    company: 'Cloudflare, Inc.',
    location: 'United States (with global edge network)',
    purpose: 'CDN, DNS & Security',
    activities: [
      'Domain Name System (DNS) management',
      'DDoS protection and traffic filtering',
      'Content delivery and caching',
      'R2 object storage for files and media',
      'SSL/TLS certificate management',
      'Reverse proxy for internal tools',
    ],
    dataProcessed: 'DNS queries, cached content, uploaded files, request metadata',
    website: 'https://cloudflare.com',
  },
  {
    company: 'Clerk, Inc.',
    location: 'United States',
    purpose: 'Authentication & Identity',
    activities: [
      'User authentication (email, social login)',
      'Session management and security',
      'Multi-factor authentication',
      'User profile management',
      'Organization and team management',
    ],
    dataProcessed: 'Email addresses, authentication tokens, session data, profile information',
    website: 'https://clerk.com',
  },
  {
    company: 'Xendit Pte. Ltd.',
    location: 'Singapore (serving Southeast Asia)',
    purpose: 'Payment Processing',
    activities: [
      'Credit/debit card payment processing',
      'E-wallet payments (GCash, Maya)',
      'Bank transfer processing',
      'Payment verification and fraud detection',
      'Refund and chargeback handling',
    ],
    dataProcessed: 'Payment details, transaction amounts, billing information (tokenized)',
    website: 'https://xendit.co',
  },
  {
    company: 'Mailgun Technologies, Inc.',
    location: 'United States',
    purpose: 'Transactional Email',
    activities: ['Order confirmation emails', 'Password reset and verification emails', 'Notification and alert emails', 'Email delivery tracking'],
    dataProcessed: 'Email addresses, email content, delivery status',
    website: 'https://mailgun.com',
  },
  {
    company: 'Chatwoot, Inc.',
    location: 'United States',
    purpose: 'Customer Support Platform',
    activities: [
      'Omni-channel inbox management',
      'Live chat widget functionality',
      'Messenger and social media integration',
      'Customer conversation history',
      'Support ticket management',
    ],
    dataProcessed: 'Customer messages, support conversations, contact information',
    website: 'https://chatwoot.com',
  },
  {
    company: 'Google LLC',
    location: 'United States',
    purpose: 'Email & Productivity',
    activities: ['Business email (Gmail/Google Workspace)', 'Document collaboration', 'Gmail API integration for omni-channel inbox'],
    dataProcessed: 'Business communications, synced emails (for connected accounts)',
    website: 'https://google.com',
  },
  {
    company: 'Functional Software, Inc. (Sentry)',
    location: 'United States',
    purpose: 'Error Monitoring',
    activities: ['Application error detection and reporting', 'Performance monitoring', 'Issue tracking and alerting', 'Stack trace analysis'],
    dataProcessed: 'Error logs, stack traces, browser/device metadata (anonymized)',
    website: 'https://sentry.io',
  },
  {
    company: 'Axiom, Inc.',
    location: 'United States',
    purpose: 'Logging & Observability',
    activities: ['Application log aggregation', 'System monitoring and analytics', 'Log search and analysis', 'Alerting on anomalies'],
    dataProcessed: 'Application logs, system metrics, request logs (anonymized where possible)',
    website: 'https://axiom.co',
  },
  {
    company: 'Linear Orbit, Inc.',
    location: 'United States',
    purpose: 'Internal Collaboration',
    activities: ['Internal project management', 'Issue tracking and sprint planning', 'Team collaboration and communication'],
    dataProcessed: 'Internal communications only (no customer personal data)',
    website: 'https://linear.app',
  },
];

export default function DataProcessingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-8 w-8 text-[#1d43d8]" />
            <h1 className="text-3xl font-bold text-slate-900">Data Processing</h1>
          </div>
          <p className="text-slate-500">Last updated: December 23, 2024</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-slate-600" />
              1. Introduction
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              This Data Processing page describes how Merchkins processes personal data, our commitments as a data processor, and the third-party
              service providers (subprocessors) we engage to deliver our services. This page supplements our{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-slate-700 leading-relaxed">
              Merchkins is committed to processing personal data in accordance with the{' '}
              <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and applicable international data protection standards.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Server className="h-6 w-6 text-slate-600" />
              2. How We Process Data
            </h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Data Processing Principles</h3>
            <p className="text-slate-700 leading-relaxed mb-4">We process personal data in accordance with the following principles:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Transparency:</strong> We clearly inform users what data we collect and how we use it
              </li>
              <li>
                <strong>Legitimate Purpose:</strong> Data is collected only for specified, legitimate purposes
              </li>
              <li>
                <strong>Proportionality:</strong> We collect only what is necessary for the stated purpose
              </li>
              <li>
                <strong>Accuracy:</strong> We take reasonable steps to ensure data is accurate and up-to-date
              </li>
              <li>
                <strong>Security:</strong> We implement appropriate security measures to protect personal data
              </li>
              <li>
                <strong>Accountability:</strong> We take responsibility for our data processing activities
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Categories of Data Processed</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Data Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Examples</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Identity Data</td>
                    <td className="px-4 py-3 text-slate-700">Name, email, phone number</td>
                    <td className="px-4 py-3 text-slate-700">Account management, order fulfillment</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Contact Data</td>
                    <td className="px-4 py-3 text-slate-700">Shipping address, billing address</td>
                    <td className="px-4 py-3 text-slate-700">Order delivery, invoicing</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Transaction Data</td>
                    <td className="px-4 py-3 text-slate-700">Order history, payment records</td>
                    <td className="px-4 py-3 text-slate-700">Order processing, customer support</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Technical Data</td>
                    <td className="px-4 py-3 text-slate-700">IP address, browser type, device info</td>
                    <td className="px-4 py-3 text-slate-700">Security, analytics, troubleshooting</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700">Communication Data</td>
                    <td className="px-4 py-3 text-slate-700">Messages, support tickets</td>
                    <td className="px-4 py-3 text-slate-700">Customer support, dispute resolution</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Data Processing Activities</h3>
            <p className="text-slate-700 leading-relaxed mb-4">Our primary data processing activities include:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Processing customer orders and transactions</li>
              <li>Managing seller storefronts and product catalogs</li>
              <li>Facilitating communications between buyers and sellers</li>
              <li>Processing payments through secure payment gateways</li>
              <li>Providing customer support across multiple channels</li>
              <li>Analyzing platform performance and user experience</li>
              <li>Ensuring platform security and fraud prevention</li>
              <li>Sending transactional and promotional communications (with consent)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Shield className="h-6 w-6 text-slate-600" />
              3. Data Processing Agreement
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              When Merchkins processes personal data on behalf of sellers (storefront operators), we act as a <strong>data processor</strong> under
              the Data Privacy Act. Our data processing commitments include:
            </p>

            <div className="bg-slate-50 rounded-xl p-6 not-prose mb-6">
              <h4 className="font-bold text-slate-900 text-lg mb-4">Our Commitments as a Data Processor</h4>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Process personal data only according to documented instructions from sellers</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Ensure personnel with access to data are subject to confidentiality obligations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Implement appropriate technical and organizational security measures</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Engage subprocessors only with prior authorization and equivalent data protection obligations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Assist sellers in responding to data subject requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Notify sellers of any personal data breaches without undue delay</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Delete or return all personal data upon termination of services (unless retention is required by law)</span>
                </li>
              </ul>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Organizations requiring a formal Data Processing Agreement (DPA) may contact us at{' '}
              <a href="mailto:business@merchkins.com" className="text-blue-600 hover:underline">
                business@merchkins.com
              </a>
              .
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-slate-600" />
              4. Subprocessors
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              To provide our services, Merchkins engages the following third-party service providers (subprocessors) who may process personal data on
              our behalf. All subprocessors are contractually bound to process data only as instructed and to maintain appropriate security measures.
            </p>

            <div className="space-y-6 not-prose">
              {subprocessors.map((processor, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{processor.company}</h3>
                      <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                        <Globe className="h-4 w-4" />
                        {processor.location}
                      </p>
                    </div>
                    <a
                      href={processor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 text-sm shrink-0"
                    >
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{processor.purpose}</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-800 mb-1">Processing Activities:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                        {processor.activities.map((activity, i) => (
                          <li key={i}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 mb-1">Data Processed:</p>
                      <p className="text-slate-600 ml-2">{processor.dataProcessed}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Users className="h-6 w-6 text-slate-600" />
              5. Your Rights
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You have the right to know how your data is processed and by whom. For detailed information about your rights under the Data Privacy
              Act, including how to exercise them, please refer to our{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-slate-700 leading-relaxed">
              If you have questions about our data processing practices or subprocessors, please contact us at{' '}
              <a href="mailto:business@merchkins.com" className="text-blue-600 hover:underline">
                business@merchkins.com
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Updates to This Page</h2>
            <p className="text-slate-700 leading-relaxed">
              We may update this page from time to time to reflect changes in our subprocessors or data processing practices. Material changes will be
              communicated through the platform or via email to registered users. We encourage you to review this page periodically.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
