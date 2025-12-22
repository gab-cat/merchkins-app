'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Lightbulb, Palette, Package, Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { BlurFade } from '@/src/components/ui/animations/effects';

const steps = [
  {
    number: '01',
    icon: Lightbulb,
    title: 'Dream It Up',
    description: "Share your vision with us. Whether it's a rough sketch or a polished concept, we'll bring it to life.",
    accent: 'from-amber-400 to-orange-500',
    bgAccent: 'bg-amber-50',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Design Magic',
    description: 'Our creative team transforms your ideas into stunning designs that capture your brand essence.',
    accent: 'from-[#1d43d8] to-indigo-500',
    bgAccent: 'bg-blue-50',
  },
  {
    number: '03',
    icon: Package,
    title: 'Craft & Create',
    description: 'Premium materials meet expert craftsmanship. Every piece is made with meticulous attention to detail.',
    accent: 'from-emerald-400 to-teal-500',
    bgAccent: 'bg-emerald-50',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Launch & Deliver',
    description: 'Your merch goes live in your custom storefront. We handle fulfillment while you focus on your community.',
    accent: 'from-[#adfc04] to-lime-400',
    bgAccent: 'bg-lime-50',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%']);

  return (
    <section ref={containerRef} className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-40 -left-20 w-80 h-80 bg-[#1d43d8]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-brand-neon/8 rounded-full blur-3xl" />

      {/* Floating grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <BlurFade delay={0}>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              <Sparkles className="h-4 w-4 text-brand-neon" />
              How It Works
            </span>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              From Idea to <span className="text-[#1d43d8]">Reality</span>
            </h2>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Your journey to amazing merchandise starts here. Four simple steps to bring your brand to life.
            </p>
          </BlurFade>
        </div>

        {/* Process Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="relative"
        >
          {/* Animated vertical timeline - desktop only */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2">
            <motion.div className="w-full bg-linear-to-b from-[#1d43d8] via-brand-neon to-emerald-500" style={{ height: lineHeight }} />
          </div>

          {/* Steps */}
          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;

              return (
                <motion.div key={step.number} variants={itemVariants} className="relative">
                  <div className={`lg:grid lg:grid-cols-2 lg:gap-16 items-center ${isEven ? '' : 'lg:direction-rtl'}`}>
                    {/* Content Card */}
                    <div className={`${isEven ? 'lg:text-right lg:pr-16' : 'lg:text-left lg:pl-16 lg:col-start-2'}`}>
                      <motion.div
                        className={`group relative bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100`}
                        whileHover={{ y: -5 }}
                      >
                        {/* Step number badge */}
                        <div className={`absolute -top-4 ${isEven ? 'lg:right-8 left-6 lg:left-auto' : 'left-6 lg:left-8'}`}>
                          <div
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br ${step.accent} text-white font-heading font-bold text-sm shadow-lg`}
                          >
                            {step.number}
                          </div>
                        </div>

                        <div className={`flex flex-col ${isEven ? 'lg:items-end' : 'lg:items-start'} gap-4 pt-4`}>
                          {/* Icon */}
                          <div className={`h-14 w-14 rounded-2xl ${step.bgAccent} flex items-center justify-center`}>
                            <Icon
                              className={`h-7 w-7 bg-linear-to-br ${step.accent} bg-clip-text text-transparent`}
                              style={{ color: index === 0 ? '#f59e0b' : index === 1 ? '#1d43d8' : index === 2 ? '#10b981' : '#84cc16' }}
                            />
                          </div>

                          {/* Text */}
                          <div className={`${isEven ? 'lg:text-right' : 'lg:text-left'}`}>
                            <h3 className="font-heading text-xl md:text-2xl font-bold text-slate-900 mb-2">{step.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{step.description}</p>
                          </div>

                          {/* Arrow indicator on hover */}
                          <motion.div className="opacity-0 group-hover:opacity-100 transition-opacity" initial={false}>
                            <ArrowRight className={`h-5 w-5 text-[#1d43d8] ${isEven ? 'lg:rotate-180' : ''}`} />
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Timeline node - desktop only */}
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <motion.div
                        className={`w-5 h-5 rounded-full bg-linear-to-br ${step.accent} shadow-lg ring-4 ring-slate-50`}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
                      />
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className={`hidden lg:block ${isEven ? '' : 'lg:col-start-1 lg:row-start-1'}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <BlurFade delay={0.5} className="text-center mt-16">
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 bg-[#0f172a] text-white rounded-full font-medium hover:bg-slate-800 transition-colors cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Ready to start your journey?</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
