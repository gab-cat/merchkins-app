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
import { Users, ShoppingBag, UserPlus, Building2, ArrowRight, Sparkles, Crown, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Section header */}
      <BlurFade>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight font-heading">Top Communities</h2>
            </div>
            <p className="text-muted-foreground text-sm">Join organizations and discover exclusive products</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Scroll controls for carousel */}
            <div className="hidden md:flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/50 hover:border-primary/50" onClick={scrollLeft}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/50 hover:border-primary/50" onClick={scrollRight}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Link
              className="group inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-all duration-200 whitespace-nowrap"
              href="/organizations"
            >
              <span>View all</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </BlurFade>

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
          {/* Featured Organization - Spotlight Card */}
          {featuredOrg && (
            <motion.div
              className="md:col-span-5 lg:col-span-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href={`/o/${featuredOrg.slug}`} className="group block h-full" prefetch>
                <div
                  className={cn(
                    'relative h-full min-h-[320px] rounded-3xl overflow-hidden',
                    'bg-linear-to-br from-primary via-primary/90 to-primary/70',
                    'shadow-xl hover:shadow-2xl transition-all duration-500',
                    'hover:scale-[1.02]'
                  )}
                >
                  {/* Banner background */}
                  <div className="absolute inset-0 opacity-40">{renderOrgBanner(featuredOrg)}</div>

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-transparent" />

                  {/* Featured badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-neon text-black text-xs font-bold shadow-lg">
                      <Crown className="h-3.5 w-3.5" />
                      Featured
                    </div>
                  </div>

                  {/* Organization type badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs font-semibold">
                      {featuredOrg.organizationType === 'PUBLIC' ? 'Open' : featuredOrg.organizationType === 'PRIVATE' ? 'Private' : 'Invite'}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {/* Logo */}
                    <div className="h-16 w-16 mb-4 overflow-hidden rounded-xl ring-2 ring-white/30 shadow-lg bg-white">
                      {renderOrgLogo(featuredOrg, 64)}
                    </div>

                    {/* Info */}
                    <h3 className="text-xl font-bold text-white font-heading mb-1">{featuredOrg.name}</h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">{featuredOrg.description || `Join @${featuredOrg.slug} today`}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5 text-white/80 text-sm">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold text-white">{featuredOrg.memberCount.toLocaleString()}</span>
                        <span>members</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/80 text-sm">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="font-semibold text-white">{featuredOrg.totalOrderCount.toLocaleString()}</span>
                        <span>orders</span>
                      </div>
                    </div>

                    {/* CTA */}
                    {!featuredOrg.isMember && featuredOrg.organizationType === 'PUBLIC' && (
                      <Button
                        className="w-full bg-white text-primary hover:bg-white/90 font-semibold gap-2"
                        onClick={(e) => handleJoin(e, featuredOrg.id, featuredOrg.organizationType)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Join Community
                      </Button>
                    )}
                    {featuredOrg.isMember && (
                      <Button className="w-full bg-white/20 text-white hover:bg-white/30 font-semibold gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Visit Store
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Regular Organizations - Horizontal Scroll */}
          <div className="md:col-span-7 lg:col-span-8">
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
                        'transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30'
                      )}
                    >
                      {/* Banner */}
                      <div className="relative h-24 w-full overflow-hidden">
                        {renderOrgBanner(org)}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

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

                        {/* Logo overlay */}
                        <div className="absolute bottom-2 left-3 h-12 w-12 overflow-hidden rounded-xl ring-2 ring-white shadow-lg bg-white">
                          {renderOrgLogo(org, 48)}
                        </div>
                      </div>

                      <CardContent className="p-4 pt-2 space-y-3">
                        {/* Name & slug */}
                        <div>
                          <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors font-heading truncate">
                            {org.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">@{org.slug}</p>
                        </div>

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
