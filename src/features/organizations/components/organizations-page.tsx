'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { R2Image } from '@/src/components/ui/r2-image';
import { BlurFade } from '@/src/components/ui/animations/effects';
import { UserPlus, ShoppingBag, Users, Building2, Search, ArrowRight, Sparkles, Globe, Lock, Mail, ExternalLink, Settings } from 'lucide-react';

type Organization = Doc<'organizations'>;

interface OrganizationsPageProps {
  clerkId: string;
}

export function OrganizationsPage({ clerkId }: OrganizationsPageProps) {
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, { clerkId });
  const orgs = useQuery(
    api.organizations.queries.index.getOrganizationsByUser,
    currentUser?._id ? { userId: currentUser._id } : ('skip' as unknown as { userId: Id<'users'> })
  );
  const loading = currentUser === undefined || orgs === undefined;

  // Explore: search public/private organizations
  const [search, setSearch] = useState('');
  const [orgType, setOrgType] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');
  const searchResult = useQuery(
    api.organizations.queries.index.searchOrganizations,
    search.trim().length >= 2
      ? {
          searchTerm: search.trim(),
          limit: 24,
          ...(orgType !== 'ALL' ? { organizationType: orgType } : {}),
        }
      : ('skip' as unknown as { searchTerm: string })
  );
  const joinPublic = useMutation(api.organizations.mutations.index.joinPublicOrganization);
  const requestJoin = useMutation(api.organizations.mutations.index.requestToJoinOrganization);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 py-8 relative z-10">
          <div className="mb-8">
            <div className="h-10 w-64 rounded-lg bg-secondary animate-pulse mb-2" />
            <div className="h-5 w-48 rounded-lg bg-secondary animate-pulse" />
          </div>
          <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                {new Array(3).fill(null).map((_, i) => (
                  <div key={`skeleton-${i}`} className="h-20 w-full rounded-2xl bg-secondary animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Building2 className="h-12 w-12 text-primary/40" />
            </div>
            <h1 className="text-2xl font-bold mb-3 font-heading">Sign in required</h1>
            <p className="text-muted-foreground">Please sign in to view organizations.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight">My Organizations</h1>
            </div>
            <p className="text-muted-foreground">Manage your memberships and discover new organizations</p>
          </div>
        </BlurFade>

        <div className="space-y-8">
          {/* My Organizations Card */}
          <BlurFade delay={0.2}>
            <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
              <div className="relative p-5 bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white shadow-sm">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-lg font-heading">Your Memberships</span>
                  {orgs && orgs.length > 0 && (
                    <Badge className="ml-auto bg-primary/10 text-primary border-0 rounded-full px-3">
                      {orgs.length} org{orgs.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-5">
                {orgs && orgs.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {orgs.map((org, index) => {
                        const role = org.membershipInfo?.role as 'ADMIN' | 'STAFF' | 'MEMBER' | undefined;
                        const elevated = role === 'ADMIN' || role === 'STAFF';
                        return (
                          <motion.div
                            key={org._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-muted/50 hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 group"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="h-14 w-14 overflow-hidden rounded-xl border-2 border-white shadow-md bg-secondary flex-shrink-0">
                                {org.logo ? (
                                  <R2Image
                                    fileKey={org.logo}
                                    alt={`${org.name || 'Organization'} logo`}
                                    width={56}
                                    height={56}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-lg font-bold">
                                    {org.name?.charAt(0) || 'O'}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="font-bold text-base truncate">{org.name}</div>
                                  {role && (
                                    <Badge
                                      className={`text-[10px] font-semibold rounded-full px-2.5 py-0.5 ${
                                        role === 'ADMIN'
                                          ? 'bg-primary text-white'
                                          : role === 'STAFF'
                                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                                            : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {role}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">/{org.slug}</div>
                                {org.description && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground max-w-prose">{org.description}</p>}
                              </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                              <Link href={`/o/${org.slug}`}>
                                <Button className="group/btn rounded-xl h-10 px-4 font-semibold shadow-sm hover:shadow-md transition-all duration-300">
                                  <ShoppingBag className="h-4 w-4 mr-2" />
                                  Open Store
                                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Button>
                              </Link>
                              {elevated && (
                                <Link href={`/admin/org-settings?org=${org.slug}`}>
                                  <Button
                                    variant="outline"
                                    className="rounded-xl h-10 px-4 font-semibold border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                                  >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Manage
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">You are not a member of any organizations yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">Search below to discover organizations!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </BlurFade>

          {/* Explore Organizations Card */}
          <BlurFade delay={0.3}>
            <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
              <div className="relative p-5 bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white shadow-sm">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-lg font-heading">Explore Organizations</span>
                </div>
              </div>
              <CardContent className="p-5">
                <form className="mb-6 flex flex-wrap items-center gap-3" onSubmit={(e) => e.preventDefault()}>
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search organizations..."
                      aria-label="Search organizations"
                      className="pl-11 h-12 rounded-xl border-muted focus:border-primary text-base"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {['ALL', 'PUBLIC', 'PRIVATE'].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={orgType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOrgType(type as 'ALL' | 'PUBLIC' | 'PRIVATE')}
                        className={`h-10 px-4 rounded-full font-medium transition-all duration-300 ${
                          orgType === type ? 'shadow-md' : 'hover:bg-primary/5 hover:border-primary/30'
                        }`}
                      >
                        {type === 'ALL' ? (
                          <Building2 className="h-4 w-4 mr-2" />
                        ) : type === 'PUBLIC' ? (
                          <Globe className="h-4 w-4 mr-2" />
                        ) : (
                          <Lock className="h-4 w-4 mr-2" />
                        )}
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </Button>
                    ))}
                  </div>
                </form>

                {search.trim().length < 2 ? (
                  <div className="py-8 text-center">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Search className="h-8 w-8 text-primary/40" />
                    </div>
                    <p className="text-muted-foreground">Enter at least 2 characters to search</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence mode="wait">
                      {(searchResult ?? []).map((org: Organization, index) => (
                        <motion.div
                          key={org._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-2xl border border-muted/50 bg-card p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-base truncate group-hover:text-primary transition-colors">{org.name}</div>
                              <div className="text-sm text-muted-foreground truncate">/{org.slug}</div>
                            </div>
                            <Badge
                              className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                org.organizationType === 'PUBLIC'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-amber-100 text-amber-700 border-amber-200'
                              }`}
                            >
                              {org.organizationType === 'PUBLIC' ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                              {org.organizationType}
                            </Badge>
                          </div>

                          {/* Stats section */}
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50">
                              <Users className="h-3.5 w-3.5 text-primary" />
                              <span className="font-semibold">{org.memberCount}</span>
                              <span>members</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50">
                              <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                              <span className="font-semibold">{org.totalOrderCount}</span>
                              <span>orders</span>
                            </div>
                          </div>

                          <div className="mt-3 line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem]">
                            {org.description || 'No description available'}
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {org.industry && (
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full">
                                  {org.industry}
                                </Badge>
                              )}
                              {org.size && (
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full">
                                  {org.size}
                                </Badge>
                              )}
                            </div>
                            {org.organizationType === 'PUBLIC' ? (
                              <Button
                                size="sm"
                                className="group/btn rounded-xl h-9 px-4 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                                onClick={async () => {
                                  await joinPublic({ organizationId: org._id });
                                }}
                              >
                                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                Join
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl h-9 px-4 font-semibold border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                                onClick={async () => {
                                  await requestJoin({ organizationId: org._id });
                                }}
                              >
                                Request
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {Array.isArray(searchResult) && searchResult.length === 0 && (
                      <div className="col-span-full py-8 text-center">
                        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <Search className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground">No organizations found matching your search.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </BlurFade>

          {/* CTA Card */}
          <BlurFade delay={0.4}>
            <Card className="rounded-3xl border-0 shadow-xl overflow-hidden" data-testid="orgs-cta">
              <div className="relative p-8 md:p-12 bg-gradient-to-br from-primary via-primary/95 to-primary/90">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="relative z-10 text-center text-white">
                  <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-heading">Want your own organization?</h2>
                  <p className="mt-3 text-white/80 text-lg max-w-md mx-auto">
                    We can help set up a branded store for your organization with custom features.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="group mt-6 bg-white text-primary hover:bg-white/90 rounded-full px-8 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <a href="mailto:business@merchkins.com">
                      <Mail className="mr-2 h-5 w-5" />
                      Contact Us
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
