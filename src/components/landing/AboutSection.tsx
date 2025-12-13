'use client';

import { BlurFade } from '@/src/components/ui/animations/effects';

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[280px,1fr] gap-8 lg:gap-16 items-start">
          {/* Section Label */}
          <BlurFade delay={0}>
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">About Merchkins</span>
          </BlurFade>

          {/* Description */}
          <BlurFade delay={0.1} className="space-y-6">
            <p className="text-2xl md:text-3xl lg:text-4xl font-heading tracking-tight font-semibold text-slate-900 leading-relaxed">
              At Merchkins, we don't just create merchandise — we <span className="text-[#1d43d8]">live and breathe it</span>. Since 2024, our
              platform has been a home for organizations of all sizes, from eager startups to seasoned enterprises.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
              We believe every team deserves amazing branded products. That's why we've built the most intuitive platform for designing, managing, and
              fulfilling custom merchandise — all in one place.
            </p>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
