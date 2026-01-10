'use client';

import React, { useState, useMemo, useDeferredValue } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useCurrentUser } from '@/src/features/auth/hooks/use-current-user';
import { R2Image } from '@/src/components/ui/r2-image';
import { BlurFade } from '@/src/components/ui/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Building2, Users, Globe, Lock, Search, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { SignedIn, SignedOut, SignInButton, useClerk } from '@clerk/nextjs';

type OrgType = 'ALL' | 'PUBLIC' | 'PRIVATE';

// Type filter configuration
const TYPE_FILTERS: Array<{ key: OrgType; label: string; icon: React.ElementType }> = [
  { key: 'ALL', label: 'All', icon: Building2 },
  { key: 'PUBLIC', label: 'Public', icon: Globe },
  { key: 'PRIVATE', label: 'Private', icon: Lock },
];

// Improved Organization Card with Banner + Logo
function OrganizationCard({
  org,
  isJoined,
  onJoin,
  onRequestJoin,
}: {
  org: {
    id: Id<'organizations'>;
    name: string;
    description?: string;
    logo?: string;
    logoUrl?: string;
    bannerImage?: string;
    bannerImageUrl?: string;
    memberCount: number;
    slug: string;
    organizationType: 'PUBLIC' | 'PRIVATE' | 'SECRET';
  };
  isJoined: boolean;
  onJoin: () => void;
  onRequestJoin: () => void;
}) {
  const bannerSrc = org.bannerImageUrl || org.bannerImage;
  const logoSrc = org.logoUrl || org.logo;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="group relative overflow-hidden pt-0 hover:shadow-lg transition-all duration-300 border-slate-100 hover:border-slate-200">
        {/* Banner Image */}
        <div className="relative h-20 bg-linear-to-br from-[#1d43d8]/20 to-brand-neon/10 overflow-hidden">
          {bannerSrc ? (
            <R2Image
              fileKey={bannerSrc}
              alt={`${org.name} banner`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="400px"
              fallbackClassName="w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-[#1d43d8]/10 to-brand-neon/5" />
          )}
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-linear-to-t from-gray-50 via-transparent to-transparent" />

          {/* Organization Type Badge - positioned in banner */}
          <div className="absolute top-2 right-2">
            {org.organizationType === 'PUBLIC' ? (
              <Badge className="bg-white/90 text-slate-700 shadow-sm border-0 gap-1 text-[10px]">
                <Globe className="w-2.5 h-2.5" />
                Public
              </Badge>
            ) : (
              <Badge className="bg-white/90 text-slate-700 shadow-sm border-0 gap-1 text-[10px]">
                <Lock className="w-2.5 h-2.5" />
                Private
              </Badge>
            )}
          </div>
        </div>

        {/* Logo + Header Row */}
        <div className="flex items-start gap-3 px-4 -mt-6">
          {/* Logo */}
          <div className="relative h-14 w-14 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
            <R2Image
              fileKey={logoSrc}
              alt={org.name}
              fill
              className="object-cover"
              sizes="56px"
              fallbackClassName="w-full h-full flex items-center justify-center bg-slate-50"
            />
          </div>

          {/* Title + Member count */}
          <div className="pt-7 min-w-0 flex-1 z-10">
            <h3 className="text-base font-semibold tracking-tight truncate">{org.name}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {org.memberCount.toLocaleString()} {org.memberCount === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        <CardContent className="pt-3 pb-4">
          {org.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{org.description}</p>}

          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1 text-xs rounded-full">
              <Link href={`/o/${org.slug}`}>View Store</Link>
            </Button>

            {org.organizationType === 'PUBLIC' && !isJoined && (
              <Button size="sm" className="flex-1 text-xs rounded-full bg-[#1d43d8] hover:bg-[#1d43d8]/90" onClick={onJoin}>
                <Heart className="w-3 h-3 mr-1" />
                Join
              </Button>
            )}

            {org.organizationType === 'PRIVATE' && !isJoined && (
              <Button size="sm" variant="secondary" className="flex-1 text-xs rounded-full" onClick={onRequestJoin}>
                Request to Join
              </Button>
            )}

            {isJoined && (
              <Badge variant="secondary" className="flex items-center gap-1 px-3 rounded-full">
                <Heart className="w-3 h-3 fill-current" />
                Joined
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Organizations Grid with search and filters
function OrganizationsGrid() {
  const { user } = useCurrentUser();
  const { openSignIn } = useClerk();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<OrgType>('ALL');
  const deferredSearch = useDeferredValue(searchTerm);

  const joinOrg = useMutation(api.organizations.mutations.index.joinPublicOrganization);
  const requestJoin = useMutation(api.organizations.mutations.index.requestToJoinOrganization);

  // Fetch organizations based on search
  const searchResults = useQuery(
    api.organizations.queries.index.searchPublicOrganizations,
    deferredSearch.length >= 2
      ? {
          searchTerm: deferredSearch,
          organizationType: typeFilter !== 'ALL' ? typeFilter : undefined,
          limit: 50,
        }
      : 'skip'
  );

  // Fetch popular organizations when not searching
  const popularOrgsResult = useQuery(api.organizations.queries.index.getPopularOrganizations, deferredSearch.length < 2 ? { limit: 50 } : 'skip');

  // Get user's joined organizations
  const userOrgs = useQuery(api.organizations.queries.index.getOrganizationsByUser, user?._id ? { userId: user._id } : 'skip');

  const userOrgIds = useMemo(() => new Set(userOrgs?.map((o) => String(o._id)) || []), [userOrgs]);

  // Determine which organizations to display
  const displayOrgs = useMemo(() => {
    if (deferredSearch.length >= 2 && searchResults) {
      // Filter by type if needed
      if (typeFilter !== 'ALL') {
        return searchResults.filter((org) => org.organizationType === typeFilter);
      }
      return searchResults;
    }

    // Show popular organizations
    if (popularOrgsResult?.organizations) {
      const orgs = popularOrgsResult.organizations;
      if (typeFilter !== 'ALL') {
        return orgs.filter((org) => org.organizationType === typeFilter);
      }
      return orgs;
    }

    return null;
  }, [deferredSearch, searchResults, popularOrgsResult, typeFilter]);

  const handleJoin = async (orgId: Id<'organizations'>, orgName: string) => {
    try {
      await joinOrg({ organizationId: orgId });
      toast.success(`Joined ${orgName}!`, {
        icon: <Heart className="w-4 h-4 text-[#1d43d8]" />,
      });
    } catch (error) {
      console.error('Join org failed:', error);
      toast.error('Failed to join organization');
    }
  };

  const handleRequestJoin = async (orgId: Id<'organizations'>, orgName: string) => {
    try {
      await requestJoin({ organizationId: orgId });
      toast.success(`Request sent to ${orgName}!`, {
        description: 'You will be notified when your request is reviewed.',
      });
    } catch (error: any) {
      console.error('Request join failed:', error);
      if (error.message?.includes('already')) {
        toast.info('Request already pending');
      } else {
        toast.error('Failed to send join request');
      }
    }
  };

  const isLoading = displayOrgs === null;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search organizations by name..."
          className="h-12 pl-11 pr-12 text-sm rounded-full border-slate-200 bg-white focus:border-[#1d43d8]/40 focus:ring-2 focus:ring-[#1d43d8]/10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Type Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TYPE_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isSelected = typeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setTypeFilter(filter.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
                isSelected ? 'bg-[#1d43d8] text-white shadow-md shadow-[#1d43d8]/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      {displayOrgs && displayOrgs.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {deferredSearch.length >= 2 ? (
            <>
              Found <span className="font-medium text-foreground">{displayOrgs.length}</span> organizations
            </>
          ) : (
            <>
              Showing <span className="font-medium text-foreground">{displayOrgs.length}</span> popular organizations
            </>
          )}
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-24 bg-slate-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="h-8 bg-slate-100 rounded-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayOrgs && displayOrgs.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 font-heading">{searchTerm ? 'No organizations found' : 'No organizations yet'}</h3>
          <p className="text-muted-foreground text-sm">
            {searchTerm ? `Try a different search term or adjust your filters` : 'Check back later for new organizations to discover'}
          </p>
        </motion.div>
      )}

      {/* Organizations Grid */}
      {!isLoading && displayOrgs && displayOrgs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {displayOrgs.map((org, index) => {
              const isJoined = userOrgIds.has(String(org.id));
              return (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <SignedIn>
                    <OrganizationCard
                      org={org}
                      isJoined={isJoined}
                      onJoin={() => handleJoin(org.id, org.name)}
                      onRequestJoin={() => handleRequestJoin(org.id, org.name)}
                    />
                  </SignedIn>
                  <SignedOut>
                    <OrganizationCard org={org} isJoined={false} onJoin={() => openSignIn()} onRequestJoin={() => openSignIn()} />
                  </SignedOut>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function OrgsPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Geometric Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-px h-32 bg-linear-to-b from-transparent via-[#1d43d8]/15 to-transparent" />
        <div className="absolute bottom-1/3 left-1/3 w-32 h-px bg-linear-to-r from-transparent via-brand-neon/20 to-transparent" />
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-slate-100"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Page Content */}
      <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#1d43d8]/10">
                <Building2 className="h-5 w-5 text-[#1d43d8]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-slate-900">Discover Organizations</h1>
                <p className="text-slate-500 text-sm">Find and join communities on Merchkins</p>
              </div>
            </div>

            <SignedOut>
              <SignInButton mode="modal">
                <Button className="rounded-full px-6 bg-[#1d43d8] hover:bg-[#1d43d8]/90 shadow-lg shadow-[#1d43d8]/20">
                  Sign in to Join
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </BlurFade>

        {/* Main Grid */}
        <BlurFade delay={0.2}>
          <OrganizationsGrid />
        </BlurFade>
      </div>
    </div>
  );
}
