"use client";

import { useMemo, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { NormalizedReview } from "@/lib/schemas";
import { ReviewStatusSelect } from "./ReviewStatusSelect";
import { logger } from "@/lib/utils/logger";
import { useQueryClient } from "@tanstack/react-query";
import {
  useBulkActions,
  useBulkActionMethods,
  useComputedValues,
  useUIActions,
} from "@/stores/dashboard-store";
import { BulkActionsBar } from "@/components/BulkActionsBar";

interface ReviewsTableProps {
  reviews: NormalizedReview[];
  onStatusChange?: (
    reviewId: number,
    newStatus: "published" | "pending" | "draft",
  ) => void;
  isLoading?: boolean;
}

export function ReviewsTable({
  reviews,
  onStatusChange,
  isLoading,
}: ReviewsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const queryClient = useQueryClient();

  // Bulk actions from Zustand store
  const bulkActions = useBulkActions();
  const {
    toggleReviewSelection,
    selectAllReviews,
    clearSelection,
    setBulkAction,
    setPerformingBulkAction,
  } = useBulkActionMethods();
  const { selectedCount, isReviewSelected } = useComputedValues();
  const { showToast } = useUIActions();

  // Bulk action handlers
  const handleBulkStatusChange = async (
    newStatus: "published" | "pending" | "draft",
  ) => {
    const selectedIds = Array.from(bulkActions.selectedReviews);
    if (selectedIds.length === 0) return;

    setPerformingBulkAction(true);
    setBulkAction(
      newStatus === "published"
        ? "publish"
        : newStatus === "pending"
          ? "unpublish"
          : "delete",
    );

    try {
      // Update each selected review
      const promises = selectedIds.map((id) =>
        fetch(`/api/reviews/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }),
      );

      await Promise.all(promises);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["reviews"] });

      showToast(
        `Updated ${selectedIds.length} reviews to ${newStatus}`,
        "success",
      );
      clearSelection();
    } catch {
      showToast("Failed to update reviews", "error");
    } finally {
      setPerformingBulkAction(false);
      setBulkAction(undefined);
    }
  };

  const handleSelectAll = useCallback(() => {
    const reviewIds = reviews.map((review) => review.id);
    selectAllReviews(reviewIds);
  }, [reviews, selectAllReviews]);

  const exportToCSV = () => {
    const headers = [
      "Guest Name",
      "Property",
      "Type",
      "Rating",
      "Status",
      "Comment",
      "Date",
    ];

    const csvData = reviews.map((review) => [
      review.guestName,
      review.listingName,
      review.type === "host-to-guest" ? "Host → Guest" : "Guest → Host",
      review.overallRating?.toString() || "",
      review.status,
      `"${review.comment.replace(/"/g, '""')}"`, // Escape quotes in comments
      new Date(review.submittedAt).toLocaleDateString("en-US"),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `flex-living-reviews-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const forceRefresh = () => {
    const tableLogger = logger.child("ReviewsTable");
    tableLogger.debug("Force refresh triggered");
    // Clear all review caches
    queryClient.removeQueries({ queryKey: ["reviews"] });
    // Force refetch
    queryClient.refetchQueries({ queryKey: ["reviews"], type: "all" });
    tableLogger.debug("Cache cleared and refetch initiated");
  };

  const columns: ColumnDef<NormalizedReview>[] = useMemo(
    () => [
      // Selection column
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={bulkActions.isSelectAllMode}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={isReviewSelected(row.original.id)}
            onCheckedChange={() => toggleReviewSelection(row.original.id)}
            aria-label={`Select review ${row.original.id}`}
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "guestName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 font-semibold"
            >
              Guest
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const review = row.original;
          return (
            <div>
              <div className="font-medium">{review.guestName}</div>
              <div className="text-sm text-muted-foreground">
                {review.listingName}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          return (
            <Badge variant={type === "host-to-guest" ? "default" : "secondary"}>
              {type === "host-to-guest" ? "Host → Guest" : "Guest → Host"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "overallRating",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 font-semibold"
            >
              Rating
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const rating = row.getValue("overallRating") as number | null;
          if (rating === null)
            return <span className="text-muted-foreground">-</span>;

          return (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
          );
        },
      },
      {
        accessorKey: "comment",
        header: "Review",
        cell: ({ row }) => {
          const comment = row.getValue("comment") as string;
          return (
            <div className="max-w-md">
              <p className="text-sm line-clamp-2">{comment}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const review = row.original;
          const status = review.status as "published" | "pending" | "draft";

          return (
            <ReviewStatusSelect
              reviewId={review.id}
              currentStatus={status}
              onStatusChange={onStatusChange}
            />
          );
        },
      },
      {
        accessorKey: "submittedAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 font-semibold"
            >
              Date
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = row.getValue("submittedAt") as Date;
          return (
            <div className="text-sm">
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          );
        },
      },
    ],
    [
      onStatusChange,
      bulkActions.isSelectAllMode,
      handleSelectAll,
      isReviewSelected,
      toggleReviewSelection,
    ],
  );

  const table = useReactTable({
    data: reviews,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reviews ({reviews.length})</span>
          <div className="flex items-center gap-2">
            <Button
              onClick={forceRefresh}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-blue-600"
            >
              Force Refresh
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Badge variant="outline">
              {table.getFilteredRowModel().rows.length} visible
            </Badge>
          </div>
        </CardTitle>

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedCount()}
          isPerformingAction={bulkActions.isPerformingBulkAction}
          onClearSelection={clearSelection}
          onBulkStatusChange={handleBulkStatusChange}
          className="mt-4"
        />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          isReviewSelected(row.original.id) ? "bg-blue-50" : ""
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No reviews found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
