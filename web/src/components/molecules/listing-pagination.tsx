"use client";

import { useId } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListingPaginationProps {
  page: number;
  pageSize: number;
  pageSizes: readonly number[];
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ListingPagination({
  page,
  pageSize,
  pageSizes,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: ListingPaginationProps) {
  const pageSizeId = useId();
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const firstRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2">
      <p
        role="status"
        className="text-pms-label tabular-nums text-muted-foreground"
      >
        {totalRows === 0
          ? "No results"
          : `${firstRow}–${lastRow} of ${totalRows} results`}
      </p>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Label htmlFor={pageSizeId} className="text-pms-label">
          Rows per page
        </Label>
        <Select
          value={pageSize}
          onValueChange={(value) => {
            if (value !== null) onPageSizeChange(value);
          }}
        >
          <SelectTrigger
            id={pageSizeId}
            className="min-h-pms-touch min-w-pms-touch rounded-pms-control text-pms-label"
          >
            <SelectValue>{pageSize}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Pagination aria-label="Listing pagination" className="mx-0 w-auto">
        <PaginationContent className="flex-wrap gap-2">
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={currentPage === 1}
              className="min-h-pms-touch min-w-pms-touch rounded-pms-control"
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft
                aria-hidden="true"
                className="size-pms-icon-control"
              />
            </Button>
          </PaginationItem>
          <PaginationItem className="text-pms-label tabular-nums">
            Page {currentPage} of {pageCount}
          </PaginationItem>
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={currentPage === pageCount}
              className="min-h-pms-touch min-w-pms-touch rounded-pms-control"
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight
                aria-hidden="true"
                className="size-pms-icon-control"
              />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

/** Result count on the left, page size and pager on the right. */
export function ListingPaginationSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2"
    >
      <Skeleton className="h-[1lh] w-40 text-pms-label" />
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Skeleton className="h-[1lh] w-24 text-pms-label" />
        <Skeleton className="h-pms-touch w-pms-touch rounded-pms-control" />
        <Skeleton className="h-pms-touch w-pms-touch rounded-pms-control" />
        <Skeleton className="h-[1lh] w-20 text-pms-label" />
        <Skeleton className="h-pms-touch w-pms-touch rounded-pms-control" />
      </div>
    </div>
  );
}
