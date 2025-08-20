"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: "Home", href: "/" }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-gray-600", className)}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;

        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-blue-600 transition-colors font-medium"
              >
                {index === 0 && showHome ? (
                  <span className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            ) : (
              <span
                className={cn(
                  "font-medium",
                  isLast ? "text-gray-900" : "text-gray-600"
                )}
              >
                {index === 0 && showHome ? (
                  <span className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Simplified version for common use cases
interface SimpleBreadcrumbProps {
  currentPage: string;
  parentPage?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function SimpleBreadcrumb({
  currentPage,
  parentPage,
  className
}: SimpleBreadcrumbProps) {
  const items: BreadcrumbItem[] = [];

  if (parentPage) {
    items.push({
      label: parentPage.label,
      href: parentPage.href
    });
  }

  items.push({
    label: currentPage,
    isActive: true
  });

  return <Breadcrumb items={items} className={className} />;
}

// Hook for generating breadcrumbs from pathname
export function useBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;

    // Convert segment to readable label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      label: decodeURIComponent(label),
      href: isLast ? undefined : href,
      isActive: isLast
    };
  });
}
