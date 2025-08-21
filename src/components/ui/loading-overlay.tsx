"use client";

import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: "sm" | "md" | "lg";
  overlay?: boolean;
}

export function LoadingOverlay({
  isLoading = false,
  children,
  className,
  spinnerSize = "md",
  overlay = true,
}: LoadingOverlayProps) {
  const spinnerSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && overlay && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
          <div
            className={cn(
              "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
              spinnerSizes[spinnerSize]
            )}
          />
        </div>
      )}
    </div>
  );
}

interface InlineLoadingProps {
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InlineLoading({
  isLoading = false,
  size = "sm",
  className,
}: InlineLoadingProps) {
  if (!isLoading) return null;

  const spinnerSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 inline-block",
        spinnerSizes[size],
        className
      )}
    />
  );
}

interface LoadingButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function LoadingButton({
  isLoading = false,
  children,
  disabled,
  className,
  onClick,
  type = "button",
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center",
        isLoading && "cursor-not-allowed",
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
        </div>
      )}
      <span className={cn(isLoading && "opacity-0")}>{children}</span>
    </button>
  );
}

interface LoadingDotsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingDots({ className, size = "md" }: LoadingDotsProps) {
  const dotSizes = {
    sm: "h-1 w-1",
    md: "h-1.5 w-1.5",
    lg: "h-2 w-2",
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-gray-400 rounded-full animate-pulse",
            dotSizes[size]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export function LoadingSkeleton({
  className,
  lines = 3,
  avatar = false,
}: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 bg-gray-300 rounded",
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  );
}
