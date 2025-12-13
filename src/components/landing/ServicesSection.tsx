'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Palette, Store, Truck, HeadphonesIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { BlurFade } from '@/src/components/ui/animations/effects';

const services = [
  {
    icon: Palette,
    title: 'Design Services',
    description: 'Professional design assistance for creating stunning merchandise that represents your brand.',
    image: '/landing/service-design.png',
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: Store,
    title: 'Custom Storefronts',
    description: 'Step into a space built for your team — to sell, compete, and thrive.',
    image: '/landing/service-storefront.png',
    color: 'bg-blue-50',
    iconColor: 'text-[#1d43d8]',
  },
  {
    icon: Truck,
    title: 'Fulfillment',
    description: 'End-to-end order fulfillment from printing to packaging to delivery.',
    image: '/landing/service-fulfillment.png',
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: HeadphonesIcon,
    title: 'Support',
    description: 'Dedicated support team to help you every step of the way.',
    image: '/landing/service-support.png',
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];

export function ServicesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="services" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-[320px,1fr] gap-8 lg:gap-16 mb-12">
          <BlurFade delay={0}>
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider block mb-4">Services</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Explore our full range of merch services.</h2>
            <p className="mt-4 text-slate-600">From first design to final delivery — we've got the right program for you.</p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 border-2 border-[#1d43d8] text-[#1d43d8] text-sm font-semibold rounded-full hover:bg-[#1d43d8] hover:text-white transition-all group"
            >
              Explore More
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </BlurFade>

          {/* Scroll Controls */}
          <BlurFade delay={0.1} className="hidden lg:flex items-end justify-end gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-slate-200 text-slate-600 hover:border-[#1d43d8] hover:text-[#1d43d8] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-slate-200 text-slate-600 hover:border-[#1d43d8] hover:text-[#1d43d8] transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </BlurFade>
        </div>

        {/* Service Cards - Horizontal Scroll */}
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="flex-shrink-0 w-[300px] md:w-[320px] snap-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-full border border-slate-100">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium ${service.iconColor}`}
                    >
                      <service.icon className="h-4 w-4" />
                      {service.title}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                  <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#1d43d8] hover:gap-2 transition-all">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
