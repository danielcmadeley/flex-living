import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useMemo } from "react";
import type { Draft } from "immer";
import { enableMapSet } from "immer";

// Enable MapSet plugin for Immer to work with Set objects
enableMapSet();

// Types
export interface FilterState {
  searchTerm?: string;
  status?: "published" | "pending" | "draft";
  type?: "host-to-guest" | "guest-to-host";
  listingName?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: "date" | "rating" | "guestName";
  sortOrder: "asc" | "desc";
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  includeStats?: boolean;
  groupBy?: "listing" | "type";
  limit?: number;
}

export interface BulkActionState {
  selectedReviews: Set<number>;
  isSelectAllMode: boolean;
  pendingAction?: "publish" | "unpublish" | "delete";
  isPerformingBulkAction: boolean;
}

export interface UIState {
  viewMode: "grid" | "table";
  sidebarCollapsed: boolean;
  activeTab: "overview" | "reviews" | "properties" | "analytics";
  showFilters: boolean;
  isLoading: boolean;
  toast?: {
    message: string;
    type: "success" | "error" | "info";
    id: string;
  };
}

export interface DashboardState {
  // State
  filters: FilterState;
  bulkActions: BulkActionState;
  ui: UIState;

  // Filter Actions
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSearchTerm: (term: string | undefined) => void;
  setStatus: (status: FilterState["status"]) => void;
  setListingName: (name: string | undefined) => void;
  setRatingRange: (min?: number, max?: number) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setDateRange: (from?: Date, to?: Date) => void;

  // Bulk Action Methods
  toggleReviewSelection: (reviewId: number) => void;
  selectAllReviews: (reviewIds: number[]) => void;
  clearSelection: () => void;
  setBulkAction: (action: BulkActionState["pendingAction"]) => void;
  setPerformingBulkAction: (isPerforming: boolean) => void;

  // UI Actions
  setViewMode: (mode: "grid" | "table") => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: UIState["activeTab"]) => void;
  toggleFilters: () => void;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  dismissToast: () => void;
  resetStore: () => void;

  // Computed values
  hasActiveFilters: () => boolean;
  selectedCount: () => number;
  isReviewSelected: (reviewId: number) => boolean;
}

// Default values
const defaultFilters: FilterState = {
  sortOrder: "desc",
  includeStats: true,
  limit: 50,
};

const defaultBulkActions: BulkActionState = {
  selectedReviews: new Set(),
  isSelectAllMode: false,
  isPerformingBulkAction: false,
};

const defaultUI: UIState = {
  viewMode: "grid",
  sidebarCollapsed: false,
  activeTab: "overview",
  showFilters: false,
  isLoading: false,
};

// Store creation with middleware
export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      immer<DashboardState>((set, get) => ({
        // Initial state
        filters: defaultFilters,
        bulkActions: defaultBulkActions,
        ui: defaultUI,

        // Filter actions
        setFilters: (newFilters) =>
          set((state: Draft<DashboardState>) => {
            state.filters = { ...state.filters, ...newFilters };
          }),

        resetFilters: () =>
          set((state: Draft<DashboardState>) => {
            state.filters = defaultFilters;
            state.bulkActions.selectedReviews = new Set();
          }),

        setSearchTerm: (term) =>
          set((state: Draft<DashboardState>) => {
            state.filters.searchTerm = term;
          }),

        setStatus: (status) =>
          set((state: Draft<DashboardState>) => {
            state.filters.status = status;
          }),

        setListingName: (name) =>
          set((state: Draft<DashboardState>) => {
            state.filters.listingName = name;
          }),

        setRatingRange: (min, max) =>
          set((state: Draft<DashboardState>) => {
            state.filters.minRating = min;
            state.filters.maxRating = max;
          }),

        setSortOrder: (order) =>
          set((state: Draft<DashboardState>) => {
            state.filters.sortOrder = order;
          }),

        setDateRange: (from, to) =>
          set((state: Draft<DashboardState>) => {
            state.filters.dateRange = from || to ? { from, to } : undefined;
          }),

        // Bulk action methods
        toggleReviewSelection: (reviewId) =>
          set((state: Draft<DashboardState>) => {
            const currentSelected = new Set(state.bulkActions.selectedReviews);
            if (currentSelected.has(reviewId)) {
              currentSelected.delete(reviewId);
            } else {
              currentSelected.add(reviewId);
            }
            state.bulkActions.selectedReviews = currentSelected;
            state.bulkActions.isSelectAllMode = false;
          }),

        selectAllReviews: (reviewIds) =>
          set((state: Draft<DashboardState>) => {
            if (state.bulkActions.isSelectAllMode) {
              state.bulkActions.selectedReviews = new Set();
              state.bulkActions.isSelectAllMode = false;
            } else {
              state.bulkActions.selectedReviews = new Set(reviewIds);
              state.bulkActions.isSelectAllMode = true;
            }
          }),

        clearSelection: () =>
          set((state: Draft<DashboardState>) => {
            state.bulkActions.selectedReviews = new Set();
            state.bulkActions.isSelectAllMode = false;
            state.bulkActions.pendingAction = undefined;
          }),

        setBulkAction: (action) =>
          set((state: Draft<DashboardState>) => {
            state.bulkActions.pendingAction = action;
          }),

        setPerformingBulkAction: (isPerforming) =>
          set((state: Draft<DashboardState>) => {
            state.bulkActions.isPerformingBulkAction = isPerforming;
          }),

        // UI actions
        setViewMode: (mode) =>
          set((state: Draft<DashboardState>) => {
            state.ui.viewMode = mode;
          }),

        toggleSidebar: () =>
          set((state: Draft<DashboardState>) => {
            state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
          }),

        setActiveTab: (tab) =>
          set((state: Draft<DashboardState>) => {
            state.ui.activeTab = tab;
          }),

        toggleFilters: () =>
          set((state: Draft<DashboardState>) => {
            state.ui.showFilters = !state.ui.showFilters;
          }),

        setLoading: (loading) =>
          set((state: Draft<DashboardState>) => {
            state.ui.isLoading = loading;
          }),

        showToast: (message, type) =>
          set((state: Draft<DashboardState>) => {
            state.ui.toast = {
              message,
              type,
              id: Date.now().toString(),
            };
          }),

        dismissToast: () =>
          set((state: Draft<DashboardState>) => {
            state.ui.toast = undefined;
          }),

        resetStore: () =>
          set((state: Draft<DashboardState>) => {
            state.filters = defaultFilters;
            state.bulkActions = defaultBulkActions;
            state.ui = defaultUI;
          }),

        // Computed values
        hasActiveFilters: () => {
          const { filters } = get();
          return Boolean(
            filters.searchTerm ||
              filters.status ||
              filters.type ||
              filters.listingName ||
              filters.minRating ||
              filters.maxRating ||
              filters.dateRange,
          );
        },

        selectedCount: () => {
          return get().bulkActions.selectedReviews.size;
        },

        isReviewSelected: (reviewId) => {
          return get().bulkActions.selectedReviews.has(reviewId);
        },
      })),
      {
        name: "flex-living-dashboard",
        partialize: (state) => ({
          filters: state.filters,
          ui: {
            viewMode: state.ui.viewMode,
            sidebarCollapsed: state.ui.sidebarCollapsed,
            activeTab: state.ui.activeTab,
          },
        }),
      },
    ),
    {
      name: "Dashboard Store",
    },
  ),
);

