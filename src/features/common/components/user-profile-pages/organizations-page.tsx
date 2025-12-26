'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth, useClerk } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { R2Image } from '@/src/components/ui/r2-image';
import { BlurFade } from '@/src/components/ui/animations/effects';
import { RoleBadge, OrgTypeBadge } from '@/src/components/ui/role-badge';
import { Building2, ShoppingBag, Settings, ArrowRight, Users, ExternalLink, ChevronRight, Search, Home } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 120, damping: 18 },
  },
};

export function OrganizationsPage() {
  const { userId: clerkId } = useAuth();
  const { closeUserProfile } = useClerk();

  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : ('skip' as unknown as { clerkId: string }));

  const orgs = useQuery(api.organizations.queries.index.getOrganizationsByUser, currentUser?._id ? { userId: currentUser._id } : 'skip');

  const loading = currentUser === undefined || orgs === undefined;

  // Add error handling for when clerkId is not available
  if (!clerkId) {
    return (
      <div className="flex items-center justify-center py-12">
        <BlurFade delay={0.1}>
          <div className="text-center max-w-sm mx-auto px-4">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 font-heading text-slate-900">Sign in required</h3>
            <p className="text-slate-500 text-sm">Please sign in to view your organizations</p>
          </div>
        </BlurFade>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-2 py-4 space-y-3">
        {/* Header skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
          <div>
            <div className="h-5 w-40 rounded bg-slate-100 animate-pulse mb-1" />
            <div className="h-3 w-56 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        {/* List skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-100 p-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-slate-100 mb-1.5" />
                <div className="h-3 w-20 rounded bg-slate-100" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle case where currentUser is null (user not found in database)
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <BlurFade delay={0.1}>
          <div className="text-center max-w-sm mx-auto px-4">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 font-heading text-slate-900">User not found</h3>
            <p className="text-slate-500 text-sm mb-4">Unable to load your profile information</p>
            <Button asChild className="rounded-xl bg-[#1d43d8] hover:bg-[#1d43d8]/90">
              <Link href="/organizations">
                <Search className="h-4 w-4 mr-2" />
                Browse Organizations
              </Link>
            </Button>
          </div>
        </BlurFade>
      </div>
    );
  }

  if (!orgs || orgs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <BlurFade delay={0.1}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-sm mx-auto px-4"
          >
            <div className="h-20 w-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#1d43d8]/10 to-[#adfc04]/10 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-[#1d43d8]/50" />
            </div>
            <h3 className="text-lg font-bold mb-2 font-heading text-slate-900">No organizations yet</h3>
            <p className="text-slate-500 text-sm mb-6">Join or discover organizations to get started</p>
            <Button asChild className="rounded-full bg-[#1d43d8] hover:bg-[#1d43d8]/90 px-6 h-10 font-semibold shadow-lg shadow-[#1d43d8]/25">
              <Link href="/organizations">
                <Search className="h-4 w-4 mr-2" />
                Browse Organizations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </BlurFade>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto px-2 py-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header - compact for modal */}
          <BlurFade delay={0.1}>
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#1d43d8]/10">
                  <Building2 className="h-4 w-4 text-[#1d43d8]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-heading tracking-tight text-slate-900">Your Organizations</h2>
                  <p className="text-slate-500 text-xs">Access your stores and manage memberships</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {orgs.length} org{orgs.length !== 1 ? 's' : ''}
              </span>
            </motion.div>
          </BlurFade>

          {/* Organizations List */}
          <BlurFade delay={0.15}>
            <div className="space-y-2">
              <AnimatePresence mode="wait">
                {orgs.slice(0, 6).map((org, index) => {
                  const role = org.membershipInfo?.role as 'ADMIN' | 'STAFF' | 'MEMBER' | undefined;
                  const elevated = role === 'ADMIN' || role === 'STAFF';
                  return (
                    <motion.div
                      key={org._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md transition-all duration-200 group overflow-hidden"
                    >
                      <div className="p-3">
                        <div className="flex items-center gap-3">
                          {/* Org Logo */}
                          <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 flex-shrink-0">
                            {org.logo ? (
                              <R2Image
                                fileKey={org.logo}
                                alt={`${org.name || 'Organization'} logo`}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1d43d8]/20 to-[#1d43d8]/5 text-[#1d43d8] text-sm font-bold">
                                {org.name?.charAt(0) || 'O'}
                              </div>
                            )}
                          </div>

                          {/* Org Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-semibold text-sm text-slate-900 truncate group-hover:text-[#1d43d8] transition-colors">
                                {org.name}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {role && <RoleBadge role={role} size="sm" />}
                              <OrgTypeBadge type={org.organizationType as 'PUBLIC' | 'PRIVATE'} size="sm" />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {org.slug && (
                              <>
                                <Button
                                  asChild
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 rounded-lg text-xs font-medium hover:bg-slate-100 transition-all"
                                  onClick={() => {
                                    closeUserProfile();
                                  }}
                                >
                                  <Link href="/">
                                    <Home className="h-3 w-3" />
                                  </Link>
                                </Button>
                                <Button
                                  asChild
                                  size="sm"
                                  className="h-8 px-3 rounded-lg text-xs font-medium bg-[#1d43d8] hover:bg-[#1d43d8]/90 shadow-sm hover:shadow-md transition-all"
                                  onClick={() => {
                                    closeUserProfile();
                                  }}
                                >
                                  <Link href={`/o/${org.slug}`}>
                                    <ShoppingBag className="h-3 w-3 mr-1.5" />
                                    Store
                                  </Link>
                                </Button>
                                {elevated && (
                                  <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 rounded-lg text-xs font-medium border-slate-200 hover:border-[#1d43d8]/50 hover:bg-[#1d43d8]/5 transition-all"
                                    onClick={() => {
                                      closeUserProfile();
                                    }}
                                  >
                                    <Link href={`/admin?org=${org.slug}`}>
                                      <Settings className="h-3 w-3 mr-1.5" />
                                      Admin
                                    </Link>
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </BlurFade>

          {/* View all link if more than 6 orgs */}
          {orgs.length > 6 && (
            <BlurFade delay={0.25}>
              <motion.div variants={itemVariants} className="mt-4 text-center">
                <Link
                  href="/organizations"
                  className="inline-flex items-center gap-1.5 text-sm text-[#1d43d8] hover:text-[#1d43d8]/80 font-medium transition-colors"
                >
                  View all {orgs.length} organizations
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            </BlurFade>
          )}

          {/* Browse more CTA */}
          <BlurFade delay={0.3}>
            <motion.div
              variants={itemVariants}
              className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-100"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    <Users className="h-4 w-4 text-[#1d43d8]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Discover more</p>
                    <p className="text-xs text-slate-500">Find and join new organizations</p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 rounded-lg text-xs font-medium border-slate-200 hover:border-[#1d43d8]/50 hover:bg-[#1d43d8]/5"
                >
                  <Link href="/organizations">
                    Browse
                    <ArrowRight className="h-3 w-3 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </BlurFade>
        </motion.div>
      </div>
    </div>
  );
}
