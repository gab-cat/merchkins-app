'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Users, Sparkles, ExternalLink } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { R2Image } from '@/src/components/ui/r2-image';

import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

import { showToast } from '@/lib/toast';
import { fadeInUp } from '@/lib/animations';
import { Id } from '@/convex/_generated/dataModel';
import { buildR2PublicUrl } from '@/lib/utils';

interface JoinOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  organizationLogoUrl?: string;
  organizationBannerUrl?: string;
  organizationSlug?: string;
  onJoined?: () => void;
}

export const JoinOrganizationDialog: React.FC<JoinOrganizationDialogProps> = ({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  organizationLogoUrl,
  organizationBannerUrl,
  organizationSlug,
  onJoined,
}) => {
  const joinOrganization = useMutation(api.organizations.mutations.index.joinPublicOrganization);

  // Helper function to check if value is a file key (not a URL)
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');

  // Use public URL builder for logo and banner
  const finalLogoUrl = buildR2PublicUrl(organizationLogoUrl || null);
  const finalBannerUrl = buildR2PublicUrl(organizationBannerUrl || null);

  const handleJoin = async () => {
    try {
      await joinOrganization({ organizationId: organizationId as Id<'organizations'> });
      showToast({
        type: 'success',
        title: `Welcome to ${organizationName}!`,
        description: 'You can now shop their amazing products.',
      });
      onOpenChange(false);
      onJoined?.();
    } catch (error: any) {
      console.error('Failed to join organization:', error);
      showToast({
        type: 'error',
        title: 'Oops! Something went wrong',
        description: error.message || 'Could not join the organization. Please try again.',
      });
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
              <div className="aspect-[4/1] bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-lg" />
            )}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <motion.div {...fadeInUp} className="flex size-22 items-center justify-center rounded-full bg-white border-4 border-white shadow-lg">
                <Avatar className="size-20">
                  <AvatarImage className="object-cover" src={finalLogoUrl || '/favicon.ico'} alt={organizationName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 text-lg">
                    {organizationName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
          </div>

          <div className="text-center pt-2">
            <DialogTitle className="text-2xl font-bold text-primary">Join {organizationName}</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">Become part of this amazing community!</DialogDescription>
          </div>
        </DialogHeader>

        <motion.div {...fadeInUp} className="space-y-2 py-2 mx-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Heart className="size-4 text-red-500 flex-shrink-0" />
              <span>Get exclusive access to amazing products</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Users className="size-4 text-green-600 flex-shrink-0" />
              <span>Join the community of fellow fans</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="size-4 text-orange-500 flex-shrink-0" />
              <span>Support creativity and help bring ideas to life</span>
            </div>
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

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Maybe later
          </Button>
          <Button onClick={handleJoin} className="flex-1 bg-primary text-white hover:bg-primary/90">
            <Heart className="mr-2 size-4" />
            Join & Shop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
