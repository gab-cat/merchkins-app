'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FeaturedCategories } from '@/src/features/categories/components/featured-categories';
import type { Preloaded } from 'convex/react';
import type { api } from '@/convex/_generated/api';

interface AnimatedFeaturedCategoriesProps {
  orgSlug?: string;
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedCategories?: Preloaded<typeof api.categories.queries.index.getCategories>;
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function AnimatedFeaturedCategories(props: AnimatedFeaturedCategoriesProps) {
  return (
    <motion.section
      className="relative py-6 sm:py-8 md:py-10"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-slate-50/80 to-white" />

      <motion.div className="container mx-auto px-3 relative" variants={contentVariants}>
        <FeaturedCategories {...props} />
      </motion.div>
    </motion.section>
  );
}
