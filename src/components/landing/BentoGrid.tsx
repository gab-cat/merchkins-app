'use client';

import { motion } from 'framer-motion';
import { Building2, ShoppingCart, Truck, Zap, Users, TrendingUp, Star, Bell, Paintbrush } from 'lucide-react';
import Image from 'next/image';
import Lottie from 'lottie-react';
import sparkleAnimation from '@/public/lotties/sparkle.json';
import { BlurFade } from '@/src/components/ui/animations/effects';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;

export function BentoGrid() {
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1d43d8]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-brand-neon/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Title - Left Aligned */}
        <BlurFade delay={0} className="mb-12">
          <span className="text-lg font-medium text-black border border-slate-200 px-4 py-1 rounded-full tracking-tight max-w-fit block mb-3">
            Features
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight max-w-2xl">
            Everything you need in <span className="text-[#1d43d8]">one platform</span>
          </h2>
        </BlurFade>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="opacity-0 animate-in fade-in duration-0 fill-mode-forwards"
        >
          {/* Bento Grid - More creative asymmetric layout */}
          <div className="grid grid-cols-12 gap-4 md:gap-6 auto-rows-[140px] md:auto-rows-[160px]">
            {/* Card 1: Large Feature - Multi-tenant Stores (spans 8 cols, 2 rows) */}
            <motion.div
              variants={itemVariants}
              className="group relative col-span-12 md:col-span-8 row-span-2 bg-linear-to-br from-[#1d43d8] via-[#2952e8] to-[#4169f0] rounded-3xl p-6 md:p-8 transition-all duration-500 overflow-hidden"
            >
              {/* Animated Lottie background */}
              <div className="absolute top-4 right-4 w-32 h-32 opacity-30">
                <Lottie animationData={sparkleAnimation} loop={true} />
              </div>

              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white mb-4">
                    <Building2 className="h-4 w-4" />
                    <span>Multi-Tenant Platform</span>
                  </div>
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">Your Own Professional Storefront</h3>
                  <p className="text-white/80 leading-relaxed max-w-lg">
                    Create your branded online store with custom themes, logos, and domains. Perfect for artists, freelancers, and small businesses.
                  </p>
                </div>

                {/* Floating decorative elements */}
                <div className="flex items-center gap-4 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                    >
                      <Star className="h-5 w-5 text-brand-neon" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 2: Stats Card (spans 4 cols, 2 rows) */}
            <motion.div
              variants={itemVariants}
              className="group relative col-span-12 md:col-span-4 row-span-2 bg-white rounded-3xl p-6 md:p-8 transition-all duration-500 border border-slate-100"
            >
              <div className="text-5xl md:text-6xl font-heading font-bold text-[#1d43d8] mb-2">100+</div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">Active Sellers</h3>
              <p className="text-slate-600 text-sm mb-6">Freelancers, artists, and SMEs growing their businesses with Merchkins.</p>

              {/* Animated progress bars */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24">Startups</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-[#1d43d8] to-[#4169f0] rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#1d43d8] w-8">55</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24">SMBs</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-[#1d43d8]/70 to-[#4169f0]/70 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '60%' }}
                      transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#1d43d8] w-8">40</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24">Enterprise</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-brand-neon to-[#c5ff4d] rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '25%' }}
                      transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-brand-neon w-8">15</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Image Card - Work Together (spans 4 cols, 2 rows) */}
            <motion.div
              variants={itemVariants}
              className="group relative col-span-6 md:col-span-4 row-span-2 bg-[#0f172a] rounded-3xl overflow-hidden transition-all duration-500"
            >
              <Image
                src="/landing/team-collab.png"
                alt="Team Collaboration"
                fill
                className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-neon rounded-full text-xs font-medium text-slate-900 mb-3">
                  <Users className="h-3 w-3" />
                  Team Collab
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-2">Team Collaboration</h3>
                <p className="text-white/70 text-sm">
                  Manage your business with your team — shared access to orders, inventory, and customer support.
                </p>
              </div>
            </motion.div>

            {/* Card 4: Feature - Easy Checkout (spans 4 cols, 1 row) */}
            <motion.div
              variants={itemVariants}
              className="group relative col-span-6 md:col-span-4 row-span-1 bg-white rounded-3xl p-5 transition-all duration-500 border border-slate-100 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-brand-neon to-[#8fcc00] flex items-center justify-center shrink-0">
                <ShoppingCart className="h-6 w-6 text-slate-900" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Seamless Checkout</h3>
                <p className="text-slate-600 text-sm">One-click ordering, multiple payment options</p>
              </div>
            </motion.div>

            {/* Card 5: Feature - Fast Fulfillment (spans 4 cols, 1 row) */}
            <motion.div
              variants={itemVariants}
              className="group relative col-span-6 md:col-span-4 row-span-1 bg-[#0f172a] rounded-3xl p-5 transition-all duration-500 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">Fast Fulfillment</h3>
                <p className="text-slate-400 text-sm">Streamlined order processing to delivery</p>
              </div>
              <motion.div
                className="absolute -right-2 -top-2 w-8 h-8 bg-brand-neon rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="h-4 w-4 text-slate-900" />
              </motion.div>
            </motion.div>

            {/* Card 8: Trending/Growth Card (spans 4 cols, 2 rows) */}
            <motion.div
              variants={itemVariants}
              className="group relative col-span-12 md:col-span-4 row-span-2 bg-linear-to-br from-brand-neon via-[#c5ff4d] to-brand-neon rounded-3xl p-6 md:p-8 transition-all duration-500 overflow-hidden"
            >
              {/* Pattern overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, transparent 25%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 50%, transparent 50%, transparent 75%, rgba(0,0,0,0.05) 75%)',
                  backgroundSize: '20px 20px',
                }}
              />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6">
                    <TrendingUp className="h-7 w-7 text-brand-neon" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">Grow Your Business</h3>
                  <p className="text-slate-700 leading-relaxed">Scale your operations with analytics, insights, and powerful automation tools.</p>
                </div>

                {/* Mini chart visualization */}
                <div className="flex items-end gap-1.5 h-16 mt-4">
                  {[40, 65, 45, 80, 60, 90, 75, 100].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-slate-900/20 rounded-t-full"
                      style={{ height: `${height}%` }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      viewport={{ once: true }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 7: NEW - Custom Branding (spans 4 cols, 2 rows) */}
            <motion.div
              variants={itemVariants}
              className="group relative col-span-6 md:col-span-4 row-span-2 bg-white rounded-3xl p-6 transition-all duration-500 border border-slate-100 overflow-hidden"
            >
              {/* Decorative color swatches */}
              <div className="absolute right-4 bottom-4 flex gap-2 rotate-6 opacity-70">
                {['bg-[#1d43d8]', 'bg-[#adfc04]', 'bg-rose-500', 'bg-amber-400', 'bg-emerald-500'].map((color, i) => (
                  <motion.div
                    key={i}
                    className={`w-10 h-24 ${color} rounded-xl`}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 0.9 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    viewport={{ once: true }}
                  />
                ))}
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-rose-400 via-amber-400 to-emerald-400 flex items-center justify-center shrink-0 mb-4">
                    <Paintbrush className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Custom Branding</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Your colors, fonts & identity. Create a cohesive brand experience across all touchpoints.
                  </p>
                </div>
                {/* Preview swatches row */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-[#1d43d8]" />
                    <div className="w-6 h-6 rounded-full bg-brand-neon" />
                    <div className="w-6 h-6 rounded-full bg-slate-900" />
                  </div>
                  <span className="text-xs text-slate-400">Brand Palette</span>
                </div>
              </div>
            </motion.div>

            {/* Card 6: NEW - Real-time Notifications (below Work Together) */}
            <motion.div
              variants={itemVariants}
              className="group relative col-span-6 md:col-span-4 row-span-1 bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-5 transition-all duration-500 overflow-hidden"
            >
              {/* Floating bell animations */}
              <div className="absolute top-2 right-2 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                    animate={{
                      y: [0, -4, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.3,
                      repeat: Infinity,
                    }}
                  >
                    <Bell className="h-3 w-3 text-white" />
                  </motion.div>
                ))}
              </div>
              <div className="relative z-10 h-full flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">Omni-Channel Inbox</h3>
                  <p className="text-white/80 text-sm">Messenger, email, Facebook — one inbox</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
