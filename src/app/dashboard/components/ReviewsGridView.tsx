"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NormalizedReview } from "@/lib/schemas";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { formatDateShort } from "@/lib/utils/formatting";
import { REVIEW_STATUS, REVIEW_TYPE } from "@/lib/constants";

interface ReviewsGridViewProps {
  reviews: NormalizedReview[];
  isLoading: boolean;
}

/**
 * Loading skeleton for review cards
 */
function ReviewCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-16 bg-gray-200 rounded animate-pulse" />
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty state for when no reviews are found
 */
function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-48">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
        <p className="text-muted-foreground text-center">
          No reviews match your current filters.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Individual review card component
 */
function ReviewCard({ review }: { review: NormalizedReview }) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case REVIEW_STATUS.PUBLISHED:
        return "default";
      case REVIEW_STATUS.PENDING:
        return "secondary";
      case REVIEW_STATUS.DRAFT:
        return "outline";
      default:
        return "outline";
    }
  };

  const getReviewTypeVariant = (type: string) => {
    return type === REVIEW_TYPE.HOST_TO_GUEST ? "default" : "secondary";
  };

  const getReviewTypeLabel = (type: string) => {
    return type === REVIEW_TYPE.HOST_TO_GUEST
      ? "Host → Guest"
      : "Guest → Host";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{review.guestName}</CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              {review.listingName}
            </p>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            {review.overallRating && (
              <>
                <Star className="h-4 w-4 fill-current" />
                <span className="font-semibold">
                  {review.overallRating.toFixed(1)}
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Badge variant={getReviewTypeVariant(review.type)}>
            {getReviewTypeLabel(review.type)}
          </Badge>

          <p className="text-sm line-clamp-3">{review.comment}</p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateShort(review.submittedAt)}
            </div>
            <Badge
              variant={getStatusVariant(review.status)}
              className="text-xs"
            >
              {review.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid view component for displaying reviews
 * Shows reviews in a responsive grid layout with loading and empty states
 */
export function ReviewsGridView({ reviews, isLoading }: ReviewsGridViewProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return <EmptyState />;
  }

  // Reviews grid
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
