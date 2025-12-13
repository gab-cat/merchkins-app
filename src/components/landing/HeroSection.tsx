'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-white" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#1d43d8]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#adfc04]/10 rounded-full blur-3xl" />

      {/* Content container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <motion.div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center" variants={containerVariants} initial="hidden" animate="visible">
          {/* Text Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center lg:justify-start">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d43d8]/5 border border-[#1d43d8]/10 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-[#1d43d8]" />
                <span className="text-sm font-medium text-[#1d43d8]">The #1 Merch Platform</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-heading tracking-tighter text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1]"
            >
              Unleash Your Brand.{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#1d43d8]">All In One Place.</span>
                <svg className="absolute -bottom-2 left-0 w-full h-4 text-[#adfc04]" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8.5C50 3.5 150 3.5 198 8.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={itemVariants} className="text-lg tracking-tight md:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Join the ultimate merch experience — where passion meets quality and every design brings you closer to your community.
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="https://app.merchkins.com"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0f172a] text-white text-base font-semibold rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
              >
                Start your own journey
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
              {/* Avatar Stack */}
              <div className="flex items-center">
                <span className="text-sm text-slate-500 mr-3">Trusted by organizations</span>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-slate-200 to-slate-300 shadow-sm flex items-center justify-center text-xs font-medium text-slate-600"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-8 w-px bg-slate-200" />

              {/* Social Links */}
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>Instagram ↗</span>
                <span>Facebook ↗</span>
                <span>TikTok ↗</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div variants={itemVariants} className="relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 via-transparent to-transparent z-10" />
              <Image src="/landing/hero-merch.png" alt="Merchkins Platform" fill className="object-cover" priority />

              {/* Floating card */}
              <motion.div
                className="absolute bottom-6 left-6 right-6 z-20 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#adfc04] flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Custom Storefront Ready</div>
                    <div className="text-sm text-slate-500">Launch your merch store in minutes</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative floating elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-24 h-24 bg-[#adfc04] rounded-2xl -z-10"
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#1d43d8]/20 rounded-xl -z-10 backdrop-blur-sm"
              animate={{ rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
