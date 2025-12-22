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

            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Sellers</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              When you place an order, we share your name, contact details, and shipping address with the relevant seller to fulfill your order.
              Sellers are required to handle your data in compliance with applicable privacy laws.
            </p>

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
              <Globe className="h-6 w-6 text-slate-600" />
              5. International Data Transfers
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
              6. Data Security
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
              7. Data Retention
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
              8. Your Rights Under the Data Privacy Act
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

            <h3 className="text-xl font-semibold mb-3">8.1 Exercising Your Rights</h3>
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
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.1 What Are Cookies?</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Cookies are small text files stored on your device when you visit our Platform. They help us provide a better user experience, remember
              your preferences, and analyze how you use our services.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Types of Cookies We Use</h3>
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

            <h3 className="text-xl font-semibold mb-3 mt-6">9.3 Managing Cookies</h3>
            <p className="text-slate-700 leading-relaxed">
              You can control cookies through your browser settings. Most browsers allow you to refuse cookies or delete existing cookies. However,
              disabling essential cookies may affect Platform functionality.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
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
            <h2 className="text-2xl font-semibold mb-4">11. Third-Party Links</h2>
            <p className="text-slate-700 leading-relaxed">
              Our Platform may contain links to third-party websites or services that are not owned or controlled by Merchkins. We are not responsible
              for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Bell className="h-6 w-6 text-slate-600" />
              12. Data Breach Notification
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
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Privacy Policy</h2>
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
              14. Complaints and Contact Information
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

            <h3 className="text-xl font-semibold mb-3">14.1 Filing a Complaint with the NPC</h3>
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
