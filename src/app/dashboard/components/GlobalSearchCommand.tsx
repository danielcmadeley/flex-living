"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Building,
  MessageSquare,
  Star,
  User,
  Calendar,
  Database,
  Home,
  Filter,
} from "lucide-react";
import { NormalizedReview } from "@/lib/schemas";

interface GlobalSearchCommandProps {
  reviews: NormalizedReview[];
  className?: string;
}

interface SearchResult {
  id: string;
  type: "review" | "property" | "guest" | "navigation";
  title: string;
  subtitle?: string;
  description?: string;
  url?: string;
  action?: () => void;
  icon: React.ReactNode;
  badge?: string;
  metadata?: {
    rating?: number;
    date?: string;
    status?: string;
  };
}

export function GlobalSearchCommand({
  reviews,
  className,
}: GlobalSearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Generate search results based on current search term
  const searchResults = useMemo(() => {
    if (!searchTerm) {
      return {
        type: "default" as const,
        navigation: getNavigationItems(),
        recent: getRecentItems(reviews),
        suggestions: getSuggestions(),
      };
    }

    const query = searchTerm.toLowerCase().trim();
    const results = {
      type: "search" as const,
      reviews: [] as SearchResult[],
      properties: [] as SearchResult[],
      guests: [] as SearchResult[],
      navigation: [] as SearchResult[],
    };

    // Search reviews
    reviews
      .filter(
        (review) =>
          review.comment.toLowerCase().includes(query) ||
          review.guestName.toLowerCase().includes(query) ||
          review.listingName.toLowerCase().includes(query) ||
          review.status.toLowerCase().includes(query),
      )
      .slice(0, 8)
      .forEach((review) => {
        results.reviews.push({
          id: `review-${review.id}`,
          type: "review",
          title: `Review by ${review.guestName}`,
          subtitle: review.listingName,
          description:
            review.comment.substring(0, 100) +
            (review.comment.length > 100 ? "..." : ""),
          url: `/dashboard/reviews?search=${encodeURIComponent(review.guestName)}`,
          icon: <MessageSquare className="h-4 w-4" />,
          badge:
            review.type === "host-to-guest" ? "Host → Guest" : "Guest → Host",
          metadata: {
            rating: review.overallRating || undefined,
            date: new Date(review.submittedAt).toLocaleDateString(),
            status: review.status,
          },
        });
      });

    // Search properties
    const uniqueProperties = Array.from(
      new Set(reviews.map((review) => review.listingName)),
    ).filter((property) => property.toLowerCase().includes(query));

    uniqueProperties.slice(0, 6).forEach((property) => {
      const propertyReviews = reviews.filter((r) => r.listingName === property);
      const avgRating = propertyReviews
        .filter((r) => r.overallRating !== null)
        .reduce((sum, r, _, arr) => sum + r.overallRating! / arr.length, 0);

      results.properties.push({
        id: `property-${property}`,
        type: "property",
        title: property,
        subtitle: `${propertyReviews.length} reviews`,
        description: `Average rating: ${avgRating.toFixed(1)}/10`,
        url: `/dashboard/properties/${encodeURIComponent(property)}`,
        icon: <Building className="h-4 w-4" />,
        badge:
          avgRating >= 8
            ? "Excellent"
            : avgRating >= 6
              ? "Good"
              : "Needs Attention",
        metadata: {
          rating: avgRating,
        },
      });
    });

    // Search guests
    const uniqueGuests = Array.from(
      new Map(
        reviews
          .filter((review) => review.guestName.toLowerCase().includes(query))
          .map((review) => [review.guestName, review]),
      ).values(),
    );

    uniqueGuests.slice(0, 6).forEach((review) => {
      const guestReviews = reviews.filter(
        (r) => r.guestName === review.guestName,
      );

      results.guests.push({
        id: `guest-${review.guestName}`,
        type: "guest",
        title: review.guestName,
        subtitle: `${guestReviews.length} review${guestReviews.length !== 1 ? "s" : ""}`,
        description: `Latest: ${review.listingName}`,
        url: `/dashboard/reviews?search=${encodeURIComponent(review.guestName)}`,
        icon: <User className="h-4 w-4" />,
        metadata: {
          date: new Date(review.submittedAt).toLocaleDateString(),
        },
      });
    });

    // Search navigation items
    results.navigation = getNavigationItems().filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)),
    );

    return results;
  }, [searchTerm, reviews]);

  const handleSelect = (result: SearchResult) => {
    if (result.action) {
      result.action();
    } else if (result.url) {
      router.push(result.url);
    }
    setOpen(false);
    setSearchTerm("");
  };

  const getHighlightedText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={index}
          className="bg-yellow-200 text-yellow-900 rounded px-1"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        size="default"
        onClick={() => setOpen(true)}
        className={`relative min-w-[280px] justify-start bg-white/95 backdrop-blur-sm border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      >
        <Search className="h-4 w-4 mr-3 text-gray-500 shrink-0" />
        <span className="text-gray-500 text-sm font-medium">
          Search reviews, properties, guests...
        </span>
        <kbd className="pointer-events-none ml-auto hidden select-none items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-1 font-mono text-[11px] font-semibold text-gray-600 sm:flex shadow-sm">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search reviews, properties, guests, or navigate..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="h-12 text-base border-0 border-b border-gray-200 rounded-none focus:ring-0 focus:border-blue-500 transition-colors"
        />
        <CommandList className="max-h-[450px] py-2">
          <CommandEmpty>
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                No results found
              </h3>
              <p className="text-sm text-gray-600">
                Try searching for reviews, properties, guests, or navigation
                items
              </p>
            </div>
          </CommandEmpty>

          {!searchTerm && (
            <>
              {/* Navigation Items */}
              <CommandGroup heading="Navigation">
                {searchResults.navigation.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors duration-150 rounded-lg mx-2"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-600">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              {/* Recent Activity */}
              <CommandGroup heading="Recent Activity">
                {searchResults.type === "default" &&
                  searchResults.recent.map((item: SearchResult) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3 p-3 hover:bg-green-50 transition-colors duration-150 rounded-lg mx-2"
                    >
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.subtitle}
                        </div>
                      </div>
                      {item.metadata?.date && (
                        <div className="text-xs text-gray-500 font-medium">
                          {item.metadata.date}
                        </div>
                      )}
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandSeparator />

              {/* Quick Actions */}
              <CommandGroup heading="Quick Actions">
                {searchResults.type === "default" &&
                  searchResults.suggestions.map((item: SearchResult) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3 p-3 hover:bg-purple-50 transition-colors duration-150 rounded-lg mx-2"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.description}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}

          {searchTerm && searchResults.type === "search" && (
            <>
              {/* Search Results - Reviews */}
              {searchResults.reviews.length > 0 && (
                <>
                  <CommandGroup
                    heading={`Reviews (${searchResults.reviews.length})`}
                  >
                    {searchResults.reviews.map((item: SearchResult) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleSelect(item)}
                        className="flex items-start gap-3 p-4 hover:bg-blue-50 transition-colors duration-150 rounded-lg mx-2 border border-transparent hover:border-blue-200"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800">
                            {getHighlightedText(item.title, searchTerm)}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {getHighlightedText(
                              item.subtitle || "",
                              searchTerm,
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {getHighlightedText(item.description, searchTerm)}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {item.badge && (
                              <Badge
                                variant="outline"
                                className="text-xs border-gray-300 bg-gray-50"
                              >
                                {item.badge}
                              </Badge>
                            )}
                            {item.metadata?.rating && (
                              <div className="flex items-center gap-1 text-xs font-semibold text-yellow-600">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {item.metadata.rating.toFixed(1)}
                              </div>
                            )}
                            {item.metadata?.status && (
                              <Badge
                                variant={
                                  item.metadata.status === "published"
                                    ? "default"
                                    : item.metadata.status === "pending"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {item.metadata.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {item.metadata?.date && (
                          <div className="text-xs text-gray-500 font-medium">
                            {item.metadata.date}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Search Results - Properties */}
              {searchResults.properties.length > 0 && (
                <>
                  <CommandGroup
                    heading={`Properties (${searchResults.properties.length})`}
                  >
                    {searchResults.properties.map((item: SearchResult) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleSelect(item)}
                        className="flex items-center gap-3 p-3"
                      >
                        {item.icon}
                        <div className="flex-1">
                          <div className="font-medium">
                            {getHighlightedText(item.title, searchTerm)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.subtitle} • {item.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <Badge
                              variant={
                                item.badge === "Excellent"
                                  ? "default"
                                  : item.badge === "Good"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {item.metadata?.rating && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {item.metadata.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Search Results - Guests */}
              {searchResults.guests.length > 0 && (
                <>
                  <CommandGroup
                    heading={`Guests (${searchResults.guests.length})`}
                  >
                    {searchResults.guests.map((item: SearchResult) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleSelect(item)}
                        className="flex items-center gap-3 p-3"
                      >
                        {item.icon}
                        <div className="flex-1">
                          <div className="font-medium">
                            {getHighlightedText(item.title, searchTerm)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.subtitle} • {item.description}
                          </div>
                        </div>
                        {item.metadata?.date && (
                          <div className="text-xs text-muted-foreground">
                            {item.metadata.date}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Search Results - Navigation */}
              {searchResults.navigation.length > 0 && (
                <CommandGroup heading="Navigation">
                  {searchResults.navigation.map((item: SearchResult) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3 p-3"
                    >
                      {item.icon}
                      <div className="flex-1">
                        <div className="font-medium">
                          {getHighlightedText(item.title, searchTerm)}
                        </div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">
                            {getHighlightedText(item.description, searchTerm)}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Helper functions
function getNavigationItems(): SearchResult[] {
  return [
    {
      id: "nav-home",
      type: "navigation",
      title: "Dashboard Home",
      description: "Overview of all listings performance",
      url: "/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      id: "nav-properties",
      type: "navigation",
      title: "Properties",
      description: "Individual property analytics",
      url: "/dashboard/properties",
      icon: <Building className="h-4 w-4" />,
    },
    {
      id: "nav-reviews",
      type: "navigation",
      title: "Reviews",
      description: "Review management and insights",
      url: "/dashboard/reviews",
      icon: <MessageSquare className="h-4 w-4" />,
    },

    {
      id: "nav-seed",
      type: "navigation",
      title: "Database Seeding",
      description: "Manage and seed database",
      url: "/dashboard/seed",
      icon: <Database className="h-4 w-4" />,
    },
  ];
}

function getRecentItems(reviews: NormalizedReview[]): SearchResult[] {
  const recentReviews = [...reviews]
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )
    .slice(0, 5);

  return recentReviews.map((review) => ({
    id: `recent-${review.id}`,
    type: "review",
    title: `Review by ${review.guestName}`,
    subtitle: review.listingName,
    url: `/dashboard/reviews?search=${encodeURIComponent(review.guestName)}`,
    icon: <MessageSquare className="h-4 w-4" />,
    metadata: {
      date: new Date(review.submittedAt).toLocaleDateString(),
    },
  }));
}

function getSuggestions(): SearchResult[] {
  return [
    {
      id: "action-filter-high-ratings",
      type: "navigation",
      title: "View High-Rated Reviews",
      description: "Show reviews with ratings 8+ out of 10",
      url: "/dashboard/reviews?minRating=8",
      icon: <Star className="h-4 w-4" />,
    },
    {
      id: "action-filter-recent",
      type: "navigation",
      title: "Recent Reviews",
      description: "Show reviews from the last 30 days",
      url: "/dashboard/reviews?recent=30",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: "action-filter-pending",
      type: "navigation",
      title: "Pending Reviews",
      description: "Show reviews awaiting moderation",
      url: "/dashboard/reviews?status=pending",
      icon: <Filter className="h-4 w-4" />,
    },
  ];
}
