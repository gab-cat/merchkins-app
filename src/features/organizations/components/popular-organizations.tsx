'use client';

import React from 'react';
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
import { Users, ShoppingBag, UserPlus } from 'lucide-react';
import { fadeInUpContainer, fadeInUp } from '@/lib/animations';

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

export function PopularOrganizations({ limit = 8, preloadedOrganizations }: PopularOrganizationsProps) {
  const result = preloadedOrganizations
    ? usePreloadedQuery(preloadedOrganizations)
    : useQuery(api.organizations.queries.index.getPopularOrganizations, { limit });
  const joinPublic = useMutation(api.organizations.mutations.index.joinPublicOrganization);
  const requestJoin = useMutation(api.organizations.mutations.index.requestToJoinOrganization);

  const loading = result === undefined;
  const organizations = (result?.organizations ?? []) as unknown as PopularOrg[];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-primary tracking-tight">Popular organizations</h2>
        <Link
          className="text-sm text-primary hover:text-primary/80 font-semibold hover:underline transition-all duration-200 whitespace-nowrap"
          href="/organizations"
        >
          View all →
        </Link>
      </div>
      <motion.div
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        data-testid="popular-organizations-grid"
        variants={fadeInUpContainer}
        initial="initial"
        animate="animate"
      >
        {loading
          ? new Array(limit).fill(null).map((_, i) => (
              <Card key={`skeleton-org-${i}`} className="overflow-hidden rounded-xl border bg-card shadow-sm animate-pulse">
                <div className="relative h-24 w-full bg-secondary skeleton" />
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-secondary" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-20 rounded bg-secondary" />
                      <div className="h-2.5 w-16 rounded bg-secondary" />
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded bg-secondary" />
                  <div className="h-6 w-16 rounded bg-secondary" />
                </div>
              </Card>
            ))
          : organizations.map((org, index) => {
              return (
                <motion.div key={org.id} variants={fadeInUp}>
                  <Link href={`/o/${org.slug}`} aria-label={`View ${org.name}`} className="group block h-full">
                    <Card className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30">
                      {/* Banner with overlaying logo */}
                      <div className="relative h-24 w-full overflow-hidden">
                        {org.bannerImageUrl ? (
                          <Image
                            src={org.bannerImageUrl as string}
                            alt={`${org.name} banner`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : org.bannerImage ? (
                          isKey(org.bannerImage) ? (
                            <R2Image
                              fileKey={org.bannerImage as string}
                              alt={`${org.name} banner`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <Image
                              src={org.bannerImage as string}
                              alt={`${org.name} banner`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          )
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                        {/* Logo overlaying banner */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-2 z-10">
                          <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white shadow-lg bg-background flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                            {org.logoUrl ? (
                              <Image
                                src={org.logoUrl as string}
                                alt={`${org.name} logo`}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : org.logo ? (
                              isKey(org.logo) ? (
                                <R2Image
                                  fileKey={org.logo as string}
                                  alt={`${org.name} logo`}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Image
                                  src={org.logo as string}
                                  alt={`${org.name} logo`}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              )
                            ) : (
                              <div className="h-full w-full bg-primary flex items-center justify-center text-primary-foreground text-base font-bold">
                                {org.name?.charAt(0) || 'O'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="truncate text-base font-bold text-white drop-shadow-lg group-hover:text-white/90 transition-colors">
                              {org.name}
                            </CardTitle>
                            <div className="mt-0.5 text-xs font-medium text-white/90 drop-shadow-lg">@{org.slug}</div>
                          </div>
                        </div>
                      </div>

                      <CardContent className="flex flex-col flex-1 p-3 pt-0 space-y-2">
                        {/* Industry/Category */}
                        <div className="flex items-center gap-2 -mt-2">
                          {org.industry ? (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                              {org.industry}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                              Community
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        {org.description && <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed flex-1">{org.description}</p>}

                        {/* Action Button */}
                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span className="font-medium">{org.memberCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" />
                              <span className="font-medium">{org.totalOrderCount}</span>
                            </div>
                          </div>
                          {!org.isMember &&
                            (org.organizationType === 'PUBLIC' ? (
                              <Button
                                size="sm"
                                data-testid={`join-org-${org.id}`}
                                aria-label={`Join ${org.name}`}
                                className="h-7 px-2.5 text-xs hover:scale-105 transition-all duration-200 gap-1.5"
                                onClick={(e) => handleJoin(e, org.id, org.organizationType)}
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                                Join
                              </Button>
                            ) : org.organizationType === 'PRIVATE' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`request-org-${org.id}`}
                                aria-label={`Request to join ${org.name}`}
                                className="h-7 px-2.5 text-xs hover:scale-105 transition-all duration-200"
                                onClick={(e) => handleJoin(e, org.id, org.organizationType)}
                              >
                                Request
                              </Button>
                            ) : (
                              <Button size="sm" variant="secondary" disabled title="Invite only" className="h-7 px-2.5 text-xs">
                                Invite only
                              </Button>
                            ))}
                          {org.isMember && (
                            <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs hover:scale-105 transition-all duration-200" disabled>
                              Member
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
      </motion.div>
      {!loading && organizations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No organizations to show.</p>
        </div>
      )}
    </div>
  );
}
