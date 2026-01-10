'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery, useMutation, usePreloadedQuery, Preloaded } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Id } from '@/convex/_generated/dataModel';
import { R2Image } from '@/src/components/ui/r2-image';
import { Users, ShoppingBag, UserPlus, ArrowRight, Sparkles, Crown, ChevronLeft, ChevronRight, ExternalLink, CheckCircle } from 'lucide-react';
import { BlurFade } from '@/src/components/ui/animations';
import { cn, buildR2PublicUrl } from '@/lib/utils';

interface PopularOrganizationsProps {
  limit?: number;
  preloadedOrganizations?: Preloaded<typeof api.organizations.queries.index.getPopularOrganizations>;
}

type PopularOrg = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logoUrl?: string;
  bannerImage?: string;
  bannerImageUrl?: string;
  organizationType: string;
  industry?: string;
  memberCount: number;
  totalOrderCount: number;
  isMember?: boolean;
};

// Inner component shared by both variants
interface PopularOrganizationsInnerProps {
  organizations: PopularOrg[];
  loading: boolean;
}

function PopularOrganizationsInner({ organizations, loading }: PopularOrganizationsInnerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const joinPublic = useMutation(api.organizations.mutations.index.joinPublicOrganization);
  const requestJoin = useMutation(api.organizations.mutations.index.requestToJoinOrganization);

  // Featured org is the first one, rest are regular
  const featuredOrg = organizations[0];
  const regularOrgs = organizations.slice(1);

  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');

  const handleJoin = async (e: React.MouseEvent, orgId: string, orgType: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (orgType === 'PUBLIC') {
        await joinPublic({ organizationId: orgId as unknown as Id<'organizations'> });
        return;
      }
      if (orgType === 'PRIVATE') {
        await requestJoin({ organizationId: orgId as unknown as Id<'organizations'> });
      }
    } catch {}
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const renderOrgLogo = (org: PopularOrg, size: number = 56) => {
    // Use logoUrl if available, otherwise use logo key
    const logoKey = org.logoUrl || org.logo;
    if (logoKey) {
      const publicUrl = buildR2PublicUrl(logoKey);
      if (publicUrl) {
        return <Image src={publicUrl} alt={`${org.name} logo`} width={size} height={size} className="h-full w-full object-cover" />;
      }
    }
    return (
      <div className="h-full w-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-lg font-bold">
        {org.name?.charAt(0) || 'O'}
      </div>
    );
  };

  const renderOrgBanner = (org: PopularOrg) => {
    if (org.bannerImageUrl) {
      return (
        <Image
          src={org.bannerImageUrl as string}
          alt={`${org.name} banner`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      );
    }
    if (org.bannerImage && isKey(org.bannerImage)) {
      return (
        <R2Image
          fileKey={org.bannerImage as string}
          alt={`${org.name} banner`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      );
    }
    if (org.bannerImage) {
      return (
        <Image
          src={org.bannerImage as string}
          alt={`${org.name} banner`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      );
    }
    return <div className="h-full w-full bg-linear-to-br from-primary/40 via-primary/20 to-brand-neon/30" />;
  };

  return (
    <div className="space-y-10">
      {/* Section header — minimal, editorial */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-slate-400 mb-2">Community</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-heading">Top Stores</h2>
        </div>
        <div className="flex items-center gap-2 pb-1">
          {/* Scroll controls for carousel */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700 hover:border-[#1d43d8]/50"
              onClick={scrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700 hover:border-[#1d43d8]/50"
              onClick={scrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Link
            className="group inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-all duration-200 whitespace-nowrap"
            href="/orgs"
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>

      {loading ? (
        /* Loading skeleton */
        <div className="grid gap-5 md:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-4">
            <div className="h-80 rounded-3xl bg-linear-to-br from-secondary to-secondary/50 skeleton" />
          </div>
          <div className="md:col-span-7 lg:col-span-8">
            <div className="flex gap-4 overflow-hidden">
              {new Array(3).fill(null).map((_, i) => (
                <div key={i} className="shrink-0 w-72 h-64 rounded-2xl bg-linear-to-br from-secondary to-secondary/50 skeleton" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Featured Organization - Banner as Top Strip */}
          {featuredOrg && (
            <motion.div
              className="md:col-span-5 lg:col-span-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className={cn(
                  'relative h-full min-h-[420px] rounded-2xl overflow-hidden',
                  'bg-white dark:bg-slate-900',
                  'border border-slate-200 dark:border-slate-800',
                  'shadow-xl hover:shadow-2xl hover:border-[#1d43d8]/30',
                  'transition-all duration-500 group'
                )}
              >
                {/* Banner Strip at Top */}
                <div className="relative h-28 md:h-32 w-full overflow-hidden">
                  {renderOrgBanner(featuredOrg)}
                  <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/10 to-transparent" />

                  {/* Badges on Banner */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-neon text-black text-xs font-bold shadow-lg">
                      <Crown className="h-3.5 w-3.5" />
                      Featured
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 border-0 text-xs font-medium"
                    >
                      {featuredOrg.organizationType === 'PUBLIC' ? 'Public' : featuredOrg.organizationType === 'PRIVATE' ? 'Private' : 'Invite Only'}
                    </Badge>
                  </div>
                </div>

                {/* Content Area */}
                <div className="relative p-6 md:p-8 flex flex-col">
                  {/* Logo positioned at junction of banner and content */}
                  <div className="flex items-start gap-4 mb-4 -mt-8">
                    <div className="shrink-0 h-20 w-20 rounded-xl overflow-hidden bg-white dark:bg-slate-900 ring-4 ring-white dark:ring-slate-900 shadow-xl">
                      {renderOrgLogo(featuredOrg, 80)}
                    </div>
                    <div className="flex-1 min-w-0 pt-4">
                      <Link href={`/o/${featuredOrg.slug}`} className="block group/link" prefetch>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-heading line-clamp-1 group-hover/link:text-[#1d43d8] transition-colors mb-1">
                          {featuredOrg.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400">@{featuredOrg.slug}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6">
                    {featuredOrg.description || `Join the ${featuredOrg.name} community and discover exclusive products.`}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6 mb-6">
                    {/* Member avatars + count */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(3, featuredOrg.memberCount))].map((_, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-linear-to-br from-[#1d43d8] to-[#1d43d8]/70 border-2 border-white dark:border-slate-900 flex items-center justify-center"
                          >
                            <Users className="h-3 w-3 text-white" />
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{featuredOrg.memberCount.toLocaleString()}</span>
                      <span className="text-xs text-slate-500">members</span>
                    </div>
                    {/* Orders */}
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="font-semibold text-slate-900 dark:text-white">{featuredOrg.totalOrderCount.toLocaleString()}</span>
                      <span className="text-xs">orders</span>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 min-h-[40px]" />

                  {/* CTA Buttons */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/o/${featuredOrg.slug}`}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full',
                        'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                        'font-semibold text-sm',
                        'hover:bg-[#1d43d8] hover:text-white dark:hover:bg-[#1d43d8]',
                        'transition-all duration-300'
                      )}
                      prefetch
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Store
                    </Link>
                    {!featuredOrg.isMember && featuredOrg.organizationType === 'PUBLIC' && (
                      <Button
                        variant="outline"
                        className="flex-1 rounded-full border-slate-200 dark:border-slate-700 hover:border-[#1d43d8]/50 hover:bg-[#1d43d8]/5"
                        onClick={(e) => handleJoin(e, featuredOrg.id, featuredOrg.organizationType)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join
                      </Button>
                    )}
                    {featuredOrg.isMember && (
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Member
                      </div>
                    )}
                  </div>
                </div>

                {/* Geometric accent */}
                <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
                  <div className="absolute bottom-6 right-6 w-px h-12 bg-linear-to-t from-[#1d43d8]/20 to-transparent" />
                  <div className="absolute bottom-6 right-6 w-12 h-px bg-linear-to-l from-[#1d43d8]/20 to-transparent" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Regular Organizations - Horizontal Scroll */}
          <div className="md:col-span-7 lg:col-span-7">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {regularOrgs.map((org, index) => (
                <motion.div
                  key={org.id}
                  className="shrink-0 w-72 snap-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Link href={`/o/${org.slug}`} className="group block h-full" prefetch>
                    <Card
                      className={cn(
                        'h-full overflow-hidden rounded-2xl border bg-card shadow-sm py-0',
                        'transition-all duration-300 hover:shadow-xl hover:border-primary/30'
                      )}
                    >
                      {/* Compact Banner Strip */}
                      <div className="relative h-16 w-full overflow-hidden">
                        {renderOrgBanner(org)}
                        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-transparent" />

                        {/* Type badge */}
                        <Badge
                          variant="secondary"
                          className={cn(
                            'absolute top-2 right-2 text-[10px] px-2 py-0.5 font-semibold',
                            org.organizationType === 'PUBLIC' ? 'bg-brand-neon text-black' : 'bg-black/50 text-white backdrop-blur-sm'
                          )}
                        >
                          {org.organizationType === 'PUBLIC' ? 'Open' : org.organizationType === 'PRIVATE' ? 'Private' : 'Invite'}
                        </Badge>
                      </div>

                      <CardContent className="p-4 pt-0 space-y-3">
                        {/* Logo + Name + Slug - Horizontal Layout */}
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-200 dark:ring-slate-700 shadow-sm">
                            {renderOrgLogo(org, 48)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base py-0 font-bold text-foreground group-hover:text-primary transition-colors font-heading truncate leading-tight">
                              {org.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground truncate">@{org.slug}</p>
                          </div>
                        </div>

                        {/* Description */}
                        {org.description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{org.description}</p>}

                        {/* Industry */}
                        {org.industry && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-primary/5 border-primary/20">
                            {org.industry}
                          </Badge>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span className="font-semibold text-foreground">{org.memberCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-3.5 w-3.5 text-brand-neon" />
                            <span className="font-semibold text-foreground">{org.totalOrderCount}</span>
                          </div>

                          {/* Join button */}
                          {!org.isMember && org.organizationType === 'PUBLIC' && (
                            <Button
                              size="sm"
                              className="ml-auto h-7 px-2.5 text-xs font-semibold gap-1"
                              onClick={(e) => handleJoin(e, org.id, org.organizationType)}
                            >
                              <UserPlus className="h-3 w-3" />
                              Join
                            </Button>
                          )}
                          {org.isMember && (
                            <Badge variant="secondary" className="ml-auto text-xs bg-primary/10 text-primary">
                              Member
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && organizations.length === 0 && (
        <BlurFade>
          <div className="text-center py-16 px-4 rounded-2xl bg-muted/30 border border-dashed border-border">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary/50" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">No communities yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Organizations will appear here once available.</p>
          </div>
        </BlurFade>
      )}
    </div>
  );
}

// Variant that uses preloaded query (for server-side preloading)
function PopularOrganizationsPreloaded({
  preloadedOrganizations,
}: {
  preloadedOrganizations: Preloaded<typeof api.organizations.queries.index.getPopularOrganizations>;
}) {
  const result = usePreloadedQuery(preloadedOrganizations);
  const loading = result === undefined;
  const organizations = (result?.organizations ?? []) as unknown as PopularOrg[];

  return <PopularOrganizationsInner organizations={organizations} loading={loading} />;
}

// Variant that uses regular query (for client-side fetching)
function PopularOrganizationsQuery({ limit = 8 }: { limit?: number }) {
  const result = useQuery(api.organizations.queries.index.getPopularOrganizations, { limit });
  const loading = result === undefined;
  const organizations = (result?.organizations ?? []) as unknown as PopularOrg[];

  return <PopularOrganizationsInner organizations={organizations} loading={loading} />;
}

// Main export: chooses between preloaded and query variants
export function PopularOrganizations({ limit = 8, preloadedOrganizations }: PopularOrganizationsProps) {
  // Use preloaded variant if preloaded query is provided
  if (preloadedOrganizations) {
    return <PopularOrganizationsPreloaded preloadedOrganizations={preloadedOrganizations} />;
  }

  // Otherwise use client-side query
  return <PopularOrganizationsQuery limit={limit} />;
}
