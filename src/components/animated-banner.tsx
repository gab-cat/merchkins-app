'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MessageSquare, ShoppingBag, Users, Globe, ArrowRight, Sparkles, Store } from 'lucide-react';
import { useOrganizationMembership } from '@/src/hooks/use-organization-membership';
import { useChatwoot } from '@/src/components/chatwoot/use-chatwoot';
import { cn } from '@/lib/utils';

interface AnimatedBannerProps {
  bannerUrl?: string;
  logoUrl?: string;
  organization: {
    _id: string;
    name: string;
    description?: string;
    website?: string;
    industry?: string;
    memberCount?: number;
  };
  orgSlug: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
      delay: 0.1,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      delay: 0.4 + i * 0.08,
    },
  }),
};

export function AnimatedBanner({ bannerUrl, logoUrl, organization, orgSlug }: AnimatedBannerProps) {
  const { isAuthenticated, isMember, isLoading } = useOrganizationMembership(organization._id);
  const { toggle: openChatwoot, isReady: isChatwootReady } = useChatwoot();

  return (
    <motion.section
      aria-label="Organization banner"
      className="relative overflow-hidden mx-3 sm:mx-4 mt-3 sm:mt-4 rounded-2xl sm:rounded-3xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Base dark background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Banner background image with parallax-like effect */}
      {bannerUrl && (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={bannerUrl}
            alt={`${organization.name} banner`}
            fill
            className="object-cover object-center"
            fetchPriority="high"
            loading="eager"
          />
          {/* Multi-layer gradient overlay for depth */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/60 to-slate-900/30" />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 via-transparent to-slate-900/40" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-slate-900/90" />
        </motion.div>
      )}

      {/* Fallback gradient pattern when no banner */}
      {!bannerUrl && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(at 20% 20%, rgba(29, 67, 216, 0.3) 0px, transparent 50%),
                radial-gradient(at 80% 80%, rgba(173, 252, 4, 0.15) 0px, transparent 50%),
                radial-gradient(at 50% 50%, rgba(99, 102, 241, 0.1) 0px, transparent 70%)
              `,
            }}
          />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>
      )}

      {/* Animated accent lines */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#1d43d8]/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-neon/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 lg:gap-8">
          {/* Logo with glow effect */}
          <motion.div className="relative shrink-0" variants={logoVariants}>
            {/* Glow behind logo */}
            <div className="absolute -inset-2 bg-[#1d43d8]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

            <div
              className={cn(
                'relative h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24',
                'overflow-hidden rounded-xl sm:rounded-2xl',
                'ring-2 ring-white/20 shadow-2xl shadow-black/50',
                'bg-white'
              )}
            >
              <Image
                src={logoUrl || '/favicon.ico'}
                alt={`${organization.name} logo`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
                quality={100}
                priority
              />
            </div>

            {/* Store indicator badge */}
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-[#1d43d8] shadow-lg shadow-[#1d43d8]/30">
              <Store className="h-3 w-3 text-white" />
            </div>
          </motion.div>

          {/* Organization info */}
          <div className="min-w-0 flex-1 space-y-3">
            {/* Industry badge */}
            <motion.div variants={itemVariants}>
              {organization.industry && (
                <Badge className="bg-white/10 text-white border border-white/20 text-xs font-medium px-2.5 py-1 backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <Sparkles className="h-3 w-3 mr-1.5 text-brand-neon" />
                  {organization.industry}
                </Badge>
              )}
            </motion.div>

            {/* Organization name */}
            <motion.h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight font-heading text-white" variants={itemVariants}>
              {organization.name}
            </motion.h1>

            {organization.description && (
              <motion.p className="text-sm sm:text-base text-white/70 line-clamp-2 max-w-xl leading-relaxed" variants={itemVariants}>
                {organization.description}
              </motion.p>
            )}

            {/* Metadata row */}
            <motion.div className="flex items-center gap-3 sm:gap-4 flex-wrap" variants={itemVariants}>
              {organization.website && (
                <Link
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/60 hover:text-white transition-colors group"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="underline-offset-4 group-hover:underline">Website</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </Link>
              )}
              {organization.memberCount && organization.memberCount > 0 && (
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/60">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {organization.memberCount.toLocaleString()} {organization.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 pt-1 flex-wrap">
              {isAuthenticated && !isMember && !isLoading && (
                <motion.div custom={0} variants={buttonVariants}>
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium h-9 rounded-full backdrop-blur-sm transition-all duration-200"
                  >
                    <Link href={`/o/${orgSlug}/join`} className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      Join
                    </Link>
                  </Button>
                </motion.div>
              )}

              <motion.div custom={isAuthenticated && !isMember && !isLoading ? 1 : 0} variants={buttonVariants}>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white font-semibold h-9 rounded-full shadow-lg shadow-[#1d43d8]/30 transition-all duration-200 hover:shadow-xl hover:shadow-[#1d43d8]/40"
                >
                  <Link href={`/o/${orgSlug}/search`} className="flex items-center gap-2">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Shop Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div custom={isAuthenticated && !isMember && !isLoading ? 2 : 1} variants={buttonVariants}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openChatwoot('open')}
                  disabled={!isChatwootReady}
                  className="text-white/70 hover:text-white hover:bg-white/10 font-medium h-9 rounded-full transition-all duration-200 disabled:opacity-50"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-2" />
                  <span>Chat</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Inner glow border */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
    </motion.section>
  );
}