// Selector hooks for better performance
export const useFilters = () => useDashboardStore((state) => state.filters);

// Individual action hooks to avoid object recreation
export const useFilterActions = () => {
  const setFilters = useDashboardStore((state) => state.setFilters);
  const resetFilters = useDashboardStore((state) => state.resetFilters);
  const setSearchTerm = useDashboardStore((state) => state.setSearchTerm);
  const setStatus = useDashboardStore((state) => state.setStatus);
  const setListingName = useDashboardStore((state) => state.setListingName);
  const setRatingRange = useDashboardStore((state) => state.setRatingRange);
  const setSortOrder = useDashboardStore((state) => state.setSortOrder);
  const setDateRange = useDashboardStore((state) => state.setDateRange);

  return useMemo(
    () => ({
      setFilters,
      resetFilters,
      setSearchTerm,
      setStatus,
      setListingName,
      setRatingRange,
      setSortOrder,
      setDateRange,
    }),
    [
      setFilters,
      resetFilters,
      setSearchTerm,
      setStatus,
      setListingName,
      setRatingRange,
      setSortOrder,
      setDateRange,
    ],
  );
};

export const useBulkActions = () =>
  useDashboardStore((state) => state.bulkActions);

export const useBulkActionMethods = () => {
  const toggleReviewSelection = useDashboardStore(
    (state) => state.toggleReviewSelection,
  );
  const selectAllReviews = useDashboardStore((state) => state.selectAllReviews);
  const clearSelection = useDashboardStore((state) => state.clearSelection);
  const setBulkAction = useDashboardStore((state) => state.setBulkAction);
  const setPerformingBulkAction = useDashboardStore(
    (state) => state.setPerformingBulkAction,
  );

  return useMemo(
    () => ({
      toggleReviewSelection,
      selectAllReviews,
      clearSelection,
      setBulkAction,
      setPerformingBulkAction,
    }),
    [
      toggleReviewSelection,
      selectAllReviews,
      clearSelection,
      setBulkAction,
      setPerformingBulkAction,
    ],
  );
};

export const useUIState = () => useDashboardStore((state) => state.ui);

export const useUIActions = () => {
  const setViewMode = useDashboardStore((state) => state.setViewMode);
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  const setActiveTab = useDashboardStore((state) => state.setActiveTab);
  const toggleFilters = useDashboardStore((state) => state.toggleFilters);
  const setLoading = useDashboardStore((state) => state.setLoading);
  const showToast = useDashboardStore((state) => state.showToast);
  const dismissToast = useDashboardStore((state) => state.dismissToast);

  return useMemo(
    () => ({
      setViewMode,
      toggleSidebar,
      setActiveTab,
      toggleFilters,
      setLoading,
      showToast,
      dismissToast,
    }),
    [
      setViewMode,
      toggleSidebar,
      setActiveTab,
      toggleFilters,
      setLoading,
      showToast,
      dismissToast,
    ],
  );
};

export const useComputedValues = () => {
  const hasActiveFilters = useDashboardStore((state) => state.hasActiveFilters);
  const selectedCount = useDashboardStore((state) => state.selectedCount);
  const isReviewSelected = useDashboardStore((state) => state.isReviewSelected);

  return useMemo(
    () => ({
      hasActiveFilters,
      selectedCount,
      isReviewSelected,
    }),
    [hasActiveFilters, selectedCount, isReviewSelected],
  );
};
