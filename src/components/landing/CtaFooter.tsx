'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/src/components/ui/animations';
import { ArrowRight, Rocket, ShoppingBag, Store } from 'lucide-react';

export function CtaFooter() {
  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden">
      {/* Subtle geometric background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-slate-100 dark:border-slate-800"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <div className="absolute top-1/4 right-1/4 w-px h-24 bg-linear-to-b from-transparent via-[#1d43d8]/15 to-transparent" />
        <div className="absolute bottom-1/3 left-1/3 w-24 h-px bg-linear-to-r from-transparent via-brand-neon/25 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <BlurFade>
          {/* Signed Out: Join Merchkins */}
          <SignedOut>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-slate-400">
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-600" />
                Get Started
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-600" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                Join the Merchkins Community
              </h2>

              <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                Create an account to track orders, join organizations, and discover exclusive merchandise from your favorite communities.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button asChild className="rounded-full px-6 h-11 bg-[#1d43d8] hover:bg-[#1d43d8]/90 font-semibold shadow-lg shadow-[#1d43d8]/25">
                  <Link href="/sign-up">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Start Shopping
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6 h-11 border-slate-200 dark:border-slate-700 font-medium">
                  <Link href="/about">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </SignedOut>

          {/* Signed In: Apply as Seller */}
          <SignedIn>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-slate-400">
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-600" />
                For Sellers
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-600" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                Start Selling on Merchkins
              </h2>

              <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                Launch your own storefront and sell custom merchandise to your community. We handle production, payments, and fulfillment.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button asChild className="rounded-full px-6 h-11 bg-[#1d43d8] hover:bg-[#1d43d8]/90 font-semibold shadow-lg shadow-[#1d43d8]/25">
                  <Link href="/apply">
                    <Rocket className="mr-2 h-4 w-4" />
                    Apply Now
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6 h-11 border-slate-200 dark:border-slate-700 font-medium">
                  <Link href="/organizations">
                    <Store className="mr-2 h-4 w-4" />
                    Browse Stores
                  </Link>
                </Button>
              </div>
            </motion.div>
          </SignedIn>
        </BlurFade>
      </div>
    </section>
  );
}
