'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { R2Image } from '@/src/components/ui/r2-image';
import { BlurFade } from '@/src/components/ui/animations/effects';
import { Users, Mail, Clock, XCircle, CheckCircle2, Building2, LogIn, Sparkles, ArrowLeft, Store } from 'lucide-react';
import { useCurrentUser } from '../../auth/hooks/use-current-user';

interface AcceptInvitePageProps {
  code: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export function AcceptInvitePage({ code }: AcceptInvitePageProps) {
  const router = useRouter();
  const { user } = useCurrentUser();

  const invite = useQuery(api.organizations.queries.index.getInviteLinkByCode, code ? { code } : 'skip');

  const currentUser = useQuery(api.users.queries.index.getCurrentUser, user ? { clerkId: user.clerkId } : 'skip');

  const userOrganizations = useQuery(
    api.organizations.queries.index.getOrganizationsByUser,
    currentUser ? { userId: currentUser._id, isActive: true } : 'skip'
  );

  const joinOrganization = useMutation(api.organizations.mutations.index.joinOrganization);

  const [submitting, setSubmitting] = useState(false);
  const loading = invite === undefined;

  const orgName = invite?.organizationInfo?.name || 'Organization';
  const orgSlug = invite?.organizationInfo?.slug;
  const logoKey = invite?.organizationInfo?.logo;
  const expiresAt = invite?.expiresAt;
  const organizationId = invite?.organizationId;

  // Check if user is already a member
  // Returns undefined when loading, true/false when loaded
  const isAlreadyMember = useMemo(() => {
    if (!organizationId) return undefined;
    if (userOrganizations === undefined) return undefined; // Still loading
    return userOrganizations.some((org) => org._id === organizationId);
  }, [organizationId, userOrganizations]);

  const expired = useMemo(() => {
    if (!expiresAt) return false;
    return expiresAt < Date.now();
  }, [expiresAt]);

  const expiresInDays = useMemo(() => {
    if (!expiresAt) return null;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 0;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  }, [expiresAt]);

  async function handleAccept() {
    if (!invite || !currentUser) return;
    try {
      setSubmitting(true);
      await joinOrganization({ inviteCode: code, userId: currentUser._id });
      if (orgSlug) {
        router.replace(`/o/${orgSlug}`);
      } else {
        router.replace('/organizations');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes('already a member')) {
        if (orgSlug) router.replace(`/o/${orgSlug}`);
        else router.replace('/organizations');
        return;
      }
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-10 h-10 mx-auto mb-3">
            <div className="absolute inset-0 rounded-full border-3 border-[#1d43d8]/20"></div>
            <div className="absolute inset-0 rounded-full border-3 border-t-[#1d43d8] animate-spin"></div>
          </div>
          <p className="text-slate-500 text-sm">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired invite
  if (!invite || expired) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-4 py-8">
          <BlurFade delay={0.1}>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </BlurFade>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
            <motion.div variants={itemVariants}>
              <div className="h-14 w-14 mx-auto mb-4 rounded-xl bg-red-50 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-500" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900 mb-2">
                {expired ? 'Invitation Expired' : 'Invalid Invitation'}
              </h1>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="text-sm text-slate-500 mb-6">
                {expired
                  ? 'This invitation has expired. Contact the admin for a new link.'
                  : 'This invitation link is not valid or has been deactivated.'}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="rounded-full">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Home
                </Button>
              </Link>
              <Link href="/organizations">
                <Button size="sm" className="rounded-full bg-[#1d43d8] hover:bg-[#1638b3]">
                  <Building2 className="h-3.5 w-3.5 mr-1.5" />
                  Organizations
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Valid invite - main view
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-8">
        <BlurFade delay={0.1}>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </BlurFade>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-5">
            <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-[#1d43d8]/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-[#1d43d8]" />
            </div>
            <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900 mb-1">You&apos;re Invited!</h1>
            <p className="text-sm text-slate-500">Join this organization on Merchkins</p>
          </motion.div>

          {/* Organization Card */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg border-2 border-white shadow-md bg-white flex items-center justify-center shrink-0">
                  {logoKey ? (
                    <R2Image fileKey={logoKey} alt={`${orgName} logo`} width={48} height={48} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-linear-to-br from-[#1d43d8] to-[#4f6edb] flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{orgName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-900 truncate">{orgName}</h2>
                  {orgSlug && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3" />
                      /o/{orgSlug}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-slate-500">
                  {expiresAt ? (
                    expiresInDays === 0 ? (
                      <span className="text-amber-600">Expires today</span>
                    ) : expiresInDays === 1 ? (
                      'Expires tomorrow'
                    ) : (
                      `${expiresInDays}d left`
                    )
                  ) : (
                    <span className="text-emerald-600">No expiry</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Section */}
          <motion.div variants={itemVariants}>
            {!user?.clerkId ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mb-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <LogIn className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Sign in required</h3>
                    <p className="text-xs text-slate-600 mb-3">Sign in or create an account to join.</p>
                    <Link href={`/sign-in?redirect_url=/invite/${code}`}>
                      <Button size="sm" className="w-full rounded-full bg-[#1d43d8] hover:bg-[#1638b3]">
                        <LogIn className="h-3.5 w-3.5 mr-1.5" />
                        Sign in to Continue
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : isAlreadyMember === undefined ? (
              <div className="space-y-3">
                {/* Loading state */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <div className="h-4 w-4 border-2 border-slate-300 border-t-[#1d43d8] rounded-full animate-spin" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">Checking membership...</h3>
                      <p className="text-xs text-slate-600">Please wait while we verify your status.</p>
                    </div>
                  </div>
                </div>
                <Button disabled className="w-full rounded-full h-10 bg-slate-200 text-slate-500 cursor-not-allowed">
                  <div className="h-3.5 w-3.5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin mr-1.5" />
                  Loading...
                </Button>
              </div>
            ) : isAlreadyMember ? (
              <div className="space-y-3">
                {/* Already a member status */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">Already a Member</h3>
                      <p className="text-xs text-slate-600 mb-3">You&apos;re already a member of this organization.</p>
                      {orgSlug ? (
                        <Link href={`/o/${orgSlug}`}>
                          <Button size="sm" className="w-full rounded-full bg-[#1d43d8] hover:bg-[#1638b3]">
                            <Store className="h-3.5 w-3.5 mr-1.5" />
                            View Store
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/organizations">
                          <Button size="sm" className="w-full rounded-full bg-[#1d43d8] hover:bg-[#1638b3]">
                            <Building2 className="h-3.5 w-3.5 mr-1.5" />
                            View Organizations
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Signed in status */}
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700">Signed in as {currentUser?.email || 'your account'}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleAccept}
                    disabled={submitting || !currentUser}
                    className="flex-1 rounded-full h-10 bg-[#1d43d8] hover:bg-[#1638b3] text-sm font-semibold"
                  >
                    {submitting ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        Accept & Join
                      </>
                    )}
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="rounded-full h-10 px-4">
                      Decline
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* Features Section */}
          <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">What you&apos;ll get access to</h3>
            <div className="space-y-3">
              {[
                { icon: Users, label: 'Connect with team members', desc: 'Collaborate with other organization members' },
                { icon: Building2, label: 'Organization storefront', desc: 'Browse and purchase exclusive products' },
                { icon: Clock, label: 'Real-time updates', desc: 'Stay informed about announcements and events' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-[#1d43d8]/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-4 w-4 text-[#1d43d8]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{feature.label}</div>
                    <div className="text-xs text-slate-500">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
