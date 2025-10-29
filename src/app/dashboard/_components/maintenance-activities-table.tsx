"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { api, type RouterOutputs } from "~/trpc/react";
type Record = RouterOutputs["maintenenceRecordRouter"]["getAll"][number];

function getStatusVariant(status: Record["status"]) {
  switch (status) {
    case "Closed":
      return "default";
    case "In Progress":
      return "secondary";
    case "Open":
      return "outline";
    default:
      return "outline";
  }
}

export function MaintenanceActivitiesTable() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    api.maintenenceRecordRouter.getAll.useQuery();

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // reset to first page on refresh
    setPage(1);
  }, [isFetching]);

  const items = useMemo(() => data ?? [], [data]);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Recent Maintenance Activities
          <span className="text-muted-foreground ml-2 text-sm">
            {isFetching ? "(Refreshing…)" : total > 0 ? `(${total} total)` : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted h-10 w-full animate-pulse rounded"
              />
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertTitle>Failed to load activities</AlertTitle>
            <AlertDescription>
              {String(
                (error as unknown as { message?: string })?.message ??
                  "Unknown error",
              )}
              <div className="mt-3">
                <Button variant="outline" onClick={() => void refetch()}>
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : total === 0 ? (
          <div className="text-muted-foreground text-sm">
            No maintenance activities found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Asset ID</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Sector
                    </TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-medium">
                        {rec.assetId}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {rec.asset?.assetType ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {rec.asset?.sector ?? "—"}
                      </TableCell>
                      <TableCell>
                        {rec.problemDescription?.slice(0, 80) ?? "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {rec.issueDate
                          ? new Date(rec.issueDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(rec.status)}>
                          {rec.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-muted-foreground text-xs">
                Showing {start + 1}-{Math.min(start + pageSize, total)} of{" "}
                {total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <div className="text-sm">
                  Page {page} of {totalPages}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
