import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  MessageSquare,
  User,
  Shield,
  Gift,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Store,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help Center — Merchkins',
  description: 'Find answers to frequently asked questions and get support for using the Merchkins platform.',
};

const faqCategories = [
  {
    icon: ShoppingBag,
    title: 'Ordering',
    questions: [
      {
        q: 'How do I place an order?',
        a: 'Browse products from your preferred organization store, select the item you want, choose your preferred variant (size, color, etc.), and click "Add to Cart." When ready, proceed to checkout, enter your details, and complete the payment.',
      },
      {
        q: 'Can I order from multiple stores in one transaction?',
        a: 'Currently, each order is processed per organization store. If you want to purchase from multiple stores, you will need to place separate orders for each.',
      },
      {
        q: 'How do I track my order?',
        a: 'Log in to your Merchkins account and navigate to "My Orders." Click on any order to view its current status and tracking information (if available).',
      },
      {
        q: 'Can I modify my order after placing it?',
        a: 'Order modifications depend on the seller and the order status. If your order has not been processed yet, contact the seller immediately through our support system to request changes.',
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments',
    questions: [
      {
        q: 'What payment methods are accepted?',
        a: 'Merchkins supports various payment methods including credit/debit cards (Visa, Mastercard), GCash, Maya, bank transfers, and over-the-counter payments through our payment partners.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes. All payments are processed through secure, PCI-compliant payment gateways. Merchkins does not store your full credit card details on our servers.',
      },
      {
        q: 'Can I pay in installments or use a downpayment?',
        a: 'Some sellers may offer downpayment options for certain products. If available, you will see the option during checkout. The remaining balance must be paid before the order is shipped.',
      },
      {
        q: 'What currency are prices displayed in?',
        a: 'All prices on Merchkins are displayed in Philippine Peso (PHP). For international customers, your bank may apply currency conversion fees.',
      },
    ],
  },
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Delivery times vary by seller and location. Most orders within Metro Manila are delivered within 3-7 business days. Provincial deliveries may take 7-14 business days. Check the product page for estimated delivery times.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'International shipping availability depends on the individual seller. Check with the specific organization store for international shipping options.',
      },
      {
        q: 'How much is shipping?',
        a: "Shipping costs are calculated based on your location and the seller's shipping policies. The exact shipping fee will be displayed during checkout before you confirm your order.",
      },
      {
        q: 'Can I pick up my order instead of having it delivered?',
        a: 'Some organizations offer pickup options. If available, you will see this option during checkout. Pickup location and hours will be provided by the seller.',
      },
    ],
  },
  {
    icon: RotateCcw,
    title: 'Returns & Refunds',
    questions: [
      {
        q: 'Can I cancel my order?',
        a: 'Unpaid orders can be cancelled anytime. Paid orders can be cancelled within 24 hours of payment. After this window, cancellations are only accepted for defective or incorrect items.',
      },
      {
        q: 'How do refunds work?',
        a: 'Refunds are issued as platform vouchers. For customer-initiated cancellations, refunds are voucher-only. For seller-initiated cancellations, you receive a voucher initially, but you can request a monetary refund after 14 days. Vouchers never expire and can be used at any store on Merchkins. Visit your Vouchers page to view and manage your vouchers.',
      },
      {
        q: 'What if I receive a defective or wrong item?',
        a: 'Document the issue with photos/videos, go to your order details, and click "Report an Issue." The seller will review your complaint and provide a resolution (replacement or refund voucher).',
      },
      {
        q: 'How long does the refund process take?',
        a: 'Refund requests are typically processed within 1-5 business days. Once approved, your voucher will be immediately available in your account. For seller-initiated cancellations, monetary refund requests (after 14 days) are processed within 3-5 business days after approval.',
      },
      {
        q: 'Can I request a monetary refund for a voucher?',
        a: 'Yes, but only for vouchers issued from seller-initiated cancellations. After 14 days from when the voucher was issued, you can request a monetary refund through your Vouchers page. The voucher must be unused and eligible. Once approved, the refund will be processed to your original payment method.',
      },
    ],
  },
  {
    icon: User,
    title: 'Account',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" on the homepage and follow the prompts. You can register using your email address or through social login options (Google, Facebook).',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Sign In" and then "Forgot Password." Enter your email address, and we will send you a password reset link.',
      },
      {
        q: 'How do I update my profile information?',
        a: 'Log in to your account, go to Settings, and update your personal information, shipping addresses, or payment preferences.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Contact our support team at business@merchkins.com to request account deletion. Note that this action is irreversible and you will lose access to your order history and vouchers.',
      },
    ],
  },
  {
    icon: Gift,
    title: 'Vouchers & Discounts',
    questions: [
      {
        q: 'How do I use a voucher?',
        a: 'During checkout, enter your voucher code in the designated field and click "Apply." The discount will be reflected in your order total.',
      },
      {
        q: 'Can I use multiple vouchers on one order?',
        a: 'Yes, you can stack multiple vouchers on a single order. If the total voucher value exceeds your order, the remaining balance stays in your voucher.',
      },
      {
        q: 'Do vouchers expire?',
        a: 'Refund vouchers do not expire. Promotional vouchers may have expiration dates, which will be clearly indicated. You can view all your vouchers on the Vouchers page.',
      },
      {
        q: 'Can I transfer my voucher to someone else?',
        a: 'No. Vouchers are non-transferable and can only be used by the account holder to whom they were issued.',
      },
    ],
  },
  {
    icon: Store,
    title: 'For Sellers',
    questions: [
      {
        q: 'How do I apply for a storefront?',
        a: 'Visit merchkins.com/apply and fill out the application form with your business details. Our team will review your application and get back to you within 3-5 business days.',
      },
      {
        q: 'Who can open a storefront on Merchkins?',
        a: 'Merchkins is designed for artists, freelancers, and small-to-medium businesses. Whether you sell custom merchandise, handmade goods, or services with physical products, you can apply for a storefront.',
      },
      {
        q: 'How do I manage orders?',
        a: "Once approved, you'll have access to your seller dashboard where you can view and manage orders, update order status, track payments, and communicate with customers.",
      },
      {
        q: 'What is the omni-channel inbox?',
        a: 'The omni-channel inbox unifies all your customer messages from Facebook Messenger, Facebook Page, website chat, and email into one place. This helps you respond faster and never miss a customer inquiry.',
      },
      {
        q: 'How do I connect my Facebook Page?',
        a: "In your seller dashboard, go to Settings > Integrations and follow the prompts to connect your Facebook Business Page. You'll need admin access to the page you want to connect.",
      },
      {
        q: 'What are my responsibilities as a seller?',
        a: 'Sellers must provide accurate product information, fulfill orders promptly, respond to customer inquiries within 24-48 hours, handle refund requests fairly, and comply with Philippine consumer protection laws.',
      },
      {
        q: 'How do I handle refund requests?',
        a: "When a customer requests a refund, you'll receive a notification. Review the request in your dashboard, communicate with the customer if needed, and approve or provide an alternative resolution. Customer-initiated refunds are issued as platform vouchers only. If you cancel a paid order, the customer receives a voucher but can request a monetary refund after 14 days.",
      },
      {
        q: "Can I use Merchkins' fulfillment services?",
        a: 'Yes, where available. Contact our team to learn about fulfillment options for your products, including production, packaging, and shipping services.',
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold font-heading mb-2">Help Center</h1>
          <p className="text-slate-600 mb-8">Find answers to common questions and learn how to get the most out of Merchkins.</p>

          {/* Quick Contact Card */}
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-6 not-prose mb-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-6 w-6" />
              <h2 className="text-xl font-bold">Need Immediate Assistance?</h2>
            </div>
            <p className="text-blue-100 mb-6">Our support team is here to help you with any questions or concerns.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Email Us</span>
                </div>
                <a href="mailto:business@merchkins.com" className="text-blue-100 hover:text-white transition-colors">
                  business@merchkins.com
                </a>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Call Us</span>
                </div>
                <a href="tel:+639999667583" className="text-blue-100 hover:text-white transition-colors">
                  +63 (999) 966-7583
                </a>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-blue-200 text-sm">
              <Clock className="h-4 w-4" />
              <span>Monday to Friday, 9:00 AM - 6:00 PM (PHT)</span>
            </div>
          </div>

          {/* FAQ Sections */}
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>

          <div className="space-y-8 not-prose">
            {faqCategories.map((category) => (
              <section key={category.title} className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                  <category.icon className="h-5 w-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {category.questions.map((faq, index) => (
                    <details key={index} className="group">
                      <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-800 pr-4">{faq.q}</span>
                        <HelpCircle className="h-5 w-5 text-slate-400 group-open:text-blue-600 transition-colors shrink-0" />
                      </summary>
                      <div className="px-6 pb-4 text-slate-600 leading-relaxed">{faq.a}</div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Additional Resources */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Additional Resources</h2>
            <div className="grid md:grid-cols-2 gap-4 not-prose">
              <Link href="/terms" className="group block bg-slate-50 hover:bg-slate-100 rounded-xl p-6 transition-colors">
                <Shield className="h-6 w-6 text-slate-600 mb-3 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-semibold text-slate-900 mb-2">Terms & Conditions</h3>
                <p className="text-slate-600 text-sm">Read our terms of service and platform usage guidelines.</p>
              </Link>
              <Link href="/privacy" className="group block bg-slate-50 hover:bg-slate-100 rounded-xl p-6 transition-colors">
                <User className="h-6 w-6 text-slate-600 mb-3 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-semibold text-slate-900 mb-2">Privacy Policy</h3>
                <p className="text-slate-600 text-sm">Learn how we protect your personal information.</p>
              </Link>
              <Link href="/returns" className="group block bg-slate-50 hover:bg-slate-100 rounded-xl p-6 transition-colors">
                <RotateCcw className="h-6 w-6 text-slate-600 mb-3 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-semibold text-slate-900 mb-2">Returns & Refunds</h3>
                <p className="text-slate-600 text-sm">Understand our return policy and refund process.</p>
              </Link>
              <a href="mailto:business@merchkins.com" className="group block bg-slate-50 hover:bg-slate-100 rounded-xl p-6 transition-colors">
                <MessageSquare className="h-6 w-6 text-slate-600 mb-3 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-semibold text-slate-900 mb-2">Contact Support</h3>
                <p className="text-slate-600 text-sm">Get personalized help from our support team.</p>
              </a>
            </div>
          </section>

          {/* Office Location */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Our Office</h2>
            <div className="bg-slate-50 rounded-xl p-6 not-prose">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 mb-1">Merchkins Headquarters</p>
                  <p className="text-slate-600">
                    Magis TBI Richie Hall, Ateneo de Naga University
                    <br />
                    Ateneo Avenue, Bagumbayan Sur
                    <br />
                    Naga City, Camarines Sur, 4400
                    <br />
                    Philippines
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
