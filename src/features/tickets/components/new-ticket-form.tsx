'use client';

import React, { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import { Ticket, ArrowLeft, Send, AlertCircle, Flag, FileText, Building2, Loader2, CheckCircle, Sparkles } from 'lucide-react';

type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

const PRIORITY_CONFIG: Record<
  TicketPriority,
  {
    label: string;
    description: string;
    color: string;
    dotColor: string;
    bgColor: string;
  }
> = {
  LOW: {
    label: 'Low',
    description: 'General questions or minor issues',
    color: 'text-slate-600',
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-950/30',
  },
  MEDIUM: {
    label: 'Medium',
    description: 'Important issues affecting your experience',
    color: 'text-amber-600',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950/30',
  },
  HIGH: {
    label: 'High',
    description: 'Critical issues requiring immediate attention',
    color: 'text-red-600',
    dotColor: 'bg-red-500',
    bgColor: 'bg-red-100 dark:bg-red-950/30',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function NewTicketForm() {
  const router = useRouter();
  const createTicket = useMutation(api.tickets.mutations.index.createTicket);
  const pathname = usePathname();

  // Extract org slug from pathname
  const orgSlug = useMemo(() => {
    if (!pathname) return undefined;
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'o' && segments[1]) return segments[1];
    return undefined;
  }, [pathname]);

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
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
        priority,
        organizationId: organization?._id,
      });

      setSuccess(true);
      showToast({ type: 'success', title: 'Ticket created successfully!' });

      // Redirect after brief delay to show success state
      setTimeout(() => {
        router.push(backUrl);
      }, 1500);
    } catch {
      showToast({ type: 'error', title: 'Failed to create ticket' });
      setSubmitting(false);
    }
  }

  // Success state
  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center text-center py-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-6"
          >
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-semibold mb-2">Ticket Submitted!</h2>
          <p className="text-muted-foreground mb-6">We&apos;ll get back to you as soon as possible.</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-2">
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Link>
          </Button>

          <div className="flex items-center gap-3 pt-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">New Support Ticket</h1>
              {organization?.name ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Filing with {organization.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">We&apos;re here to help</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Ticket Details
              </CardTitle>
              <CardDescription>Please provide as much detail as possible to help us assist you quickly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your issue"
                    className={cn(titleError && 'border-destructive focus-visible:ring-destructive')}
                  />
                  {titleError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {titleError}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe your issue in detail. Include any relevant information that might help us understand and resolve your problem."
                    className={cn('min-h-[160px] resize-none', descriptionError && 'border-destructive focus-visible:ring-destructive')}
                  />
                  {descriptionError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {descriptionError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{description.length} characters</p>
                </div>

                {/* Priority Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(PRIORITY_CONFIG) as [TicketPriority, (typeof PRIORITY_CONFIG)[TicketPriority]][]).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <span className={cn('h-2 w-2 rounded-full', config.dotColor)} />
                            <span>{config.label}</span>
                            <span className="text-xs text-muted-foreground">— {config.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Priority indicator */}
                  <div className={cn('flex items-center gap-2 p-3 rounded-lg text-sm', PRIORITY_CONFIG[priority].bgColor)}>
                    <span className={cn('h-2 w-2 rounded-full', PRIORITY_CONFIG[priority].dotColor)} />
                    <span className={PRIORITY_CONFIG[priority].color}>{PRIORITY_CONFIG[priority].label} Priority</span>
                    <span className="text-muted-foreground">— {PRIORITY_CONFIG[priority].description}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    We typically respond within 24 hours
                  </p>
                  <Button type="submit" disabled={!canSubmit}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Text */}
        <motion.div variants={itemVariants}>
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-sm">Tips for faster resolution</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be specific about what you were trying to do</li>
                    <li>• Include any error messages you saw</li>
                    <li>• Mention steps to reproduce the issue</li>
                    <li>• Note your device and browser if relevant</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
