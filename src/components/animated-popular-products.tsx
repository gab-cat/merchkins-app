'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PopularProducts } from '@/src/features/products/components/popular-products';
import { fadeInUpContainer } from '@/lib/animations';
import type { Preloaded } from 'convex/react';
import type { api } from '@/convex/_generated/api';

interface AnimatedPopularProductsProps {
  orgSlug?: string;
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedProducts?: Preloaded<typeof api.products.queries.index.getPopularProducts>;
}

export function AnimatedPopularProducts(props: AnimatedPopularProductsProps) {
  return (
    <motion.section
      className="container mx-auto px-3 py-8 md:py-12"
      variants={fadeInUpContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
    >
      <PopularProducts {...props} />
    </motion.section>
  );
}
