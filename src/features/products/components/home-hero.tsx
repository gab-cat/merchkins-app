'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { BlurFade } from '@/src/components/ui/animations';

export function HomeHero() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center w-full">
      {/* Content container - constrained width */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 md:py-20 lg:py-24 relative z-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div className="space-y-6 lg:space-y-8">
            {/* Badge */}
            <BlurFade delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary tracking-wide">Custom Merch Platform</span>
              </div>
            </BlurFade>

            {/* Main heading */}
            <BlurFade delay={0.2}>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tighter">
                Bring your brand to life with{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 inline-block bg-primary px-3 py-1 md:px-6 md:py-2 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <span className="font-genty tracking-normal">
                      <span className="text-white">Merch</span>
                      <span className="text-brand-neon">kins</span>
                    </span>
                  </span>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl scale-110 -z-10" />
                </span>
              </h1>
            </BlurFade>

            {/* Description */}
            <BlurFade delay={0.3}>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Design, order, and fulfill on-brand merchandise. Fast lead times, premium quality, and scalable fulfillment for your organization.
              </p>
            </BlurFade>

            {/* CTA buttons */}
            <BlurFade delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  size="lg"
                  asChild
                  className="group relative overflow-hidden bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 h-12 md:h-14 px-6 md:px-8 text-base"
                >
                  <Link href="/search" className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    <span>Browse Products</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="group relative overflow-hidden border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 h-12 md:h-14 px-6 md:px-8 text-base"
                >
                  <Link href="/account" className="flex items-center gap-2">
                    <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    <span>Start a Project</span>
                  </Link>
                </Button>
              </div>
            </BlurFade>

            {/* Trust indicators */}
            <BlurFade delay={0.5}>
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Fast Lead Times</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Premium Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand-neon" />
                  <span>Scalable</span>
                </div>
              </div>
            </BlurFade>
          </div>

          {/* Visual element */}
          <BlurFade delay={0.6} className="hidden lg:block">
            <div className="relative">
              {/* Main visual card with Unsplash image */}
              <motion.div
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {/* Unsplash stock image - Custom merchandise/apparel */}
                <Image
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop"
                  alt="Custom branded merchandise and apparel"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Overlay gradient for better text contrast if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-brand-neon/50 rounded-tl-lg" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-brand-neon/50 rounded-br-lg" />
              </motion.div>

              {/* Floating stats cards */}
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="text-2xl font-bold text-primary font-heading">500+</div>
                <div className="text-sm text-muted-foreground">Happy Orgs</div>
              </motion.div>

              <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="text-2xl font-bold text-primary font-heading">10K+</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </motion.div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
