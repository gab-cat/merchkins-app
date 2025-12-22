'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Store, Truck, HeadphonesIcon, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { BlurFade } from '@/src/components/ui/animations/effects';

const services = [
  {
    icon: Store,
    title: 'Custom Storefronts',
    description: 'Your own branded online store — built for artists, freelancers, and SMEs to sell with ease.',
    image: '/landing/service-storefront.png',
    tagColor: 'bg-blue-100 text-[#1d43d8]',
  },
  {
    icon: Palette,
    title: 'Order Management',
    description: 'Track orders, manage inventory, and handle payments all from one unified dashboard.',
    image: '/landing/service-design.png',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Truck,
    title: 'Fulfillment',
    description: 'End-to-end order fulfillment from processing to packaging to delivery.',
    image: '/landing/service-fulfillment.png',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: HeadphonesIcon,
    title: 'Omni-Channel Inbox',
    description: 'Messenger, Facebook, email, website — all your customer conversations in one unified inbox.',
    image: '/landing/service-support.png',
    tagColor: 'bg-purple-100 text-purple-700',
  },
];

function ServiceCard({ service, index }: { service: (typeof services)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="w-full"
    >
      <div className="group relative overflow-hidden rounded-2xl aspect-square">
        {/* Background Image */}
        <Image src={service.image} alt={service.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${service.tagColor}`}>
            {service.title}
          </span>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-white/90 text-sm leading-relaxed mb-3">{service.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ServicesSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  const initialServices = services.slice(0, 2);
  const hiddenServices = services.slice(2, 4);

  return (
    <section id="services" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Layout: Side by Side */}
        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-10 lg:gap-16 items-start">
          {/* Left: Headline & CTA */}
          <BlurFade delay={0} className="lg:sticky lg:top-32">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-black text-lg border border-slate-200 font-medium mb-6">
              Services
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-slate-900 leading-[1.15] tracking-tight">
              Everything you need to run
              <br className="hidden md:block" /> your business, unified.
            </h2>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed max-w-md">
              From storefront setup to customer support — we've got everything covered.
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all group"
            >
              {isExpanded ? 'Show Less' : 'Explore More'}
              <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
          </BlurFade>

          {/* Right: Cards Grid + Navigation */}
          <div className="space-y-6">
            {/* Initial 2 Cards */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-xl ml-auto">
              {initialServices.map((service, index) => (
                <ServiceCard key={service.title} service={service} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Expandable Hidden Cards */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-4 lg:pt-4 lg:pl-[calc(50%+2rem)]">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {hiddenServices.map((service, index) => (
                    <ServiceCard key={service.title} service={service} index={index + 2} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
