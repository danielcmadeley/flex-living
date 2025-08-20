"use client";

import { useMemo, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";

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
    console.log("[ReviewsTable] Force refresh triggered");
    // Clear all review caches
    queryClient.removeQueries({ queryKey: ["reviews"] });
    // Force refetch
    queryClient.refetchQueries({ queryKey: ["reviews"], type: "all" });
    console.log("[ReviewsTable] Cache cleared and refetch initiated");
  };

  const columns: ColumnDef<NormalizedReview>[] = useMemo(
    () => [
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
    [onStatusChange],
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
                      <TableCell key={cell.id}>
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
