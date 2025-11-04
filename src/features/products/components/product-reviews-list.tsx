"use client"

import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, CheckCircle2 } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

interface ProductReviewsListProps {
  productId: Id<'products'>
  currentUserId?: Id<'users'>
}

export function ProductReviewsList ({ productId, currentUserId }: ProductReviewsListProps) {
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  
  const reviewsResult = useQuery(
    api.reviews.queries.index.getReviewsByProduct,
    { productId, limit: 20, cursor }
  )
  
  const reviews = reviewsResult?.reviews ?? []
  const hasMore = !!reviewsResult?.nextCursor
  
  const handleLoadMore = () => {
    if (reviewsResult?.nextCursor) {
      setCursor(reviewsResult.nextCursor)
    }
  }
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product!</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {reviews.map((review) => {
          const isOwnReview = currentUserId === review.userId
          const userName = review.userInfo.firstName && review.userInfo.lastName
            ? `${review.userInfo.firstName} ${review.userInfo.lastName}`
            : review.userInfo.email.split('@')[0]
          
          return (
            <Card
              key={review._id}
              className={`overflow-hidden transition-colors ${
                isOwnReview ? 'border-l-4 border-l-primary bg-primary/5' : 'border-l-4 border-l-primary/20'
              } hover:border-l-primary/40`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-background flex-shrink-0">
                    <AvatarImage src={review.userInfo.imageUrl} alt={userName} />
                    <AvatarFallback className="text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-primary truncate">
                            {userName}
                          </span>
                          {isOwnReview && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              Your review
                            </Badge>
                          )}
                          {review.isVerifiedPurchase && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="inline-flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    )}
                    
                    {review.merchantResponse && (
                      <div className="mt-3 pl-3 border-l-2 border-primary/30 bg-muted/30 rounded-r-md p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary">
                            {review.merchantResponse.responderName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            (Merchant)
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {review.merchantResponse.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="text-sm"
          >
            Load more reviews
          </Button>
        </div>
      )}
    </div>
  )
}
