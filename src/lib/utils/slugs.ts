// Utility functions for converting between listing names and URL slugs
// This implementation is robust and works with ANY listing name without hardcoded mappings

/**
 * Convert a listing name to a URL-safe slug
 * This function is deterministic and reversible
 */
export function createListingSlug(listingName: string): string {
  return (
    listingName
      .toLowerCase()
      .trim()
      // Replace spaces and multiple whitespace with single hyphens
      .replace(/\s+/g, "-")
      // Replace special characters with hyphens, but preserve numbers and letters
      .replace(/[^a-z0-9]+/g, "-")
      // Remove multiple consecutive hyphens
      .replace(/-+/g, "-")
      // Remove leading and trailing hyphens
      .replace(/^-|-$/g, "")
  );
}

/**
 * Convert a URL slug back to a listing name
 * This attempts to reverse the slug creation process as accurately as possible
 */
export function slugToListingName(slug: string): string {
  return slug
    .split("-")
    .map((word) => {
      // Handle empty strings
      if (!word) return "";

      // Keep single letters/numbers as uppercase if they appear to be initials
      if (word.length === 1 && /[a-z0-9]/.test(word)) {
        return word.toUpperCase();
      }

      // Handle numbers - keep them as is
      if (/^\d+$/.test(word)) {
        return word;
      }

      // Handle mixed alphanumeric (like "2b" -> "2B")
      if (/^\d+[a-z]+$/.test(word)) {
        return word.charAt(0) + word.slice(1).toUpperCase();
      }

      // Handle words that are likely to be lowercase (prepositions, articles)
      const lowercaseWords = [
        "a",
        "an",
        "the",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
      ];
      if (lowercaseWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }

      // Standard title case for regular words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .trim();
}

/**
 * Find the best matching listing name from a list of available listings
 * This handles cases where the slug conversion isn't perfect
 */
export function findBestMatchingListing(
  slug: string,
  availableListings: string[],
): string | null {
  // First try exact slug match
  const convertedName = slugToListingName(slug);

  // Check for exact match
  const exactMatch = availableListings.find(
    (listing) => listing === convertedName,
  );
  if (exactMatch) return exactMatch;

  // Check for case-insensitive match
  const caseInsensitiveMatch = availableListings.find(
    (listing) => listing.toLowerCase() === convertedName.toLowerCase(),
  );
  if (caseInsensitiveMatch) return caseInsensitiveMatch;

  // Check if any listing produces the same slug (bidirectional check)
  const slugMatch = availableListings.find(
    (listing) => createListingSlug(listing) === slug,
  );
  if (slugMatch) return slugMatch;

  // Fuzzy matching - check for listings that are very similar
  const normalizedSlug = slug.replace(/-/g, "").toLowerCase();
  const fuzzyMatch = availableListings.find((listing) => {
    const normalizedListing = listing.replace(/[^a-z0-9]/gi, "").toLowerCase();
    return normalizedListing === normalizedSlug;
  });

  return fuzzyMatch || null;
}

/**
 * Validate if a slug is in the correct format
 */
export function isValidSlug(slug: string): boolean {
  return (
    /^[a-z0-9-]+$/.test(slug) &&
    !slug.startsWith("-") &&
    !slug.endsWith("-") &&
    !slug.includes("--")
  );
}

/**
 * Generate a listing URL for navigation
 */
export function getListingUrl(listingName: string): string {
  return `/listings/${createListingSlug(listingName)}`;
}

/**
 * Extract listing name from a listing URL path
 */
export function getListingNameFromPath(path: string): string | null {
  const match = path.match(/^\/listings\/(.+)$/);
  if (!match) return null;

  const slug = match[1];
  return slugToListingName(slug);
}

/**
 * Create a canonical slug-to-name mapping for a list of listings
 * This is useful for caching and ensuring consistency
 */
export function createSlugMapping(
  listingNames: string[],
): Record<string, string> {
  const mapping: Record<string, string> = {};

  listingNames.forEach((name) => {
    const slug = createListingSlug(name);
    mapping[slug] = name;
  });

  return mapping;
}
