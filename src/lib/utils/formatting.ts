/**
 * Formatting utilities for dates, ratings, and other display values
 */

import React from "react";

/**
 * Formats a date to a human-readable string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "January 1, 2024")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a date to a short format
 * @param date - The date to format
 * @returns Short formatted date string (e.g., "Jan 1, 2024")
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a relative time string
 * @param date - The date to format
 * @returns Relative time string (e.g., "2 days ago", "1 month ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? "s" : ""} ago`;
  if (diffInDays < 365)
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? "s" : ""} ago`;
}

/**
 * Configuration for star rating display
 */
interface StarRatingConfig {
  maxStars?: number;
  filledChar?: string;
  halfChar?: string;
  emptyChar?: string;
  filledClass?: string;
  halfClass?: string;
  emptyClass?: string;
}

/**
 * Generates star rating elements
 * @param rating - The rating value (0-10 scale)
 * @param config - Optional configuration for star display
 * @returns Array of React elements representing stars
 */
export function renderStars(
  rating: number,
  config: StarRatingConfig = {},
): React.ReactElement[] {
  const {
    maxStars = 10,
    filledChar = "★",
    halfChar = "☆",
    emptyChar = "☆",
    filledClass = "text-yellow-400",
    halfClass = "text-yellow-400",
    emptyClass = "text-gray-300",
  } = config;

  const stars: React.ReactElement[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      React.createElement(
        "span",
        {
          key: `full-${i}`,
          className: filledClass,
        },
        filledChar,
      ),
    );
  }

  // Add half star if needed
  if (hasHalfStar && fullStars < maxStars) {
    stars.push(
      React.createElement(
        "span",
        {
          key: "half",
          className: halfClass,
        },
        halfChar,
      ),
    );
  }

  // Add empty stars
  const emptyStarsCount = maxStars - Math.ceil(rating);
  for (let i = 0; i < emptyStarsCount; i++) {
    stars.push(
      React.createElement(
        "span",
        {
          key: `empty-${i}`,
          className: emptyClass,
        },
        emptyChar,
      ),
    );
  }

  return stars;
}

/**
 * Converts a 10-point rating to a 5-star scale
 * @param rating - Rating on a 10-point scale
 * @returns Rating on a 5-star scale
 */
export function convertToFiveStarRating(rating: number): number {
  return rating / 2;
}

/**
 * Formats a rating with appropriate decimal places
 * @param rating - The rating value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted rating string
 */
export function formatRating(rating: number, decimals: number = 1): string {
  return rating.toFixed(decimals);
}

/**
 * Formats a count with proper pluralization
 * @param count - The count value
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word (optional, defaults to singular + 's')
 * @returns Formatted count string
 */
export function formatCount(
  count: number,
  singular: string,
  plural?: string,
): string {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Truncates text with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "...",
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
}

/**
 * Formats a percentage value
 * @param value - The value to format (0-1 or 0-100)
 * @param isDecimal - Whether the input is decimal (0-1) or percentage (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  isDecimal: boolean = true,
  decimals: number = 0,
): string {
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}
