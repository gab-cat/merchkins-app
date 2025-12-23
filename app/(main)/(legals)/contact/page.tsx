import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle, Shield, User } from 'lucide-react';
import { ChatButton } from './chat-button';

export const metadata: Metadata = {
  title: 'Contact Us — Merchkins',
  description:
    'Get in touch with Merchkins. Contact us via email, phone, or live chat for any inquiries about our platform, orders, or partnership opportunities.',
  keywords: ['contact Merchkins', 'customer support', 'help', 'get in touch', 'Merchkins support'],
};

export const revalidate = 86400; // ISR: Revalidate every 24 hours

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold font-heading mb-2">Contact Us</h1>
          <p className="text-slate-600 mb-8">We&apos;d love to hear from you. Reach out to us through any of the channels below.</p>

          {/* Live Chat CTA */}
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-8 not-prose mb-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-7 w-7" />
              <h2 className="text-2xl font-bold">Start a Conversation</h2>
            </div>
            <p className="text-blue-100 mb-6 max-w-xl">
              Have a question? Our support team is ready to help. Click the button below to chat with us in real-time.
            </p>
            <ChatButton />
          </div>

          {/* Contact Methods Grid */}
          <div className="grid md:grid-cols-2 gap-6 not-prose mb-10">
            {/* Email */}
            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Email Us</h3>
              <p className="text-slate-600 text-sm mb-3">For general inquiries and business matters</p>
              <a href="mailto:business@merchkins.com" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                business@merchkins.com
              </a>
            </div>

            {/* Phone */}
            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Call Us</h3>
              <p className="text-slate-600 text-sm mb-3">Speak directly with our support team</p>
              <a href="tel:+639999667583" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                +63 (999) 966-7583
              </a>
            </div>
          </div>

          {/* Business Hours */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 not-prose">
              <Clock className="h-6 w-6 text-slate-600" />
              Business Hours
            </h2>
            <div className="bg-slate-50 rounded-xl p-6 not-prose">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Monday - Friday</h4>
                  <p className="text-slate-600">9:00 AM - 6:00 PM (PHT)</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Saturday - Sunday</h4>
                  <p className="text-slate-600">Closed</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-slate-500 text-sm">
                  For urgent matters outside business hours, please email us and we&apos;ll respond as soon as possible.
                </p>
              </div>
            </div>
          </section>

          {/* Office Location */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 not-prose">
              <MapPin className="h-6 w-6 text-slate-600" />
              Our Office
            </h2>
            <div className="bg-slate-50 rounded-xl p-6 not-prose">
              <h3 className="font-semibold text-slate-900 mb-3">Merchkins Headquarters</h3>
              <address className="text-slate-600 not-italic leading-relaxed">
                Magis TBI Richie Hall
                <br />
                Ateneo de Naga University
                <br />
                Ateneo Avenue, Bagumbayan Sur
                <br />
                Naga City, Camarines Sur, 4400
                <br />
                Philippines
              </address>
            </div>
          </section>

          {/* Quick Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 not-prose">Quick Links</h2>
            <div className="grid md:grid-cols-3 gap-4 not-prose">
              <Link href="/help" className="group block bg-slate-50 hover:bg-slate-100 rounded-xl p-5 transition-colors">
                <HelpCircle className="h-5 w-5 text-slate-600 mb-2 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-semibold text-slate-900 mb-1">Help Center</h3>
                <p className="text-slate-600 text-sm">Find answers to FAQs</p>
              </Link>
              <Link href="/terms" className="group block bg-slate-50 hover:bg-slate-100 rounded-xl p-5 transition-colors">
                <Shield className="h-5 w-5 text-slate-600 mb-2 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-semibold text-slate-900 mb-1">Terms & Conditions</h3>
                <p className="text-slate-600 text-sm">Read our terms of service</p>
              </Link>
              <Link href="/privacy" className="group block bg-slate-50 hover:bg-slate-100 rounded-xl p-5 transition-colors">
                <User className="h-5 w-5 text-slate-600 mb-2 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-semibold text-slate-900 mb-1">Privacy Policy</h3>
                <p className="text-slate-600 text-sm">How we protect your data</p>
              </Link>
            </div>
          </section>

          {/* Apply CTA */}
          <section className="mt-12">
            <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-8 not-prose text-white">
              <h2 className="text-xl font-bold mb-3">Interested in Starting a Storefront?</h2>
              <p className="text-slate-300 mb-6">
                Join hundreds of sellers, artists, and small businesses already using Merchkins to sell their products.
              </p>
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-medium px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Apply for a Storefront
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
