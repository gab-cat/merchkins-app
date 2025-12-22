'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

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
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Text moves upward faster than background (parallax effect)
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <section ref={sectionRef} className="relative flex items-center justify-center pt-8 pb-8 md:pb-12 lg:pb-16 px-4 sm:px-6 lg:px-8">
      {/* Main Container with Rounded Borders */}
      <div className="relative w-full h-[600px] md:h-[90vh] rounded-3xl overflow-hidden">
        {/* Background Image */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image src="/landing/hero-bg.png" alt="Hero Background" fill className="object-cover rounded-2xl" priority />
          {/* Dark overlay for contrast */}
          <div className="absolute inset-0 bg-slate-950/40" />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-slate-950/30" />
        </motion.div>

        {/* Content Overlay with Parallax */}
        <motion.div className="relative h-full flex items-center justify-center text-center px-4 sm:px-6 md:px-12" style={{ y: textY }}>
          <motion.div className="max-w-4xl space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-brand-neon" />
                <span className="text-sm font-medium text-white">The All-in-One Seller Platform</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-heading tracking-tighter text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1]"
            >
              Your Business, Simplified. <span className="block text-brand-neon">All In One Platform.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg tracking-tight md:text-xl text-slate-100 leading-relaxed max-w-2xl mx-auto font-light"
            >
              The unified platform for freelancers, artists, and SMEs — manage orders, payments, fulfillment, and customer support all in one place.
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="https://app.merchkins.com"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-neon text-slate-900 text-base font-bold rounded-full hover:bg-[#bbfd2d] transition-all shadow-xl shadow-black/10 hover:-translate-y-0.5"
              >
                Launch your storefront
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-8 pt-8 opacity-80">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white/20 bg-slate-800/50 backdrop-blur-sm flex items-center justify-center text-xs font-medium text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 text-sm font-medium text-white/80">
                <span>Instagram ↗</span>
                <span>Facebook ↗</span>
                <span>TikTok ↗</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Decorative Elements inside the container */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-brand-neon/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#1d43d8]/30 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
