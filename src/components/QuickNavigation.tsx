"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  List,
  Search,
  Star,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickNavigationProps {
  currentListingName: string;
  availableListings?: string[];
  reviewCount: number;
  averageRating?: number;
  className?: string;
}

export function QuickNavigation({
  currentListingName,
  availableListings = [],
  reviewCount,
  averageRating,
  className,
}: QuickNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Create slug from listing name
  const createSlug = (name: string) => {
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
  };

  // Find current listing index
  useEffect(() => {
    const index = availableListings.findIndex(
      (listing) => listing === currentListingName,
    );
    setCurrentIndex(index);
  }, [currentListingName, availableListings]);

  const previousListing =
    currentIndex > 0 ? availableListings[currentIndex - 1] : null;
  const nextListing =
    currentIndex < availableListings.length - 1
      ? availableListings[currentIndex + 1]
      : null;

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <div className={cn("bg-white border rounded-lg shadow-sm", className)}>
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between p-4">
        {/* Previous Listing */}
        <div className="flex-1">
          {previousListing ? (
            <Link
              href={`/listings/${createSlug(previousListing)}`}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <div className="text-left">
                <div className="text-xs text-gray-500">Previous</div>
                <div className="text-sm font-medium truncate max-w-32">
                  {previousListing}
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-gray-400 text-sm">
              <ChevronLeft className="h-4 w-4 inline mr-2" />
              First property
            </div>
          )}
        </div>

        {/* Current Property Info */}
        <div className="flex-2 text-center px-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 mx-auto text-gray-700 hover:text-gray-900 transition-colors"
          >
            <List className="h-4 w-4" />
            <div>
              <div className="text-xs text-gray-500">
                {currentIndex + 1} of {availableListings.length}
              </div>
              <div className="text-sm font-medium">{currentListingName}</div>
            </div>
          </button>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{reviewCount} reviews</span>
            </div>
            {averageRating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{formatRating(averageRating)}/10</span>
              </div>
            )}
          </div>
        </div>

        {/* Next Listing */}
        <div className="flex-1 text-right">
          {nextListing ? (
            <Link
              href={`/listings/${createSlug(nextListing)}`}
              className="flex items-center justify-end gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <div className="text-right">
                <div className="text-xs text-gray-500">Next</div>
                <div className="text-sm font-medium truncate max-w-32">
                  {nextListing}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div className="text-gray-400 text-sm">
              Last property
              <ChevronRight className="h-4 w-4 inline ml-2" />
            </div>
          )}
        </div>
      </div>

      {/* Expanded Property List */}
      {isExpanded && availableListings.length > 0 && (
        <div className="border-t bg-gray-50 max-h-64 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                All Properties
              </h3>
              <Link
                href="/"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Search className="h-3 w-3" />
                View All
              </Link>
            </div>

            <div className="space-y-1">
              {availableListings.map((listing, index) => (
                <Link
                  key={listing}
                  href={`/listings/${createSlug(listing)}`}
                  className={cn(
                    "block px-3 py-2 rounded text-sm transition-colors",
                    listing === currentListingName
                      ? "bg-blue-100 text-blue-900 font-medium"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                  onClick={() => setIsExpanded(false)}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{listing}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      #{index + 1}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <List className="h-3 w-3" />
            All Properties
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>

            {/* Keyboard Shortcuts Hint */}
            <div className="text-gray-400 hidden sm:block">
              <span className="border border-gray-300 rounded px-1 py-0.5 text-xs">
                ←
              </span>
              <span className="mx-1">/</span>
              <span className="border border-gray-300 rounded px-1 py-0.5 text-xs">
                →
              </span>
              <span className="ml-1">navigate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for keyboard navigation
export function useKeyboardNavigation(
  previousListing: string | null,
  nextListing: string | null,
) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle if no input is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (event.key === "ArrowLeft" && previousListing) {
        const slug = encodeURIComponent(
          previousListing.toLowerCase().replace(/\s+/g, "-"),
        );
        window.location.href = `/listings/${slug}`;
      } else if (event.key === "ArrowRight" && nextListing) {
        const slug = encodeURIComponent(
          nextListing.toLowerCase().replace(/\s+/g, "-"),
        );
        window.location.href = `/listings/${slug}`;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [previousListing, nextListing]);
}

// Component for mobile-friendly navigation
export function MobileQuickNav({
  currentListingName,
  previousListing,
  nextListing,
  className,
}: {
  currentListingName: string;
  previousListing: string | null;
  nextListing: string | null;
  className?: string;
}) {
  const createSlug = (name: string) => {
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between bg-white border rounded-lg p-3",
        className,
      )}
    >
      {previousListing ? (
        <Link
          href={`/listings/${createSlug(previousListing)}`}
          className="flex items-center gap-2 text-blue-600 font-medium text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      ) : (
        <div></div>
      )}

      <div className="text-center">
        <div className="text-xs text-gray-500">Current Property</div>
        <div className="text-sm font-medium text-gray-900 truncate max-w-32">
          {currentListingName}
        </div>
      </div>

      {nextListing ? (
        <Link
          href={`/listings/${createSlug(nextListing)}`}
          className="flex items-center gap-2 text-blue-600 font-medium text-sm"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div></div>
      )}
    </div>
  );
}
