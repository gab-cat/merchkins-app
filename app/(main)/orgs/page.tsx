'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useCurrentUser } from '@/src/features/auth/hooks/use-current-user';
import { R2Image } from '@/src/components/ui/r2-image';
import { BlurFade } from '@/src/components/ui/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Building2, Users, Sparkles, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

// Swipe Card Component for Tinder-style interaction
function SwipeCard({
  org,
  onSwipe,
  isTop,
}: {
  org: {
    _id: Id<'organizations'>;
    name: string;
    description?: string;
    logo?: string;
    memberCount?: number;
    slug: string;
    organizationType: 'PUBLIC' | 'PRIVATE' | 'SECRET';
  };
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Overlay indicators based on drag direction
  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const threshold = 100;
      if (info.offset.x > threshold) {
        onSwipe('right');
      } else if (info.offset.x < -threshold) {
        onSwipe('left');
      }
    },
    [onSwipe]
  );

  if (!isTop) {
    return <motion.div className="absolute inset-0 rounded-3xl bg-card border shadow-lg" style={{ scale: 0.95, y: 10 }} />;
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      <div className="relative w-full h-full rounded-3xl bg-card border shadow-xl overflow-hidden">
        {/* Skip indicator */}
        <motion.div
          className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl border-4 border-red-400 text-red-400 font-bold text-2xl rotate-[-20deg]"
          style={{ opacity: leftIndicatorOpacity }}
        >
          SKIP
        </motion.div>

        {/* Join indicator */}
        <motion.div
          className="absolute top-6 right-6 z-20 px-4 py-2 rounded-xl border-4 border-green-400 text-green-400 font-bold text-2xl rotate-20"
          style={{ opacity: rightIndicatorOpacity }}
        >
          JOIN
        </motion.div>

        {/* Organization Logo */}
        <div className="relative h-56 bg-linear-to-br from-primary/10 to-primary/5">
          <R2Image
            fileKey={org.logo}
            alt={org.name}
            fill
            className="object-cover"
            sizes="400px"
            fallbackClassName="w-full h-full flex items-center justify-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent" />
        </div>

        {/* Organization Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">{org.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {org.organizationType === 'PUBLIC' ? (
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>{org.memberCount || 0} members</span>
                </div>
              </div>
            </div>
          </div>

          {org.description && <p className="text-muted-foreground text-sm line-clamp-3">{org.description}</p>}

          <p className="text-xs text-muted-foreground/60">Swipe right to join • Swipe left to skip</p>
        </div>
      </div>
    </motion.div>
  );
}

// Swipe Discovery Section
function SwipeDiscovery() {
  const { user } = useCurrentUser();
  const [_currentIndex, _setCurrentIndex] = useState(0);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const joinOrg = useMutation(api.organizations.mutations.index.joinPublicOrganization);

  const popularOrgsResult = useQuery(api.organizations.queries.index.getPopularOrganizations, { limit: 20 });
  const userOrgs = useQuery(api.organizations.queries.index.getOrganizationsByUser, user?._id ? { userId: user._id } : 'skip');

  const userOrgIds = useMemo(() => new Set(userOrgs?.map((o) => o._id) || []), [userOrgs]);

  // Filter out orgs user already joined or skipped
  const availableOrgs = useMemo(() => {
    if (!popularOrgsResult?.organizations) return [];
    return popularOrgsResult.organizations.filter((org) => !userOrgIds.has(org.id) && !skippedIds.has(org.id) && org.organizationType === 'PUBLIC');
  }, [popularOrgsResult?.organizations, userOrgIds, skippedIds]);

  const handleSwipe = useCallback(
    async (direction: 'left' | 'right') => {
      const currentOrg = availableOrgs[0];
      if (!currentOrg) return;

      if (direction === 'right') {
        try {
          await joinOrg({ organizationId: currentOrg.id });
          toast.success(`Joined ${currentOrg.name}!`, {
            icon: <Heart className="w-4 h-4 text-green-500" />,
          });
        } catch (error) {
          console.error('Join org failed:', error);
          toast.error('Failed to join organization');
        }
      } else {
        setSkippedIds((prev) => new Set(prev).add(currentOrg.id));
      }
    },
    [availableOrgs, joinOrg]
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sign in to discover organizations</h3>
        <p className="text-muted-foreground mb-4">Join communities and explore their merch</p>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </div>
    );
  }

  if (availableOrgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles className="w-12 h-12 text-primary/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">You've seen them all!</h3>
        <p className="text-muted-foreground">Check back later for new organizations to discover</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Swipe Cards Stack */}
      <div className="relative h-[420px] w-full max-w-sm mx-auto">
        <AnimatePresence>
          {availableOrgs.slice(0, 2).map((org, index) => (
            <SwipeCard
              key={org.id}
              org={{
                _id: org.id,
                name: org.name,
                description: org.description,
                logo: org.logo,
                memberCount: org.memberCount,
                slug: org.slug,
                organizationType: org.organizationType,
              }}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-8">
        <motion.button
          className="w-14 h-14 rounded-full border-2 border-red-300 flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left')}
        >
          <X className="w-7 h-7" />
        </motion.button>

        <motion.button
          className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right')}
        >
          <Heart className="w-8 h-8" />
        </motion.button>
      </div>
    </div>
  );
}

// Organizations Grid
function OrganizationsGrid() {
  const { user } = useCurrentUser();
  const popularOrgsResult = useQuery(api.organizations.queries.index.getPopularOrganizations, { limit: 50 });
  const userOrgs = useQuery(api.organizations.queries.index.getOrganizationsByUser, user?._id ? { userId: user._id } : 'skip');
  const joinOrg = useMutation(api.organizations.mutations.index.joinPublicOrganization);

  const userOrgIds = useMemo(() => new Set(userOrgs?.map((o) => o._id) || []), [userOrgs]);

  const handleJoin = async (orgId: Id<'organizations'>, orgName: string) => {
    try {
      await joinOrg({ organizationId: orgId });
      toast.success(`Joined ${orgName}!`);
    } catch (error) {
      console.error('Verify join failed:', error);
      toast.error('Failed to join organization');
    }
  };

  if (!popularOrgsResult?.organizations) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {popularOrgsResult.organizations.map((org) => {
        const isJoined = userOrgIds.has(org.id);
        return (
          <Card key={org.id} className="group hover:shadow-lg pt-0 transition-all duration-300 overflow-hidden">
            <div className="relative h-28 bg-linear-to-br from-primary/10 to-primary/5">
              <R2Image
                fileKey={org.logo}
                alt={org.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="300px"
                fallbackClassName="w-full h-full flex items-center justify-center"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{org.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs mt-1">
                    <Users className="w-3 h-3" />
                    {org.memberCount || 0} members
                  </CardDescription>
                </div>
                {org.organizationType === 'PUBLIC' ? (
                  <Badge variant="secondary" className="text-[10px] gap-0.5">
                    <Globe className="w-2.5 h-2.5" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    Private
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {org.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{org.description}</p>}
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                  <Link href={`/o/${org.slug}`}>View Store</Link>
                </Button>
                {org.organizationType === 'PUBLIC' && !isJoined && user && (
                  <Button size="sm" className="flex-1 text-xs" onClick={() => handleJoin(org.id, org.name)}>
                    Join
                  </Button>
                )}
                {isJoined && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    Joined
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function OrgsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Swipe Discovery */}
      <section className="relative py-12 md:py-16 border-b bg-linear-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BlurFade delay={0.1}>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Discover Organizations</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">Swipe right to join, left to skip. Find your community.</p>
          </BlurFade>

          <BlurFade delay={0.2}>
            <SignedIn>
              <SwipeDiscovery />
            </SignedIn>
            <SignedOut>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sign in to discover organizations</h3>
                <p className="text-muted-foreground mb-4">Join communities and explore their merch</p>
                <SignInButton mode="modal">
                  <Button size="lg">Sign In to Start Swiping</Button>
                </SignInButton>
              </div>
            </SignedOut>
          </BlurFade>
        </div>
      </section>

      {/* Browse All Organizations */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <BlurFade delay={0.3}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Browse All</h2>
                <p className="text-muted-foreground">Explore all available organizations</p>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.4}>
            <OrganizationsGrid />
          </BlurFade>
        </div>
      </section>
    </div>
  );
}
