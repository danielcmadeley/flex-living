"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";
import { ROUTES, FEATURES } from "@/lib/constants";

// ============================================================================
// Types
// ============================================================================
interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

// ============================================================================
// Error Boundary Component
// ============================================================================
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private logger = logger.child("ErrorBoundary");

  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logger.error("Component error caught", error, {
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Default error UI
    return (
      <DefaultErrorFallback
        error={this.state.error}
        errorInfo={this.state.errorInfo}
      />
    );
  }
}

// ============================================================================
// Default Error Fallback Component
// ============================================================================
function DefaultErrorFallback({
  error,
  errorInfo,
}: {
  error?: Error;
  errorInfo?: ErrorInfo;
}) {
  const handleRetry = () => window.location.reload();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <ErrorHeader />

        {FEATURES.SHOW_DEBUG_INFO && error && (
          <ErrorDetails error={error} errorInfo={errorInfo} />
        )}

        <ErrorActions onRetry={handleRetry} />
        <SupportMessage />
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================
function ErrorHeader() {
  return (
    <div className="mb-4">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h1>
      <p className="text-gray-600 text-sm mb-4">
        We encountered an unexpected error. Please try refreshing the page or
        contact support if the problem persists.
      </p>
    </div>
  );
}

function ErrorDetails({
  error,
  errorInfo,
}: {
  error: Error;
  errorInfo?: ErrorInfo;
}) {
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-left">
      <h3 className="font-medium text-red-800 text-sm mb-1">Error Details:</h3>
      <p className="text-red-700 text-xs font-mono break-all">
        {error.message}
      </p>
      {errorInfo && (
        <details className="mt-2">
          <summary className="text-red-700 text-xs cursor-pointer">
            Stack Trace
          </summary>
          <pre className="text-red-700 text-xs mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {errorInfo.componentStack}
          </pre>
        </details>
      )}
    </div>
  );
}

function ErrorActions({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={onRetry}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCcw className="h-4 w-4" />
        Try Again
      </button>
      <Link
        href={ROUTES.HOME}
        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Home className="h-4 w-4" />
        Go Home
      </Link>
    </div>
  );
}

function SupportMessage() {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <p className="text-xs text-gray-500">
        If this problem continues, please contact our support team.
      </p>
    </div>
  );
}

// ============================================================================
// Error Fallback Component (for inline use)
// ============================================================================
export function ErrorFallback({
  error,
  onRetry,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
}: ErrorFallbackProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
      <h3 className="font-medium text-red-800 mb-2">{title}</h3>
      <p className="text-red-700 text-sm mb-4">{description}</p>

      {FEATURES.SHOW_DEBUG_INFO && error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-left">
          <p className="text-red-800 text-xs font-mono break-all">
            {error.message}
          </p>
        </div>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

// ============================================================================
// HOC for wrapping components with error boundary
// ============================================================================
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
