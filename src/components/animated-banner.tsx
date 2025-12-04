'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  MessageSquare, 
  ShoppingBag, 
  Users, 
  Globe, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
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
    <section
      aria-label="Organization banner"
      className="relative overflow-hidden mx-4 mt-4 rounded-3xl"
    >
      {/* Black background - always */}
      <div className="absolute inset-0 bg-black rounded-3xl" />

      {/* Banner background image with high opacity */}
      {bannerUrl && (
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <Image 
            src={bannerUrl} 
            alt={`${organization.name} banner`} 
            fill 
            className="object-cover object-center opacity-80" 
            priority 
          />
          {/* Dark gradient overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Fallback gradient when no banner */}
      {!bannerUrl && (
        <div 
          className="absolute inset-0 rounded-3xl"
          style={{
            backgroundImage: `
              radial-gradient(at 20% 30%, rgba(29, 67, 216, 0.2) 0px, transparent 50%),
              radial-gradient(at 80% 70%, rgba(168, 85, 247, 0.15) 0px, transparent 50%)
            `,
          }}
        />
      )}

      {/* Top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-3xl" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
          {/* Logo */}
          <div className="relative">
            <div className={cn(
              'relative h-20 w-20 sm:h-24 sm:w-24',
              'overflow-hidden rounded-2xl',
              'ring-2 ring-white/20 shadow-2xl shadow-black/50',
              'bg-white flex-shrink-0'
            )}>
              <Image
                src={logoUrl || '/favicon.ico'}
                alt={`${organization.name} logo`}
                fill
                className="object-cover object-center"
                sizes="96px"
                quality={100}
                priority
              />
            </div>
          </div>

          {/* Organization info */}
          <div className="min-w-0 flex-1 space-y-2.5">
            {/* Industry badge */}
            {organization.industry && (
              <Badge 
                variant="secondary" 
                className="bg-white/15 text-white border border-white/20 text-xs font-medium px-2.5 py-0.5 backdrop-blur-sm"
              >
                <Sparkles className="h-3 w-3 mr-1.5 text-[#adfc04]" />
                {organization.industry}
              </Badge>
            )}

            {/* Organization name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-heading text-white drop-shadow-lg">
              {organization.name}
            </h1>

            {organization.description && (
              <p className="text-sm sm:text-base text-white/80 line-clamp-2 max-w-2xl leading-relaxed drop-shadow-md">
                {organization.description}
              </p>
            )}

            {/* Metadata row */}
            <div className="flex items-center gap-4 flex-wrap">
              {organization.website && (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="underline-offset-4 hover:underline">Website</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {organization.memberCount && organization.memberCount > 0 && (
                <div className="inline-flex items-center gap-1.5 text-sm text-white/70">
                  <Users className="h-4 w-4" />
                  <span>
                    {organization.memberCount.toLocaleString()} {organization.memberCount === 1 ? 'Member' : 'Members'}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              {isAuthenticated && !isMember && !isLoading && (
                <Button
                  asChild
                  variant="secondary"
                  size="default"
                  className="bg-white/15 text-white hover:bg-white/25 border border-white/20 font-medium h-10 rounded-xl backdrop-blur-sm"
                >
                  <Link href={`/o/${orgSlug}/join`} className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Join
                  </Link>
                </Button>
              )}
              
              <Button 
                asChild 
                size="default" 
                className="bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white font-semibold h-10 rounded-xl shadow-lg shadow-[#1d43d8]/30"
              >
                <Link href={`/o/${orgSlug}/search`} className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Shop Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="default"
                className="text-white/80 hover:text-white hover:bg-white/15 font-medium h-10 rounded-xl"
              >
                <Link href={`/o/${orgSlug}/chats`} className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Inner border for the rounded effect */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
    </section>
  );
}
