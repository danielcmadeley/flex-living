"use client";

import { useState, useEffect } from "react";
import { NormalizedReview } from "@/lib/types/hostaway";

interface ReviewsResponse {
  status: "success" | "error";
  data: NormalizedReview[];
  total: number;
  message?: string;
  statistics?: {
    overall: number;
    categories: Record<string, number>;
    totalReviews: number;
    reviewTypes: Record<string, number>;
  };
}

export default function ReviewsDemo() {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewsResponse["statistics"] | null>(
    null,
  );

  const fetchReviews = async (includeStats = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/reviews/hostaway${includeStats ? "?includeStats=true" : ""}`;
      const response = await fetch(url);
      const data: ReviewsResponse = await response.json();

      if (data.status === "success") {
        setReviews(data.data);
        if (data.statistics) {
          setStats(data.statistics);
        }
      } else {
        setError(data.message || "Failed to fetch reviews");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(true);
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>,
      );
    }

    const emptyStars = 10 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ☆
        </span>,
      );
    }

    return stars;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hostaway Reviews Demo
            </h1>
            <p className="text-gray-600">
              This demo shows how to fetch and display reviews from the Hostaway
              API
            </p>
          </div>
          <a
            href="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Manager Dashboard
          </a>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => fetchReviews(true)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh Reviews"}
        </button>

        <button
          onClick={() => fetchReviews(false)}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          Fetch Without Stats
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {stats && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-700">Overall Rating</h3>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold">{stats.overall}</span>
                <span className="text-sm text-gray-500 ml-1">/10</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-700">Total Reviews</h3>
              <span className="text-2xl font-bold">{stats.totalReviews}</span>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium text-gray-700">Review Types</h3>
              <div className="text-sm">
                <div>Host to Guest: {stats.reviewTypes["host-to-guest"]}</div>
                <div>Guest to Host: {stats.reviewTypes["guest-to-host"]}</div>
              </div>
            </div>
          </div>

          {Object.keys(stats.categories).length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">
                Category Ratings
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(stats.categories).map(([category, rating]) => (
                  <div key={category} className="bg-white p-2 rounded text-sm">
                    <div className="font-medium capitalize">
                      {category.replace("_", " ")}
                    </div>
                    <div className="text-lg font-bold">
                      {typeof rating === "number" ? rating : 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>

        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border rounded-lg p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{review.guestName}</h3>
                <p className="text-gray-600">{review.listingName}</p>
                <div className="flex items-center mt-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      review.type === "host-to-guest"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {review.type}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {formatDate(review.submittedAt)}
                  </span>
                </div>
              </div>

              {review.overallRating && (
                <div className="text-right">
                  <div className="flex items-center">
                    {renderStars(review.overallRating)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {review.overallRating}/10
                  </div>
                </div>
              )}
            </div>

            <p className="text-gray-800 mb-4">&ldquo;{review.comment}&rdquo;</p>

            {Object.keys(review.categories).length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Category Ratings:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(review.categories).map(
                    ([category, rating]) =>
                      rating !== undefined && (
                        <div key={category} className="text-sm">
                          <span className="capitalize font-medium">
                            {category.replace("_", " ")}:
                          </span>
                          <span className="ml-1">{rating}/10</span>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">No reviews found</div>
        )}
      </div>
    </div>
  );
}
