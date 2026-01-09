'use client';

import React, { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { Id } from '@/convex/_generated/dataModel';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  Ticket,
  ArrowLeft,
  Send,
  AlertCircle,
  Building2,
  Loader2,
  CheckCircle,
  Clock,
  Bug,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  MoreHorizontal,
  Package,
} from 'lucide-react';

type TicketCategory = 'BUG' | 'FEATURE_REQUEST' | 'SUPPORT' | 'QUESTION' | 'OTHER';

const CATEGORY_CONFIG: Record<
  TicketCategory,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }
> = {
  SUPPORT: {
    label: 'Support',
    description: 'General help or assistance',
    icon: MessageSquare,
    color: 'text-blue-600',
  },
  BUG: {
    label: 'Bug Report',
    description: "Something isn't working correctly",
    icon: Bug,
    color: 'text-red-600',
  },
  QUESTION: {
    label: 'Question',
    description: 'Ask us anything',
    icon: HelpCircle,
    color: 'text-violet-600',
  },
  FEATURE_REQUEST: {
    label: 'Feature Request',
    description: 'Suggest an improvement',
    icon: Lightbulb,
    color: 'text-amber-600',
  },
  OTHER: {
    label: 'Other',
    description: 'Something else',
    icon: MoreHorizontal,
    color: 'text-slate-600',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function NewTicketForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createTicket = useMutation(api.tickets.mutations.index.createTicket);

  // Extract org slug from pathname
  const orgSlug = useMemo(() => {
    if (!pathname) return undefined;
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'o' && segments[1]) return segments[1];
    return undefined;
  }, [pathname]);

  // Check for orderId in URL params (for order-linked tickets)
  const orderIdParam = searchParams.get('orderId');

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('SUPPORT');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation
  const titleError = title.length > 0 && title.trim().length < 3 ? 'Title must be at least 3 characters' : null;
  const descriptionError = description.length > 0 && description.trim().length < 10 ? 'Please provide more details (at least 10 characters)' : null;
  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10 && !submitting;

  const backUrl = orgSlug ? `/o/${orgSlug}/tickets` : '/tickets';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        organizationId: organization?._id,
        orderId: orderIdParam ? (orderIdParam as Id<'orders'>) : undefined,
      });

      setSuccess(true);
      showToast({ type: 'success', title: 'Ticket submitted!' });

      // Redirect after brief delay to show success state
      setTimeout(() => {
        router.push(backUrl);
      }, 1200);
    } catch {
      showToast({ type: 'error', title: 'Failed to create ticket' });
      setSubmitting(false);
    }
  }

  // Success state
  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5"
          >
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </motion.div>
          <h2 className="text-xl font-semibold mb-1.5">Ticket Submitted</h2>
          <p className="text-muted-foreground text-sm mb-4">We&apos;ll get back to you soon.</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Redirecting...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-6">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-2 h-8">
            <Link href={backUrl}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back
            </Link>
          </Button>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Ticket className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">New Support Request</h1>
              {organization?.name ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3 w-3" />
                  {organization.name}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">We&apos;re here to help</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Order Link Indicator */}
        {orderIdParam && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-sm">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">This ticket will be linked to your order</span>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200">
            <CardContent className="pt-5 pb-4">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Category */}
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
                    What&apos;s this about?
                  </Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(CATEGORY_CONFIG) as [TicketCategory, (typeof CATEGORY_CONFIG)[TicketCategory]][]).map(([value, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Icon className={cn('h-3.5 w-3.5', config.color)} />
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your issue"
                    className={cn('h-9', titleError && 'border-destructive focus-visible:ring-destructive')}
                  />
                  {titleError && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {titleError}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    className={cn('min-h-[120px] resize-none text-sm', descriptionError && 'border-destructive focus-visible:ring-destructive')}
                  />
                  <div className="flex items-center justify-between">
                    {descriptionError ? (
                      <p className="text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {descriptionError}
                      </p>
                    ) : (
                      <span />
                    )}
                    <p className="text-[11px] text-muted-foreground">{description.length} chars</p>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Typically 24hr response
                  </p>
                  <Button type="submit" size="sm" disabled={!canSubmit} className="h-8 px-4">
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div variants={itemVariants}>
          <div className="px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-600 mb-1.5">Tips for faster resolution</p>
            <ul className="text-[11px] text-slate-500 space-y-0.5">
              <li>• Be specific about what you were trying to do</li>
              <li>• Include any error messages you saw</li>
              <li>• Mention steps to reproduce the issue</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
