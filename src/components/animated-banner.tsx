'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Megaphone, ExternalLink, MessageSquare, Ticket, ShoppingBag } from 'lucide-react';
import { fadeInUp, fadeInUpContainer, fadeInUpVariants } from '@/lib/animations';

interface AnimatedBannerProps {
  bannerUrl?: string;
  logoUrl?: string;
  organization: {
    name: string;
    description?: string;
    website?: string;
    industry?: string;
    memberCount?: number;
  };
  orgSlug: string;
}

export function AnimatedBanner({ bannerUrl, logoUrl, organization, orgSlug }: AnimatedBannerProps) {
  return (
    <motion.section
      aria-label="Organization banner"
      className="relative bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50 rounded-b-md overflow-hidden"
      variants={fadeInUpContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
    >
      {/* Banner background image */}
      {bannerUrl && (
        <div className="absolute inset-0 opacity-30 rounded-b-md overflow-hidden">
          <Image src={bannerUrl as string} alt={`${organization.name} banner`} fill className="object-cover object-center" priority />
        </div>
      )}

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10 rounded-b-md" />

      {/* Organization content */}
      <div className="relative container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Logo */}
          <motion.div
            className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 overflow-hidden rounded-xl ring-2 ring-white/20 bg-white shadow-lg flex-shrink-0"
            variants={fadeInUp}
          >
            <Image
              src={logoUrl || '/favicon.ico'}
              alt={`${organization.name} logo`}
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 80px, (min-width: 768px) 64px, 56px"
              quality={100}
              priority
            />
          </motion.div>

          {/* Organization info */}
          <motion.div className="min-w-0 flex-1 pt-0.5" variants={fadeInUpVariants.subtle}>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-sm">{organization.name}</h1>

            {organization.description && <p className="mt-1 text-sm sm:text-base text-white/90 line-clamp-1 max-w-2xl">{organization.description}</p>}

            {/* Metadata row */}
            <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-white/80 flex-wrap">
              {organization.website && (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">Visit website</span>
                  <span className="sm:hidden">Website</span>
                </a>
              )}
              {organization.website && (organization.industry || organization.memberCount) && <span className="text-white/40">•</span>}
              {organization.industry && <span>{organization.industry}</span>}
              {organization.industry && organization.memberCount && <span className="text-white/40">•</span>}
              {organization.memberCount && (
                <span>
                  {organization.memberCount} {organization.memberCount === 1 ? 'Member' : 'Members'}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-3 sm:mt-4 flex items-center gap-2">
              <Button asChild size="sm" className="bg-white text-primary hover:bg-white/90 shadow-md">
                <Link href={`/o/${orgSlug}/search`} className="flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4" />
                  Shop now
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link href={`/o/${orgSlug}/chats`} className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  Chat with us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
