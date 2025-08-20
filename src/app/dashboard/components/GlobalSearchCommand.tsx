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
  BarChart3,
  Database,
  Settings,
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
        size="sm"
        onClick={() => setOpen(true)}
        className={`relative ${className}`}
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline-flex">Search...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search reviews, properties, guests, or navigate..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>
            <div className="text-center py-6">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-sm text-muted-foreground">
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
                    className="flex items-center gap-3 p-3"
                  >
                    {item.icon}
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
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
                      className="flex items-center gap-3 p-3"
                    >
                      {item.icon}
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.subtitle}
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

              {/* Quick Actions */}
              <CommandGroup heading="Quick Actions">
                {searchResults.type === "default" &&
                  searchResults.suggestions.map((item: SearchResult) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3 p-3"
                    >
                      {item.icon}
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">
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
                        className="flex items-start gap-3 p-3"
                      >
                        {item.icon}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">
                            {getHighlightedText(item.title, searchTerm)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getHighlightedText(
                              item.subtitle || "",
                              searchTerm,
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {getHighlightedText(item.description, searchTerm)}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {item.badge && (
                              <Badge variant="outline" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                            {item.metadata?.rating && (
                              <div className="flex items-center gap-1 text-xs">
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
      id: "nav-analytics",
      type: "navigation",
      title: "Analytics",
      description: "Advanced analytics and reports",
      url: "/dashboard/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: "nav-search",
      type: "navigation",
      title: "Search",
      description: "Search and filter reviews",
      url: "/dashboard/search",
      icon: <Search className="h-4 w-4" />,
    },
    {
      id: "nav-seed",
      type: "navigation",
      title: "Database Seeding",
      description: "Manage and seed database",
      url: "/dashboard/seed",
      icon: <Database className="h-4 w-4" />,
    },
    {
      id: "nav-settings",
      type: "navigation",
      title: "Settings",
      description: "Application settings",
      url: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
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
