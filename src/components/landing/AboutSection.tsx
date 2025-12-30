'use client';

import { MacbookScroll } from '@/src/components/ui/macbook-scroll';
import { BlurFade } from '@/src/components/ui/animations/effects';
import Link from 'next/link';

export function AboutSection() {
  return (
    <section id="about" className="overflow-hidden bg-linear-to-b from-white via-slate-50 to-slate-100">
      {/* Text Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-[280px,1fr] gap-8 lg:gap-16 items-start">
          {/* Section Label */}
          <BlurFade delay={0}>
            <span className="text-lg tracking-tight font-medium text-black border border-slate-200 px-4 py-1 rounded-full">About Merchkins</span>
          </BlurFade>

          {/* Description */}
          <BlurFade delay={0.1} className="space-y-6">
            <p className="text-2xl md:text-3xl lg:text-4xl font-heading tracking-tight font-semibold text-slate-900 leading-relaxed">
              At Merchkins, we <span className="text-[#1d43d8]">empower independent sellers</span> — artists, freelancers, and small businesses. Since
              2024, our platform has been the go-to solution for creators who want to focus on what they do best.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
              We believe every seller deserves professional tools without the complexity. That's why we've built a unified platform for ordering,
              payments, fulfillment, and omni-channel customer support — everything you need in one place.
            </p>
          </BlurFade>
        </div>
      </div>

      {/* MacBook Scroll Animation */}
      <MacbookScroll
        title={
          <span className="text-3xl md:text-4xl font-heading font-bold bg-linear-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-300 dark:to-white bg-clip-text text-transparent">
            Your merch empire,
            <br />
            managed beautifully.
          </span>
        }
        src="/landing/screenshot.png"
        showGradient={true}
        badge={<Badge />}
      />
    </section>
  );
}

const Badge = () => {
  return (
    <Link
      href="/"
      className="group relative flex items-center gap-2 rounded-full bg-black/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition-all hover:bg-black hover:scale-105"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#1d43d8]">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
      <span>Built for sellers</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      >
        <path
          fillRule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
};
