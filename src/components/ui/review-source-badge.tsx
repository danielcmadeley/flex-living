import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Building } from "lucide-react";

interface ReviewSourceBadgeProps {
  source: "google" | "hostaway";
  type?: "host-to-guest" | "guest-to-host";
  className?: string;
  showIcon?: boolean;
}

export function ReviewSourceBadge({
  source,
  type,
  className = "",
  showIcon = true,
}: ReviewSourceBadgeProps) {
  const getSourceConfig = () => {
    switch (source) {
      case "google":
        return {
          label: "Google",
          variant: "secondary" as const,
          className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
          icon: <MapPin className="h-3 w-3" />,
        };
      case "hostaway":
        return {
          label: "Verified Guest",
          variant: "default" as const,
          className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
          icon: <Building className="h-3 w-3" />,
        };
      default:
        return {
          label: source,
          variant: "outline" as const,
          className: "",
          icon: <Star className="h-3 w-3" />,
        };
    }
  };

  const getTypeConfig = () => {
    if (!type) return null;

    switch (type) {
      case "host-to-guest":
        return {
          label: "Host → Guest",
          className: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "guest-to-host":
        return {
          label: "Guest → Host",
          className: "bg-orange-50 text-orange-700 border-orange-200",
        };
      default:
        return null;
    }
  };

  const sourceConfig = getSourceConfig();
  const typeConfig = getTypeConfig();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Badge
        variant={sourceConfig.variant}
        className={`flex items-center gap-1 text-xs font-medium ${sourceConfig.className}`}
      >
        {showIcon && sourceConfig.icon}
        {sourceConfig.label}
      </Badge>

      {typeConfig && (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${typeConfig.className}`}
        >
          {typeConfig.label}
        </Badge>
      )}
    </div>
  );
}

// Preset combinations for common use cases
export function GoogleReviewBadge({ className }: { className?: string }) {
  return (
    <ReviewSourceBadge
      source="google"
      type="guest-to-host"
      className={className}
    />
  );
}

export function VerifiedGuestBadge({
  type,
  className
}: {
  type?: "host-to-guest" | "guest-to-host";
  className?: string;
}) {
  return (
    <ReviewSourceBadge
      source="hostaway"
      type={type}
      className={className}
    />
  );
}

// Source summary component for displaying review counts by source
interface ReviewSourceSummaryProps {
  sources: {
    google: {
      count: number;
      averageRating: number;
      totalReviews: number;
    };
    hostaway: {
      count: number;
      averageRating: number;
      totalReviews: number;
    };
  };
  className?: string;
}

export function ReviewSourceSummary({
  sources,
  className = ""
}: ReviewSourceSummaryProps) {
  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      {sources.google.count > 0 && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-gray-600">
            Google: {sources.google.count} reviews
          </span>
          {sources.google.averageRating > 0 && (
            <span className="text-gray-500">
              ({(sources.google.averageRating / 2).toFixed(1)}★)
            </span>
          )}
        </div>
      )}

      {sources.hostaway.count > 0 && (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">
            Verified: {sources.hostaway.count} reviews
          </span>
          {sources.hostaway.averageRating > 0 && (
            <span className="text-gray-500">
              ({(sources.hostaway.averageRating / 10).toFixed(1)}★)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
