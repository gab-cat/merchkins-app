'use client';

import { Timeline } from '@/src/components/ui/timeline';
import { ArrowRight } from 'lucide-react';
import { BlurFade } from '@/src/components/ui/animations/effects';
import { motion } from 'framer-motion';
import Image from 'next/image';

const timelineData = [
  {
    title: 'Sign Up',
    content: (
      <div>
        <BlurFade delay={0}>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Apply for your free storefront in minutes. Tell us about your business — whether you&apos;re an artist, freelancer, or small business
            owner — and we&apos;ll get you set up quickly.
          </p>
        </BlurFade>
        <div className="grid grid-cols-2 gap-4">
          <BlurFade delay={0.1}>
            <Image
              src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500&h=500&fit=crop"
              alt="Brainstorming session"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.15}>
            <Image
              src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=500&fit=crop"
              alt="Design sketches"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.2}>
            <Image
              src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&h=500&fit=crop"
              alt="Concept mood board"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.25}>
            <Image
              src="https://images.unsplash.com/photo-1523726491678-bf852e717f6a?w=500&h=500&fit=crop"
              alt="Brand strategy"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
        </div>
      </div>
    ),
  },
  {
    title: 'Set Up Your Store',
    content: (
      <div>
        <BlurFade delay={0}>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Customize your storefront with your brand colors, logo, and products. Set up payment methods, shipping options, and connect your social
            channels for omni-channel customer support.
          </p>
        </BlurFade>
        <div className="grid grid-cols-2 gap-4">
          <BlurFade delay={0.1}>
            <Image
              src="https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&h=500&fit=crop"
              alt="Design process"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.15}>
            <Image
              src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop"
              alt="Color palette selection"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.2}>
            <Image
              src="https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=500&h=500&fit=crop"
              alt="Mockup creation"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.25}>
            <Image
              src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=500&fit=crop"
              alt="Design refinement"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
        </div>
      </div>
    ),
  },
  {
    title: 'Start Selling',
    content: (
      <div>
        <BlurFade delay={0}>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Go live and start accepting orders. Manage everything from one dashboard — orders, payments, inventory, and customer messages across
            Messenger, Facebook, email, and your website.
          </p>
        </BlurFade>
        <div className="grid grid-cols-2 gap-4">
          <BlurFade delay={0.1}>
            <Image
              src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=500&h=500&fit=crop"
              alt="Material selection"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.15}>
            <Image
              src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&h=500&fit=crop"
              alt="Screen printing"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.2}>
            <Image
              src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=500&h=500&fit=crop"
              alt="Quality control"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.25}>
            <Image
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&h=500&fit=crop"
              alt="Finished products"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
        </div>
      </div>
    ),
  },
  {
    title: 'Grow & Scale',
    content: (
      <div>
        <BlurFade delay={0}>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Use analytics to understand your customers and grow your business. Scale with confidence — we handle the complex logistics while you focus
            on creating and connecting with your community.
          </p>
        </BlurFade>
        <div className="grid grid-cols-2 gap-4">
          <BlurFade delay={0.1}>
            <Image
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=500&fit=crop"
              alt="Online storefront"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.15}>
            <Image
              src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=500&h=500&fit=crop"
              alt="Package delivery"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.2}>
            <Image
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=500&fit=crop"
              alt="Happy customer"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
          <BlurFade delay={0.25}>
            <Image
              src="https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=500&h=500&fit=crop"
              alt="Team celebration"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-32 lg:h-40 w-full shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            />
          </BlurFade>
        </div>
      </div>
    ),
  },
];

export function ProcessSection() {
  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        {/* Section Header */}
        <BlurFade delay={0}>
          <span className="inline-flex items-center gap-2 text-lg tracking-tight font-medium text-black border border-slate-200 px-4 py-1 rounded-full mb-4">
            How It Works
          </span>
        </BlurFade>
        <BlurFade delay={0.1}>
          <h2 className="text-lg md:text-4xl mb-4 text-black dark:text-white max-w-4xl font-heading font-bold">
            From Signup to <span className="text-[#1d43d8]">Success</span>
          </h2>
        </BlurFade>
        <BlurFade delay={0.2}>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-xl">
            Your journey to a unified selling platform starts here. Four simple steps to launch your business.
          </p>
        </BlurFade>
      </div>

      <Timeline data={timelineData} />

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
        <BlurFade delay={0.5} className="text-center">
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 bg-[#0f172a] text-white rounded-full font-medium hover:bg-slate-800 transition-colors cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Ready to launch your storefront?</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
