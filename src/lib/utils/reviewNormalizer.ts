import { HostawayReview, NormalizedReview } from "../types/hostaway";

export function normalizeHostawayReview(
  review: HostawayReview,
): NormalizedReview {
  // Convert category ratings to object format
  const categories: NormalizedReview["categories"] = {};

  review.reviewCategory.forEach((cat) => {
    switch (cat.category) {
      case "cleanliness":
        categories.cleanliness = cat.rating;
        break;
      case "communication":
        categories.communication = cat.rating;
        break;
      case "respect_house_rules":
        categories.respect_house_rules = cat.rating;
        break;
      case "accuracy":
        categories.accuracy = cat.rating;
        break;
      case "location":
        categories.location = cat.rating;
        break;
      case "check_in":
        categories.check_in = cat.rating;
        break;
      case "value":
        categories.value = cat.rating;
        break;
    }
  });

  // Calculate overall rating if not provided
  let overallRating = review.rating;
  if (!overallRating && review.reviewCategory.length > 0) {
    const sum = review.reviewCategory.reduce((acc, cat) => acc + cat.rating, 0);
    overallRating = Math.round((sum / review.reviewCategory.length) * 10) / 10;
  }

  return {
    id: review.id,
    type: review.type as "host-to-guest" | "guest-to-host",
    status: review.status as "published" | "pending" | "draft",
    overallRating,
    comment: review.publicReview,
    categories,
    submittedAt: new Date(review.submittedAt),
    guestName: review.guestName,
    listingName: review.listingName,
    channel: "hostaway",
  };
}

export function groupReviewsByListing(
  reviews: NormalizedReview[],
): Record<string, NormalizedReview[]> {
  return reviews.reduce(
    (acc, review) => {
      if (!acc[review.listingName]) {
        acc[review.listingName] = [];
      }
      acc[review.listingName].push(review);
      return acc;
    },
    {} as Record<string, NormalizedReview[]>,
  );
}

export function groupReviewsByType(
  reviews: NormalizedReview[],
): Record<string, NormalizedReview[]> {
  return reviews.reduce(
    (acc, review) => {
      if (!acc[review.type]) {
        acc[review.type] = [];
      }
      acc[review.type].push(review);
      return acc;
    },
    {} as Record<string, NormalizedReview[]>,
  );
}

export function sortReviewsByDate(
  reviews: NormalizedReview[],
  order: "asc" | "desc" = "desc",
): NormalizedReview[] {
  return [...reviews].sort((a, b) => {
    const dateA = a.submittedAt.getTime();
    const dateB = b.submittedAt.getTime();
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });
}

export function filterReviewsByDateRange(
  reviews: NormalizedReview[],
  startDate: Date,
  endDate: Date,
): NormalizedReview[] {
  return reviews.filter((review) => {
    const reviewDate = review.submittedAt;
    return reviewDate >= startDate && reviewDate <= endDate;
  });
}

export function calculateAverageRatings(reviews: NormalizedReview[]): {
  overall: number;
  categories: Record<string, number>;
} {
  if (reviews.length === 0) {
    return { overall: 0, categories: {} };
  }

  // Calculate overall average
  const reviewsWithRatings = reviews.filter((r) => r.overallRating !== null);
  const overallSum = reviewsWithRatings.reduce(
    (sum, r) => sum + (r.overallRating || 0),
    0,
  );
  const overall =
    reviewsWithRatings.length > 0 ? overallSum / reviewsWithRatings.length : 0;

  // Calculate category averages
  const categoryTotals: Record<string, { sum: number; count: number }> = {};

  reviews.forEach((review) => {
    Object.entries(review.categories).forEach(([category, rating]) => {
      if (rating !== undefined) {
        if (!categoryTotals[category]) {
          categoryTotals[category] = { sum: 0, count: 0 };
        }
        categoryTotals[category].sum += rating;
        categoryTotals[category].count += 1;
      }
    });
  });

  const categories = Object.entries(categoryTotals).reduce(
    (acc, [category, total]) => {
      acc[category] = total.count > 0 ? total.sum / total.count : 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    overall: Math.round(overall * 10) / 10,
    categories: Object.entries(categories).reduce(
      (acc, [key, value]) => {
        acc[key] = Math.round(value * 10) / 10;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };
}
