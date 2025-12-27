import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  Target,
  Heart,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Store,
  MessageSquare,
} from 'lucide-react';
import { BUSINESS_NAME, BUSINESS_DESCRIPTION, BUSINESS_CURRENCY, BUSINESS_DTI_NUMBER } from '@/src/constants/business-info';

export const metadata: Metadata = {
  title: `About Us — ${BUSINESS_NAME}`,
  description: `Learn about ${BUSINESS_NAME}, the all-in-one commerce platform for independent sellers, artists, freelancers, and SMEs in the Philippines. ${BUSINESS_DESCRIPTION}`,
  keywords: ['about Merchkins', 'company', 'e-commerce platform', 'Philippines', 'SME platform'],
};

export const revalidate = 86400; // ISR: Revalidate every 24 hours

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-slate max-w-none space-y-8">
          <h1 className="text-3xl font-bold font-heading mb-2">About Merchkins</h1>
          <p className="text-slate-600 mb-8 text-lg">The all-in-one platform for independent sellers</p>

          {/* Hero Card */}
          <div className="bg-linear-to-br from-[#1d43d8]/5 to-brand-neon/5 border border-[#1d43d8]/10 rounded-2xl p-8 not-prose mb-10">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#1d43d8]/10 flex items-center justify-center shrink-0">
                <Store className="h-7 w-7 text-[#1d43d8]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h2>
                <p className="text-slate-700 leading-relaxed">
                  Merchkins empowers <strong>artists, freelancers, and small-to-medium enterprises (SMEs)</strong> to sell their products online
                  without the technical complexity. We provide everything you need to run your business in one place—custom storefronts, order
                  management, payments, fulfillment, and omni-channel customer support.
                </p>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 not-prose">
              <Heart className="h-6 w-6 text-slate-600" />
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 gap-4 not-prose">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Seller-First</h3>
                <p className="text-slate-600 text-sm">
                  Every feature we build is designed with independent sellers in mind. Your success is our success.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Trust & Transparency</h3>
                <p className="text-slate-600 text-sm">
                  Clear policies, secure transactions, and honest communication with every customer and seller.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Simplicity</h3>
                <p className="text-slate-600 text-sm">No technical complexity, no juggling multiple tools. One platform for everything you need.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Unified Communication</h3>
                <p className="text-slate-600 text-sm">All your customer channels in one inbox—Messenger, Facebook, email, and website chat.</p>
              </div>
            </div>
          </section>

          {/* Our Story */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-slate-600" />
              Our Story
            </h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                Merchkins was born out of a simple observation: independent sellers, artists, and SMEs struggle with fragmented tools that don&apos;t
                talk to each other. A separate store platform here, a payment gateway there, customer messages scattered across Messenger, email, and
                social media.
              </p>
              <p>
                We set out to build the <strong>unified commerce platform</strong> that these sellers deserve—one that brings together storefront
                management, order processing, secure payments, fulfillment, and customer communication into a single, seamless experience.
              </p>
              <p>
                Incubated at the <strong>Magis Technology Business Incubator (TBI)</strong> at Ateneo de Naga University, Merchkins is proudly
                Filipino-built and designed specifically for the needs of Philippine sellers and entrepreneurs.
              </p>
            </div>
          </section>

          {/* What We Offer */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <Target className="h-6 w-6 text-slate-600" />
              What We Offer
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>
                <strong>Custom Storefronts:</strong> Your own branded online store with custom themes and optional domains
              </li>
              <li>
                <strong>Unified Order Management:</strong> Track orders, inventory, and fulfillment from one dashboard
              </li>
              <li>
                <strong>Secure Payment Processing:</strong> Accept GCash, Maya, credit cards, and bank transfers
              </li>
              <li>
                <strong>Fulfillment Services:</strong> End-to-end order fulfillment from processing to delivery
              </li>
              <li>
                <strong>Omni-Channel Inbox:</strong> Messenger, Facebook Page, website chat, and email in one place
              </li>
              <li>
                <strong>Analytics & Insights:</strong> Understand your business with detailed reports
              </li>
            </ul>
          </section>

          {/* Business Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <MapPin className="h-6 w-6 text-slate-600" />
              Business Information
            </h2>
            <div className="bg-slate-50 rounded-xl p-6 not-prose">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{BUSINESS_NAME}</h3>
                  <p className="text-sm text-slate-500">{BUSINESS_DESCRIPTION}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Currency: <span className="font-semibold text-[#1d43d8]">{BUSINESS_CURRENCY}</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    DTI Registration No.: <span className="font-semibold text-[#1d43d8]">{BUSINESS_DTI_NUMBER}</span>
                  </p>
                  <div className="mt-3 p-3 bg-[#1d43d8]/5 border border-[#1d43d8]/20 rounded-lg">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <ShieldCheck className="h-4 w-4 inline mr-1.5 text-[#1d43d8]" />
                      <strong>{BUSINESS_NAME}</strong> is registered with the <strong>Bureau of Internal Revenue (BIR)</strong> and the{' '}
                      <strong>Department of Trade and Industry (DTI)</strong>. DTI Registration Number: <strong>{BUSINESS_DTI_NUMBER}</strong>
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 mt-3">A Magis TBI Incubated Startup</p>
                </div>
                <div className="space-y-3 text-slate-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Office Address</p>
                      <p className="text-sm text-slate-600">
                        Magis TBI Richie Hall
                        <br />
                        Ateneo de Naga University
                        <br />
                        Ateneo Avenue, Bagumbayan Sur
                        <br />
                        Naga City, Camarines Sur, 4400
                        <br />
                        Philippines
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:business@merchkins.com" className="text-[#1d43d8] hover:underline text-sm">
                        business@merchkins.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href="tel:+639999667583" className="text-[#1d43d8] hover:underline text-sm">
                        +63 (999) 966-7583
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-6 not-prose">Learn More</h2>
            <div className="grid md:grid-cols-3 gap-4 not-prose">
              <Link
                href="/contact"
                className="group flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all"
              >
                <Mail className="h-5 w-5 text-slate-600 group-hover:text-[#1d43d8] transition-colors" />
                <div>
                  <h3 className="font-semibold text-slate-900">Contact Us</h3>
                  <p className="text-xs text-slate-500">Get in touch</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-slate-400 group-hover:text-[#1d43d8] transition-colors" />
              </Link>
              <Link
                href="/apply"
                className="group flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all"
              >
                <Store className="h-5 w-5 text-slate-600 group-hover:text-[#1d43d8] transition-colors" />
                <div>
                  <h3 className="font-semibold text-slate-900">Start Selling</h3>
                  <p className="text-xs text-slate-500">Apply for a storefront</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-slate-400 group-hover:text-[#1d43d8] transition-colors" />
              </Link>
              <Link
                href="/help"
                className="group flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all"
              >
                <Users className="h-5 w-5 text-slate-600 group-hover:text-[#1d43d8] transition-colors" />
                <div>
                  <h3 className="font-semibold text-slate-900">Help Center</h3>
                  <p className="text-xs text-slate-500">FAQs and support</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-slate-400 group-hover:text-[#1d43d8] transition-colors" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
