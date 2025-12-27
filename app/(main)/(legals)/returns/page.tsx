import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle, Gift, ShieldCheck, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns & Refund Policy — Merchkins',
  description: 'Learn about our return and refund policies, including how to request a refund and receive platform vouchers.',
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-slate max-w-none space-y-8">
          <h1 className="text-3xl font-bold font-heading mb-2">Returns & Refund Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: December 22, 2025</p>

          {/* Quick Overview Cards */}
          <div className="grid md:grid-cols-3 gap-4 not-prose mb-10 space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <Clock className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900">24-Hour Window</h3>
              <p className="text-sm text-blue-700">Cancellation requests must be submitted within 24 hours of payment.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <Gift className="h-6 w-6 text-emerald-600 mb-2" />
              <h3 className="font-semibold text-emerald-900">Refund Options</h3>
              <p className="text-sm text-emerald-700">
                Refunds may be issued as platform vouchers, subject to your statutory rights to monetary refunds where required by law.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <ShieldCheck className="h-6 w-6 text-amber-600 mb-2" />
              <h3 className="font-semibold text-amber-900">Consumer Protection</h3>
              <p className="text-sm text-amber-700">In compliance with the Consumer Act of the Philippines (RA 7394).</p>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              At Merchkins, we are committed to ensuring customer satisfaction while maintaining fair practices for our sellers. This policy governs
              all returns, refunds, and cancellations on the Merchkins platform, in accordance with the
              <strong> Consumer Act of the Philippines (Republic Act No. 7394)</strong>,
              <strong> Electronic Commerce Act (Republic Act No. 8792)</strong>, and relevant regulations issued by the Department of Trade and
              Industry (DTI) and the Bureau of Internal Revenue (BIR).
            </p>
            <p className="text-slate-700 leading-relaxed">
              By making a purchase on our platform, you acknowledge and agree to the terms outlined in this policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">2. Cancellation of Unpaid Orders</h2>
            <div className="bg-slate-50 rounded-xl p-6 not-prose mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Allowed at Any Time</p>
                  <p className="text-slate-600 text-sm mt-1">
                    Orders that have not yet been paid may be cancelled at any time before payment is completed. Upon cancellation, the order will be
                    voided, and any reserved inventory will be automatically restored.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              To cancel an unpaid order, simply navigate to your order details page and click the "Cancel Order" button. No reason is required, and no
              penalties will be applied.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">3. Cancellation of Paid Orders</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Cancellation Window</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              For orders that have been successfully paid, cancellation requests must be submitted within
              <strong> twenty-four (24) hours</strong> from the time payment is confirmed. This window allows customers reasonable time to review
              their purchase while enabling sellers to process orders efficiently.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-amber-800 text-sm">
                  <strong>Important:</strong> After the 24-hour window has elapsed, cancellation requests will not be accepted unless the product is
                  defective, damaged, or not as described.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 How to Request Cancellation</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Log in to your Merchkins account</li>
              <li>Navigate to "My Orders" and select the order you wish to cancel</li>
              <li>Click "Request Cancellation" (available within 24 hours of payment)</li>
              <li>Provide a reason for your cancellation request</li>
              <li>Submit your request for review</li>
              <li>You will receive an email notification once your request has been processed</li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Review Process</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Cancellation requests are reviewed by the organization administrators (sellers). The review process typically takes 1-3 business days.
              Approved cancellations will result in a refund voucher being issued to your account.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Pre-Orders and Made-to-Order Products</h3>
            <p className="text-slate-700 leading-relaxed mb-4">Special cancellation rules apply to pre-orders and made-to-order products:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Pre-orders:</strong> The 24-hour cancellation window applies from the time of payment confirmation, regardless of the expected
                delivery date
              </li>
              <li>
                <strong>Made-to-order products:</strong> Custom or personalized items may have restricted cancellation options once production has
                begun
              </li>
              <li>
                <strong>Batch production:</strong> For products in batch production runs (e.g., limited edition merchandise), cancellations after the
                production cutoff date may not be accepted
              </li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Sellers must clearly communicate any special cancellation policies for pre-orders or made-to-order products at the time of purchase.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">4. Refund Method</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 not-prose mb-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-blue-900 text-lg mb-3">Consumer Rights and Refund Policy</h3>
                  <p className="text-blue-800 mb-4">
                    In accordance with the <strong>Consumer Act of the Philippines (R.A. 7394)</strong> and the{' '}
                    <strong>Electronic Commerce Act (R.A. 8792)</strong>, consumers retain their statutory rights to monetary refunds where required
                    by law.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-blue-700 text-sm mb-4 ml-4">
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

            <h3 className="text-xl font-semibold mb-3">4.1 Voucher Features</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Full Value:</strong> Vouchers are issued for the exact amount of the cancelled order, including any applicable taxes
              </li>
              <li>
                <strong>Platform-Wide Use:</strong> Vouchers can be used at any store on the Merchkins platform, not just the original seller
              </li>
              <li>
                <strong>No Expiration:</strong> Vouchers do not expire and remain valid indefinitely
              </li>
              <li>
                <strong>Non-Transferable:</strong> Vouchers are linked to your account and cannot be transferred to another user
              </li>
              <li>
                <strong>Stackable:</strong> Multiple vouchers can be used on a single order
              </li>
              <li>
                <strong>Partial Use:</strong> If your order total is less than the voucher value, the remaining balance stays in your voucher
              </li>
              <li>
                <strong>Top-Up Eligible:</strong> If your order exceeds the voucher value, you can pay the difference using other payment methods
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Monetary Refund Requests</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Consumers have the right to request monetary refunds in accordance with applicable Philippine consumer protection laws. For
              seller-initiated cancellations, monetary refunds will be processed immediately or as required by law. To request a monetary refund:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Navigate to your Vouchers page or Order details</li>
              <li>Find the eligible refund request</li>
              <li>Click "Request Monetary Refund" or contact support</li>
              <li>Your request will be reviewed by our support team</li>
              <li>Once approved, the refund will be processed to your original payment method promptly</li>
            </ol>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>Processing Time:</strong> Monetary refund requests are processed promptly in accordance with applicable laws, typically within
              3-5 business days after approval. Refunds will be credited to your original payment method.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Your Rights:</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Under Philippine consumer protection laws, you retain the right to monetary refunds where required by statute, regardless of any
                    voucher issuance. These statutory rights cannot be waived.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Legal Basis</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              This refund policy is designed to comply with Philippine consumer protection laws, including the{' '}
              <strong>Consumer Act of the Philippines (R.A. 7394)</strong> and the <strong>Electronic Commerce Act (R.A. 8792)</strong>. Under these
              statutes, consumers have the right to monetary refunds, repairs, or replacements for defective, damaged, or misrepresented products.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              Platform vouchers may be offered as a convenient refund option, but they do not limit or replace your statutory rights to monetary
              refunds where required by law. For seller-initiated cancellations, refunds will be processed promptly and in accordance with applicable
              consumer protection statutes, without undue delay.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Important:</strong> Your statutory consumer rights cannot be waived or limited by any policy, term, or condition. The Platform
              is committed to processing all refunds in full compliance with applicable Philippine consumer protection laws.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">5. Defective, Damaged, or Incorrect Products</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              In accordance with <strong>Article 68 of the Consumer Act of the Philippines</strong>, you have the right to return products that are:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Defective:</strong> Products with manufacturing defects or functional issues
              </li>
              <li>
                <strong>Damaged:</strong> Products that arrived damaged due to shipping or handling
              </li>
              <li>
                <strong>Incorrect:</strong> Products that differ from what was ordered (wrong size, color, design, etc.)
              </li>
              <li>
                <strong>Not as Described:</strong> Products that materially differ from the listing description
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Filing a Complaint</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>Document the issue with clear photos or videos</li>
              <li>Navigate to your order details and click "Report an Issue"</li>
              <li>Select the appropriate issue category and provide a detailed description</li>
              <li>Upload supporting evidence (photos/videos)</li>
              <li>Submit your complaint for seller review</li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Resolution Options</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              For valid complaints regarding defective, damaged, or incorrect products, you may be entitled to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>
                <strong>Replacement:</strong> A new item sent to you at no additional cost
              </li>
              <li>
                <strong>Refund Voucher:</strong> Full value issued as a platform voucher
              </li>
              <li>
                <strong>Partial Refund:</strong> A partial voucher for minor issues (upon agreement)
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">6. Non-Refundable Items</h2>
            <p className="text-slate-700 leading-relaxed mb-4">The following items and situations are not eligible for refund or return:</p>
            <div className="bg-red-50 rounded-xl p-6 not-prose">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-red-800">Orders cancelled after the 24-hour window (unless defective)</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-red-800">Orders that have been delivered and accepted without issues reported within 7 days</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-red-800">Custom-made or personalized products (unless defective)</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-red-800">Products with broken seals or missing tags (if applicable)</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-red-800">Products damaged due to customer misuse or negligence</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-red-800">Change of mind after the cancellation window</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">7. Processing Times</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Request Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Processing Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Refund Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-700">Customer-initiated Cancellation (within 24 hours)</td>
                    <td className="px-4 py-3 text-sm text-slate-700">1-3 business days</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Voucher issued upon approval</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-700">Seller-initiated Cancellation</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Immediate</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      Monetary refund processed immediately or as required by law; voucher may be offered as alternative
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-700">Monetary Refund Request</td>
                    <td className="px-4 py-3 text-sm text-slate-700">3-5 business days</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      Processed promptly to original payment method in accordance with applicable laws
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-700">Defective/Damaged Product</td>
                    <td className="px-4 py-3 text-sm text-slate-700">3-5 business days</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Monetary refund (per R.A. 7394) / voucher optional upon verification</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-700">Wrong Item Received</td>
                    <td className="px-4 py-3 text-sm text-slate-700">3-5 business days</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Monetary refund (per R.A. 7394) / voucher optional upon verification</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> For cases involving defective, damaged, or misrepresented products (including wrong items received),
                  consumers retain their statutory rights to monetary refunds under the Consumer Act of the Philippines (R.A. 7394) and Electronic
                  Commerce Act (R.A. 8792). While vouchers may be issued initially for convenience, consumers may request conversion to monetary
                  refunds where required by law. These statutory rights cannot be waived or limited.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">8. Dispute Resolution</h2>
            <p className="text-slate-700 leading-relaxed mb-4">If you are unsatisfied with the resolution provided, you may:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
              <li>
                <strong>Escalate to Merchkins Support:</strong> Contact our support team for mediation between you and the seller
              </li>
              <li>
                <strong>File a Complaint with DTI:</strong> You may file a complaint with the Department of Trade and Industry for consumer-related
                disputes
              </li>
              <li>
                <strong>Seek Legal Remedies:</strong> As a last resort, you may pursue legal action through appropriate channels
              </li>
            </ol>
            <p className="text-slate-700 leading-relaxed mb-4">
              Merchkins is committed to fair resolution of all disputes and will cooperate fully with regulatory authorities in the investigation of
              any consumer complaints.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.1 How to Contact Support</h3>
            <p className="text-slate-700 leading-relaxed mb-4">You can reach our support team through multiple channels:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>
                <strong>Website:</strong> Visit the seller's storefront and use the chat widget
              </li>
              <li>
                <strong>Facebook Messenger:</strong> Message the seller's connected Facebook page
              </li>
              <li>
                <strong>Email:</strong> Send an email to business@merchkins.com for platform-level support
              </li>
              <li>
                <strong>Order Page:</strong> Use the "Report an Issue" button on your order details page
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">9. Seller Obligations</h2>
            <p className="text-slate-700 leading-relaxed mb-4">All sellers on the Merchkins platform are required to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Respond to cancellation requests within 3 business days</li>
              <li>Provide accurate product descriptions and images</li>
              <li>Ensure products are properly packaged to prevent damage during shipping</li>
              <li>Honor valid refund and replacement requests</li>
              <li>Comply with all applicable Philippine consumer protection laws</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              For questions regarding this Returns & Refund Policy or to request assistance with a return:
            </p>
            <div className="bg-slate-50 rounded-xl p-6 not-prose">
              <ul className="space-y-3 text-slate-700">
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
                <li>
                  <strong>Support Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM (Philippine Standard Time)
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Policy Updates</h2>
            <p className="text-slate-700 leading-relaxed">
              Merchkins reserves the right to update or modify this Returns & Refund Policy at any time. Changes will be effective immediately upon
              posting on this page. We encourage you to review this policy periodically. Your continued use of the platform after any changes
              constitutes acceptance of the modified policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
