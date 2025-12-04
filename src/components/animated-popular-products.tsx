'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PopularProducts } from '@/src/features/products/components/popular-products';
import type { Preloaded } from 'convex/react';
import type { api } from '@/convex/_generated/api';

interface AnimatedPopularProductsProps {
  orgSlug?: string;
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedProducts?: Preloaded<typeof api.products.queries.index.getPopularProducts>;
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

export function AnimatedPopularProducts(props: AnimatedPopularProductsProps) {
  return (
    <motion.section
      className="container mx-auto px-3 py-6 sm:py-8 md:py-10"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <motion.div variants={contentVariants}>
        <PopularProducts {...props} />
      </motion.div>
    </motion.section>
  );
}
