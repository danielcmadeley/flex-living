/**
 * Application-wide constants and configuration
 */

// ============================================================================
// Pagination
// ============================================================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  LISTINGS_PER_PAGE: 9,
  REVIEWS_PER_PAGE: 10,
  MIN_PAGE_SIZE: 5,
  MAX_PAGE_SIZE: 50,
} as const;

// ============================================================================
// Ratings
// ============================================================================
export const RATINGS = {
  MAX_RATING: 10,
  MAX_STARS: 10,
  FIVE_STAR_MAX: 5,
  DECIMAL_PLACES: 1,
  DEFAULT_MIN_RATING: 0,
} as const;

// ============================================================================
// Date & Time
// ============================================================================
export const DATE_FORMATS = {
  DISPLAY: {
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const,
  DISPLAY_SHORT: {
    year: "numeric",
    month: "short",
    day: "numeric",
  } as const,
  TIME: {
    hour: "2-digit",
    minute: "2-digit",
  } as const,
  DATETIME: {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as const,
} as const;

// ============================================================================
// Text Display
// ============================================================================
export const TEXT_LIMITS = {
  REVIEW_PREVIEW: 100,
  TITLE_MAX: 50,
  DESCRIPTION_MAX: 200,
  COMMENT_MIN: 10,
  COMMENT_MAX: 5000,
} as const;

// ============================================================================
// API Configuration
// ============================================================================
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 2 * 60 * 1000, // 2 minutes
} as const;

// ============================================================================
// Query Keys
// ============================================================================
export const QUERY_KEYS = {
  REVIEWS: ["reviews"] as const,
  LISTINGS: ["listings"] as const,
  FEATURED_LISTINGS: ["listings", "featured"] as const,
  LISTING_DETAILS: (slug: string) => ["listings", slug] as const,
  GOOGLE_REVIEWS: (propertyName: string) =>
    ["google-reviews", propertyName] as const,
  STATISTICS: ["statistics"] as const,
  SEED_STATUS: ["seed", "status"] as const,
} as const;

// ============================================================================
// Review Status
// ============================================================================
export const REVIEW_STATUS = {
  PUBLISHED: "published",
  PENDING: "pending",
  DRAFT: "draft",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

// ============================================================================
// Review Types
// ============================================================================
export const REVIEW_TYPE = {
  HOST_TO_GUEST: "host-to-guest",
  GUEST_TO_HOST: "guest-to-host",
} as const;

export type ReviewType = (typeof REVIEW_TYPE)[keyof typeof REVIEW_TYPE];

// ============================================================================
// UI Configuration
// ============================================================================
export const UI = {
  TOAST_DURATION: 5000, // 5 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  ANIMATION_DURATION: 200, // 200ms
  LOADING_DELAY: 100, // 100ms before showing loader
  MOBILE_BREAKPOINT: 768, // px
  TABLET_BREAKPOINT: 1024, // px
} as const;

// ============================================================================
// Validation
// ============================================================================
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s-()]+$/,
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

// ============================================================================
// Error Messages
// ============================================================================
export const ERROR_MESSAGES = {
  GENERIC: "An unexpected error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection and try again.",
  NOT_FOUND: "The requested resource was not found.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  VALIDATION: "Please check your input and try again.",
  RATE_LIMIT: "Too many requests. Please try again later.",
  SERVER_ERROR: "Server error. Please try again later.",
} as const;

// ============================================================================
// Success Messages
// ============================================================================
export const SUCCESS_MESSAGES = {
  REVIEW_CREATED: "Review created successfully",
  REVIEW_UPDATED: "Review updated successfully",
  REVIEW_DELETED: "Review deleted successfully",
  STATUS_UPDATED: "Status updated successfully",
  DATA_LOADED: "Data loaded successfully",
  LOGOUT: "Logged out successfully",
} as const;

// ============================================================================
// Routes
// ============================================================================
export const ROUTES = {
  HOME: "/",
  LISTINGS: "/listings",
  LISTING_DETAILS: (slug: string) => `/listings/${slug}` as const,
  DASHBOARD: "/dashboard",
  DASHBOARD_PROPERTIES: "/dashboard/properties",
  DASHBOARD_SEED: "/dashboard/seed",
  LOGIN: "/login",
  API: {
    REVIEWS: "/api/reviews",
    GOOGLE_REVIEWS: "/api/reviews/google",
    HOSTAWAY_REVIEWS: "/api/reviews/hostaway",
    SEED: "/api/seed",
  },
} as const;

// ============================================================================
// Feature Flags
// ============================================================================
export const FEATURES = {
  SHOW_DEBUG_INFO: process.env.NODE_ENV === "development",
} as const;

// ============================================================================
// Default Values
// ============================================================================
export const DEFAULTS = {
  FEATURED_LISTINGS_COUNT: 6,
  RECENT_DAYS: 30,
  MAX_RETRIES: 3,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;
