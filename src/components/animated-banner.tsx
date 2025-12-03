'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MessageSquare, ShoppingBag, Users, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { BlurFade, Float } from '@/src/components/ui/animations';
import { BeamsBackground } from '@/src/components/ui/backgrounds';
import { useOrganizationMembership } from '@/src/hooks/use-organization-membership';
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

export function AnimatedBanner({ bannerUrl, logoUrl, organization, orgSlug }: AnimatedBannerProps) {
  const { isAuthenticated, isMember, isLoading } = useOrganizationMembership(organization._id);

  return (
    <motion.section
      aria-label="Organization banner"
      className="relative overflow-hidden rounded-b-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated beams background */}
      <div className="absolute inset-0 opacity-40">
        <BeamsBackground />
      </div>

      {/* Banner background image */}
      {bannerUrl && (
        <div className="absolute inset-0 opacity-25">
          <Image src={bannerUrl as string} alt={`${organization.name} banner`} fill className="object-cover object-center" priority />
        </div>
      )}

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-transparent to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      {/* Organization content */}
      <div className="relative container mx-auto px-4 py-10 sm:py-14 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
          {/* Logo with floating effect */}
          <Float amplitude={4}>
            <motion.div
              className={cn(
                'relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28',
                'overflow-hidden rounded-2xl',
                'ring-4 ring-white/30 shadow-2xl shadow-black/20',
                'bg-white flex-shrink-0'
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={logoUrl || '/favicon.ico'}
                alt={`${organization.name} logo`}
                fill
                className="object-cover object-center"
                sizes="(min-width: 1024px) 112px, (min-width: 768px) 96px, 80px"
                quality={100}
                priority
              />
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Float>

          {/* Organization info */}
          <div className="min-w-0 flex-1 space-y-4">
            <BlurFade delay={0.1}>
              {/* Industry badge */}
              {organization.industry && (
                <Badge variant="secondary" className="mb-2 bg-white/15 text-white border-white/20 backdrop-blur-sm text-xs font-medium px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  {organization.industry}
                </Badge>
              )}

              {/* Organization name */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-md font-heading">
                {organization.name}
              </h1>
            </BlurFade>

            {organization.description && (
              <BlurFade delay={0.2}>
                <p className="text-sm sm:text-base text-white/85 line-clamp-2 max-w-2xl leading-relaxed">{organization.description}</p>
              </BlurFade>
            )}

            {/* Metadata row */}
            <BlurFade delay={0.3}>
              <div className="flex items-center gap-3 text-sm text-white/75 flex-wrap">
                {organization.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors group"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="underline-offset-2 group-hover:underline">Website</span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                )}
                {organization.memberCount && (
                  <>
                    {organization.website && <span className="text-white/30">•</span>}
                    <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-white">
                        {organization.memberCount.toLocaleString()} {organization.memberCount === 1 ? 'Member' : 'Members'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </BlurFade>

            {/* Action buttons */}
            <BlurFade delay={0.4}>
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                {isAuthenticated && !isMember && !isLoading && (
                  <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-sm font-semibold shadow-lg"
                  >
                    <Link href={`/o/${orgSlug}/join`} className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Join organization
                    </Link>
                  </Button>
                )}
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/20 font-semibold group">
                  <Link href={`/o/${orgSlug}/search`} className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Shop now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60 backdrop-blur-sm font-semibold"
                >
                  <Link href={`/o/${orgSlug}/chats`} className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </Link>
                </Button>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>

      {/* Bottom edge glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </motion.section>
  );
}
