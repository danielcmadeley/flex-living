"use client";

import type { User } from "@supabase/supabase-js";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { ReviewsPage } from "../pages/ReviewsPage";
import { ToastContainer } from "@/components/ui/toast";
import { useUIState, useUIActions, useFilters } from "@/stores/dashboard-store";
import { useReviews } from "@/hooks/use-reviews";

interface ReviewsPageClientProps {
  user: User;
}

export function ReviewsPageClient({ user }: ReviewsPageClientProps) {
  const uiState = useUIState();
  const { dismissToast } = useUIActions();
  const filters = useFilters();

  // Fetch reviews for sidebar
  const { reviews } = useReviews({
    ...filters,
    includeStats: false,
  });

  return (
    <DashboardSidebar user={user} reviews={reviews}>
      <ReviewsPage />

      {/* Toast notifications */}
      {uiState.toast && (
        <ToastContainer
          toasts={[{ ...uiState.toast, onDismiss: dismissToast }]}
          onDismiss={dismissToast}
        />
      )}
    </DashboardSidebar>
  );
}
