'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle2, ChevronDown, MessageCircle } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

interface ProductReviewsListProps {
  productId: Id<'products'>;
  currentUserId?: Id<'users'>;
}

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
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export function ProductReviewsList({ productId, currentUserId }: ProductReviewsListProps) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const reviewsResult = useQuery(api.reviews.queries.index.getReviewsByProduct, { productId, limit: 20, cursor });

  const reviews = reviewsResult?.reviews ?? [];
  const hasMore = !!reviewsResult?.nextCursor;

  const handleLoadMore = () => {
    if (reviewsResult?.nextCursor) {
      setCursor(reviewsResult.nextCursor);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="h-10 w-10 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
      {reviews.map((review) => {
        const isOwnReview = currentUserId === review.userId;
        const userName =
          review.userInfo.firstName && review.userInfo.lastName
            ? `${review.userInfo.firstName} ${review.userInfo.lastName}`
            : review.userInfo.email.split('@')[0];

        return (
          <motion.div
            key={review._id}
            variants={itemVariants}
            className={`rounded-xl border p-3 transition-all hover:shadow-sm ${
              isOwnReview ? 'border-primary/30 bg-primary/[0.03]' : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="flex gap-2.5">
              <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-slate-100">
                <AvatarImage src={review.userInfo.imageUrl} alt={userName} />
                <AvatarFallback className="text-xs bg-slate-100 text-slate-600">{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-medium text-slate-900 truncate">{userName}</span>
                    {isOwnReview && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">You</span>
                    )}
                    {review.isVerifiedPurchase && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" title="Verified Purchase" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                    />
                  ))}
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-slate-600 leading-relaxed mt-1.5 whitespace-pre-wrap">{review.comment}</p>
                )}

                {/* Merchant response */}
                {review.merchantResponse && (
                  <div className="mt-2 pl-2.5 border-l-2 border-primary/20 bg-slate-50 rounded-r-lg py-1.5 px-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-medium text-primary">{review.merchantResponse.responderName}</span>
                      <span className="text-[10px] text-slate-400">· Store</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{review.merchantResponse.message}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {hasMore && (
        <motion.div variants={itemVariants} className="flex justify-center pt-1">
          <Button variant="ghost" size="sm" onClick={handleLoadMore} className="text-xs text-slate-500 hover:text-slate-700 h-8">
            <ChevronDown className="h-3.5 w-3.5 mr-1" />
            Load more reviews
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
