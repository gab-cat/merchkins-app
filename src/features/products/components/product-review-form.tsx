'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle2, Edit2, X, Send, Pencil, LogIn } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Id } from '@/convex/_generated/dataModel';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ProductReviewFormProps {
  productId: Id<'products'>;
}

export function ProductReviewForm({ productId }: ProductReviewFormProps) {
  const { userId: clerkId } = useAuth();
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');

  const existingReview = useQuery(api.reviews.queries.index.getUserReview, currentUser?._id ? { productId } : 'skip');

  const createReview = useMutation(api.reviews.mutations.index.createReview);
  const updateReview = useMutation(api.reviews.mutations.index.updateReview);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const rating = watch('rating');

  // Pre-populate form when existing review loads
  useEffect(() => {
    if (existingReview) {
      setValue('rating', existingReview.rating);
      setValue('comment', existingReview.comment ?? '');
    }
  }, [existingReview, setValue]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form to original values
      if (existingReview) {
        setValue('rating', existingReview.rating);
        setValue('comment', existingReview.comment ?? '');
      }
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data: ReviewFormValues) => {
    if (!currentUser?._id) {
      showToast({ type: 'error', title: 'Please sign in to leave a review' });
      return;
    }

    if (data.rating === 0) {
      showToast({ type: 'warning', title: 'Please select a rating' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        await updateReview({
          reviewId: existingReview._id,
          rating: data.rating,
          comment: data.comment || undefined,
        });
        showToast({ type: 'success', title: 'Review updated' });
        setIsEditing(false);
      } else {
        await createReview({
          productId,
          rating: data.rating,
          comment: data.comment || undefined,
        });
        showToast({ type: 'success', title: 'Review submitted' });
      }

      // Reset form state but keep values for display
      form.reset({ rating: data.rating, comment: data.comment }, { keepValues: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
      showToast({ type: 'error', title: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating ?? rating;

  // Not logged in state
  if (!clerkId) {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LogIn className="h-4 w-4" />
          <span>Sign in to leave a review</span>
        </div>
      </div>
    );
  }

  // Loading current user
  if (currentUser === undefined) {
    return (
      <div className="rounded-xl border border-slate-100 p-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Skeleton key={star} className="h-4 w-4 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show skeleton while checking for existing review
  if (existingReview === undefined && currentUser) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Skeleton key={star} className="h-4 w-4 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName =
    currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.email.split('@')[0];

  // If user has an existing review and not editing, show it inline
  if (existingReview && !isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3"
      >
        <div className="flex gap-2.5">
          <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-primary/20">
            <AvatarImage src={currentUser.imageUrl} alt={userName} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-medium text-slate-900 truncate">{userName}</span>
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Your review</span>
                {existingReview.isVerifiedPurchase && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" title="Verified Purchase" />
                )}
              </div>
              <button
                onClick={handleEditToggle}
                className="p-1 rounded-md hover:bg-primary/10 transition-colors text-slate-400 hover:text-primary"
                title="Edit review"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${star <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                />
              ))}
              <span className="text-[11px] text-slate-400 ml-1.5">
                {new Date(existingReview.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Comment */}
            {existingReview.comment && <p className="text-sm text-slate-600 leading-relaxed mt-1.5 whitespace-pre-wrap">{existingReview.comment}</p>}
          </div>
        </div>
      </motion.div>
    );
  }

  // Show form (either for new review or editing existing)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex gap-2.5">
        <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-slate-100">
          <AvatarImage src={currentUser.imageUrl} alt={userName} />
          <AvatarFallback className="text-xs bg-slate-100 text-slate-600">{userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-slate-900">{existingReview ? 'Edit your review' : 'Share your experience'}</span>
            {existingReview && (
              <button
                onClick={handleEditToggle}
                className="p-1 rounded-md hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
            {/* Rating */}
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('rating', star, { shouldValidate: true })}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="transition-transform hover:scale-110 active:scale-95 touch-manipulation"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= displayRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
                      } transition-colors`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-xs text-slate-500 ml-1.5">
                    {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                )}
              </div>
              {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating.message}</p>}
            </div>

            {/* Comment */}
            <div>
              <Textarea
                id="comment"
                {...register('comment')}
                placeholder="What did you like or dislike? (optional)"
                className="min-h-[60px] resize-none text-sm border-slate-200 focus:border-primary/50 rounded-lg"
                autoResize
                minRows={2}
              />
              {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isSubmitting || rating === 0} size="sm" className="w-full h-8 text-xs font-medium rounded-lg">
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1.5" />
                  {existingReview ? 'Update' : 'Submit review'}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
