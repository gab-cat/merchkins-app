'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Users, Clock, MessageSquare, ExternalLink, CheckCircle2 } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { R2Image } from '@/src/components/ui/r2-image';

import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

import { showToast } from '@/lib/toast';
import { fadeInUp } from '@/lib/animations';
import { Id } from '@/convex/_generated/dataModel';
import { buildR2PublicUrl } from '@/lib/utils';

interface RequestToJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  organizationLogoUrl?: string;
  organizationBannerUrl?: string;
  organizationSlug?: string;
  onRequested?: () => void;
}

export const RequestToJoinDialog: React.FC<RequestToJoinDialogProps> = ({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  organizationLogoUrl,
  organizationBannerUrl,
  organizationSlug,
  onRequested,
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestToJoin = useMutation(api.organizations.mutations.index.requestToJoinOrganization);
  const requestStatus = useQuery(api.organizations.queries.index.getMyJoinRequestStatus, { organizationId: organizationId as Id<'organizations'> });

  const finalLogoUrl = buildR2PublicUrl(organizationLogoUrl || null);
  const finalBannerUrl = buildR2PublicUrl(organizationBannerUrl || null);

  const hasPendingRequest = requestStatus?.hasRequest && requestStatus.status === 'PENDING';

  const handleRequest = async () => {
    if (hasPendingRequest) return;

    setIsSubmitting(true);
    try {
      await requestToJoin({
        organizationId: organizationId as Id<'organizations'>,
        note: note.trim() || undefined,
      });
      showToast({
        type: 'success',
        title: 'Request Sent!',
        description: `Your request to join ${organizationName} has been submitted. You'll be notified when it's reviewed.`,
      });
      onOpenChange(false);
      onRequested?.();
    } catch (error: any) {
      console.error('Failed to request to join organization:', error);
      showToast({
        type: 'error',
        title: 'Request Failed',
        description: error.message || 'Could not send your request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white text-black border-none">
        <DialogHeader className="space-y-0 pb-4">
          <div className="relative -mx-6 -mt-6 mb-4">
            {organizationBannerUrl && finalBannerUrl ? (
              <div className="aspect-[4/1] rounded-t-lg overflow-hidden">
                <R2Image fileKey={organizationBannerUrl || undefined} alt={`${organizationName} banner`} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ) : (
              <div className="aspect-[4/1] bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg" />
            )}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <motion.div {...fadeInUp} className="flex size-22 items-center justify-center rounded-full bg-white border-4 border-white shadow-lg">
                <Avatar className="size-20">
                  <AvatarImage className="object-cover" src={finalLogoUrl || '/favicon.ico'} alt={organizationName} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 text-lg">
                    {organizationName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
          </div>

          <div className="text-center pt-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Lock className="size-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Private Organization</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-primary">Request to Join</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">{organizationName} requires approval to join</DialogDescription>
          </div>
        </DialogHeader>

        {hasPendingRequest ? (
          <motion.div {...fadeInUp} className="py-6 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-amber-100 mb-4">
              <Clock className="size-8 text-amber-600" />
            </div>
            <h3 className="font-semibold text-lg">Request Pending</h3>
            <p className="text-sm text-muted-foreground mt-1">Your request is awaiting review. You'll be notified when an admin responds.</p>
          </motion.div>
        ) : (
          <>
            <motion.div {...fadeInUp} className="space-y-4 py-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="size-4 text-amber-600 flex-shrink-0" />
                  <span>Join an exclusive community</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                  <span>Access members-only products and content</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <MessageSquare className="size-3.5 inline mr-1.5" />
                  Message (optional)
                </label>
                <Textarea
                  placeholder="Tell them why you'd like to join..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{note.length}/500 characters</p>
              </div>
            </motion.div>

            {organizationSlug && (
              <div className="flex justify-center">
                <Button variant="link" size="sm" asChild>
                  <Link href={`/(storefront)/o/${organizationSlug}`} className="flex items-center gap-1 text-xs" onClick={() => onOpenChange(false)}>
                    Learn more about {organizationName}
                    <ExternalLink className="size-3" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            {hasPendingRequest ? 'Close' : 'Maybe later'}
          </Button>
          {!hasPendingRequest && (
            <Button onClick={handleRequest} disabled={isSubmitting} className="flex-1 bg-amber-600 text-white hover:bg-amber-700">
              <Lock className="mr-2 size-4" />
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
