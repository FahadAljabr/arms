"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";
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
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

type Asset = RouterOutputs["asset"]["getAll"][number];

export type AssetsTableProps = {
  title?: React.ReactNode;
  pageSize?: number;
  // Optional filters
  filter?: (asset: Asset) => boolean;
  emptyMessage?: string;
  sector?: string;
  assetTypes?: Array<Asset["assetType"]>;
};

export function AssetsTable({
  title = "Assets",
  pageSize = 10,
  filter,
  emptyMessage = "No assets found.",
  sector,
  assetTypes,
}: AssetsTableProps) {
  const query = sector
    ? api.asset.getBySector.useQuery({ sector })
    : api.asset.getAll.useQuery();
  const { data, isLoading, isError, error, refetch, isFetching } = query;

  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (assetTypes && assetTypes.length > 0) {
      rows = rows.filter((a) => assetTypes.includes(a.assetType));
    }
    if (filter) {
      rows = rows.filter(filter);
    }
    return rows;
  }, [data, assetTypes, filter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Ensure page stays in range when data changes
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, totalPages), p));
  }, [totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title}
          <span className="text-muted-foreground ml-2 text-sm">
            {isFetching ? "(Refreshing…)" : total > 0 ? `(${total} total)` : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
              <div
                key={i}
                className="bg-muted h-10 w-full animate-pulse rounded"
              />
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertTitle>Failed to load assets</AlertTitle>
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
          <div className="text-muted-foreground text-sm">{emptyMessage}</div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">Current KM</TableHead>
                    <TableHead>Last Service</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.id}</TableCell>
                      <TableCell>{a.assetType}</TableCell>
                      <TableCell>{a.model ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusToVariant(a.status)}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{a.sector}</TableCell>
                      <TableCell className="text-right">
                        {a.currentKm ?? "—"}
                      </TableCell>
                      <TableCell>
                        {a.lastServiceAt
                          ? new Date(a.lastServiceAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
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

function statusToVariant(
  status: Asset["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Operational":
      return "default";
    case "In Maintenance":
      return "secondary";
    case "Decommissioned":
      return "outline";
    default:
      return "default";
  }
}
