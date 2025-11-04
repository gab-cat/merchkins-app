'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2, Edit2, X, MessageSquare, FileText, Send } from 'lucide-react';
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
  const comment = watch('comment');

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
        showToast({ type: 'success', title: 'Review updated successfully' });
        setIsEditing(false);
      } else {
        await createReview({
          productId,
          rating: data.rating,
          comment: data.comment || undefined,
        });
        showToast({ type: 'success', title: 'Review submitted successfully' });
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

  if (!currentUser) {
    return (
      <Card className="mt-3">
        <CardContent className="p-3 sm:p-4">
          <p className="text-sm text-muted-foreground">Please sign in to leave a review for this product.</p>
        </CardContent>
      </Card>
    );
  }

  // Show skeleton while checking for existing review
  if (existingReview === undefined && currentUser) {
    return (
      <Card className="mt-3 border-l-4 border-l-primary bg-primary/5">
        <CardContent className="py-1 px-3 sm:py-2 sm:px-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="inline-flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Skeleton key={star} className="h-3 w-3" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-7 w-16" />
              </div>
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user has an existing review and not editing, show it inline
  if (existingReview && !isEditing) {
    const userName =
      currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.email.split('@')[0];

    return (
      <Card className="mt-3 border-l-4 border-l-primary bg-primary/5">
        <CardContent className="py-1 px-3 sm:py-2 sm:px-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-background flex-shrink-0">
              <AvatarImage src={currentUser.imageUrl} alt={userName} />
              <AvatarFallback className="text-xs">{userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary truncate">Your review</span>
                    {existingReview.isVerifiedPurchase && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="inline-flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= existingReview.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(existingReview.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleEditToggle} className="text-xs shrink-0">
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>

              {existingReview.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{existingReview.comment}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show form (either for new review or editing existing)
  return (
    <Card className="mt-3">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-primary" />
            {existingReview ? 'Edit your review' : 'Write a review'}
          </h3>
          {existingReview && (
            <Button variant="ghost" size="sm" onClick={handleEditToggle} className="text-xs h-7">
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              Rating *
            </label>
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
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      star <= displayRating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && <p className="mt-1 text-xs text-destructive">{errors.rating.message}</p>}
          </div>

          <div>
            <label htmlFor="comment" className="mb-1.5 block text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Comment (optional)
            </label>
            <Textarea
              id="comment"
              {...register('comment')}
              placeholder="Share your thoughts about this product..."
              className="min-h-[80px] resize-none text-sm"
              autoResize
              minRows={3}
            />
            {errors.comment && <p className="mt-1 text-xs text-destructive">{errors.comment.message}</p>}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || rating === 0} size="sm" className="flex-1 text-xs">
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  {existingReview ? 'Update review' : 'Submit review'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
