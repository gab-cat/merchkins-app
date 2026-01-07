'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, Send, Clock, Shield, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { R2Image } from '@/src/components/ui/r2-image';
import { RequestToJoinDialog } from '@/src/features/organizations/components/request-to-join-dialog';
import { buildR2PublicUrl } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';

interface StorefrontAccessGuardProps {
  organizationId: Id<'organizations'>;
  organizationName: string;
  organizationLogo?: string;
  organizationBanner?: string;
  organizationSlug: string;
  children: React.ReactNode;
}

export function StorefrontAccessGuard({
  organizationId,
  organizationName,
  organizationLogo,
  organizationBanner,
  organizationSlug,
  children,
}: StorefrontAccessGuardProps) {
  const { isSignedIn } = useAuth();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const accessCheck = useQuery(api.organizations.queries.index.checkStorefrontAccess, {
    organizationId,
  });

  // Loading state
  if (accessCheck === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  // Access granted - render children
  if (accessCheck.hasAccess) {
    return <>{children}</>;
  }

  // Access denied - show appropriate overlay based on org type
  const logoUrl = buildR2PublicUrl(organizationLogo || null);
  const bannerUrl = buildR2PublicUrl(organizationBanner || null);

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Banner */}
      <div className="relative h-40 md:h-56">
        {bannerUrl ? (
          <R2Image fileKey={organizationBanner} alt={organizationName} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-slate-100 via-slate-200 to-slate-100" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 -mt-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={accessCheck.organizationType} {...fadeInUp} className="flex flex-col items-center text-center max-w-md">
            {/* Avatar */}
            <div className="mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                  <AvatarImage src={logoUrl || '/favicon.ico'} className="object-cover" />
                  <AvatarFallback className="bg-linear-to-br from-amber-100 to-orange-100 text-amber-700 text-2xl font-bold">
                    {organizationName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white shadow-md">
                  {accessCheck.organizationType === 'SECRET' ? (
                    <Shield className="h-5 w-5 text-slate-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-amber-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Organization Name */}
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{organizationName}</h1>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-6">
              {accessCheck.organizationType === 'SECRET' ? (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  Invite Only
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Private Organization
                </>
              )}
            </div>

            {/* Message based on type and auth state */}
            {accessCheck.organizationType === 'SECRET' ? (
              <div className="space-y-4">
                <p className="text-slate-500">This organization is invite-only. You need an invitation link to join.</p>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Shield className="h-5 w-5 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-600">Contact an organization member to request an invite.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!isSignedIn ? (
                  <>
                    <p className="text-slate-500">Sign in to request access to this private organization.</p>
                    <SignInButton mode="modal" fallbackRedirectUrl={`/o/${organizationSlug}`}>
                      <Button size="lg" className="gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In to Continue
                      </Button>
                    </SignInButton>
                  </>
                ) : accessCheck.hasPendingRequest ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-lg border border-amber-200">
                      <Clock className="h-5 w-5 text-amber-600 shrink-0 animate-pulse" />
                      <span className="text-sm text-amber-800">Your request to join is pending review.</span>
                    </div>
                    <p className="text-sm text-slate-500">An admin will review your request and you'll be notified once approved.</p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-500">This organization requires approval to join. Send a request to get access.</p>
                    <Button size="lg" onClick={() => setRequestDialogOpen(true)} className="gap-2">
                      <Send className="h-4 w-4" />
                      Request to Join
                    </Button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Request to Join Dialog (PRIVATE only) */}
      {accessCheck.organizationType === 'PRIVATE' && (
        <RequestToJoinDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          organizationId={organizationId}
          organizationName={organizationName}
          organizationLogoUrl={organizationLogo}
          organizationBannerUrl={organizationBanner}
          organizationSlug={organizationSlug}
        />
      )}
    </div>
  );
}
