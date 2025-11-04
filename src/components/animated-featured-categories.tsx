"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { FeaturedCategories } from '@/src/features/categories/components/featured-categories'
import { fadeInUpContainer } from '@/lib/animations'
import type { Preloaded } from 'convex/react'
import type { api } from '@/convex/_generated/api'

interface AnimatedFeaturedCategoriesProps {
  orgSlug?: string
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>
  preloadedCategories?: Preloaded<typeof api.categories.queries.index.getCategories>
}

export function AnimatedFeaturedCategories(props: AnimatedFeaturedCategoriesProps) {
  return (
    <motion.section
      className="container mx-auto px-3 py-8 md:py-12 bg-muted/30"
      variants={fadeInUpContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
    >
      <FeaturedCategories {...props} />
    </motion.section>
  )
}
