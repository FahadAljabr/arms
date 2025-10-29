"use client";

import React, { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { AssetsTable } from "../../_components/assets-table";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Search, Car, Plus, Filter, Wrench } from "lucide-react";

export default function VehiclesClient({
  isTechnician,
}: {
  isTechnician: boolean;
}) {
  // Search & filters
  const [keyword, setKeyword] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string | undefined>(
    undefined,
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Operational" | "In Maintenance" | "Decommissioned"
  >("all");

  // Fetch all assets once; this cache will be reused by the table queries
  const allQuery = api.asset.getAll.useQuery();

  // Derived vehicle assets only (Patrol Car, Armored Vehicle)
  const vehicleTypes = useMemo(
    () => ["Patrol Car", "Armored Vehicle"] as const,
    [],
  );
  const vehicleAssets = useMemo(() => {
    const rows = allQuery.data ?? [];
    return rows.filter((a) => vehicleTypes.includes(a.assetType as any));
  }, [allQuery.data, vehicleTypes]);

  // Create mutation for the registration form
  const utils = api.useUtils();
  const createMutation = api.asset.create.useMutation({
    onSuccess: async () => {
      await utils.asset.getAll.invalidate();
      setForm({
        assetType: undefined,
        sector: "",
        model: "",
        currentKm: "",
        commissionedAt: "",
        lastServiceAt: "",
        notes: "",
      });
    },
  });

  // Registration form state (map to schema fields)
  const [form, setForm] = useState({
    assetType: undefined as
      | undefined
      | "Patrol Car"
      | "Armored Vehicle"
      | "Other",
    sector: "",
    model: "",
    currentKm: "",
    commissionedAt: "",
    lastServiceAt: "",
    notes: "",
  });

  const submitForm: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!form.assetType || !form.sector) return;

    const payload = {
      assetType: form.assetType,
      sector: form.sector,
      model: form.model || undefined,
      currentKm: form.currentKm ? Number(form.currentKm) : undefined,
      commissionedAt: form.commissionedAt
        ? new Date(form.commissionedAt)
        : undefined,
      lastServiceAt: form.lastServiceAt
        ? new Date(form.lastServiceAt)
        : undefined,
      // status left as default (Operational)
    } as const;

    try {
      await createMutation.mutateAsync(payload as any);
    } catch (err) {
      // handled by error state
    }
  };

  // Client-side filter predicate for table
  const tableFilter = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return (asset: (typeof vehicleAssets)[number]) => {
      if (statusFilter !== "all" && asset.status !== statusFilter) return false;
      if (kw) {
        const hay =
          `${asset.id} ${asset.model ?? ""} ${asset.sector} ${asset.assetType}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    };
  }, [keyword, statusFilter, vehicleAssets]);

  // Maintenance alerts based on lastServiceAt recency
  const now = new Date().getTime();
  const days = (ms: number) => Math.floor(ms / (1000 * 60 * 60 * 24));
  const alerts = useMemo(() => {
    let urgent = 0,
      warning = 0,
      info = 0;
    for (const a of vehicleAssets) {
      if (!a.lastServiceAt) continue;
      const d = new Date(a.lastServiceAt).getTime();
      const ageDays = days(now - d);
      if (ageDays >= 180) urgent++;
      else if (ageDays >= 90) warning++;
      else if (ageDays >= 30) info++;
    }
    return { urgent, warning, info };
  }, [vehicleAssets, now]);

  // Sector stats (Police, Traffic Police, Military Police)
  const sectors = ["Police", "Traffic Police", "Military Police"] as const;
  const sectorStats = useMemo(() => {
    return sectors.map((sec) => {
      const items = vehicleAssets.filter((a) => a.sector === sec);
      const total = items.length;
      const active = items.filter((a) => a.status === "Operational").length;
      const inMaint = items.filter((a) => a.status === "In Maintenance").length;
      const overdue = items.filter((a) => {
        if (!a.lastServiceAt) return false;
        const d = new Date(a.lastServiceAt).getTime();
        return days(now - d) >= 180; // same threshold as URGENT
      }).length;
      const avgAgeYears = (() => {
        const withDates = items.filter((a) => a.commissionedAt);
        if (withDates.length === 0) return null;
        const sumYears = withDates.reduce((sum, a) => {
          const ageMs = now - new Date(a.commissionedAt!).getTime();
          return sum + ageMs / (1000 * 60 * 60 * 24 * 365.25);
        }, 0);
        return sumYears / withDates.length;
      })();
      return { sector: sec, total, active, inMaint, overdue, avgAgeYears };
    });
  }, [vehicleAssets, now]);

  // Counts by type (sidebar)
  const typeCounts = useMemo(() => {
    const patrol = vehicleAssets.filter(
      (a) => a.assetType === "Patrol Car",
    ).length;
    const armored = vehicleAssets.filter(
      (a) => a.assetType === "Armored Vehicle",
    ).length;
    const other = vehicleAssets.filter(
      (a) => a.assetType !== "Patrol Car" && a.assetType !== "Armored Vehicle",
    ).length;
    return { patrol, armored, other };
  }, [vehicleAssets]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle Management
          </h1>
          <p className="text-muted-foreground">
            Register, track, and manage military and security vehicles
          </p>
        </div>

        {isTechnician ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Register New Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              {createMutation.isError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Failed to register</AlertTitle>
                  <AlertDescription>
                    {String(
                      (createMutation.error as any)?.message ?? "Unknown error",
                    )}
                  </AlertDescription>
                </Alert>
              ) : null}
              <form className="space-y-6" onSubmit={submitForm}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-model">Model / Identifier</Label>
                    <Input
                      id="vehicle-model"
                      placeholder="e.g., Camry, F-150, APC-012"
                      value={form.model}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, model: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector *</Label>
                    <Select
                      value={form.sector || undefined}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, sector: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Police">Police</SelectItem>
                        <SelectItem value="Traffic Police">
                          Traffic Police
                        </SelectItem>
                        <SelectItem value="Military Police">
                          Military Police
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-type">Vehicle Type *</Label>
                    <Select
                      value={form.assetType}
                      onValueChange={(v: any) =>
                        setForm((f) => ({ ...f, assetType: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Patrol Car">Patrol Car</SelectItem>
                        <SelectItem value="Armored Vehicle">
                          Armored Vehicle
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentKm">Current KM</Label>
                    <Input
                      id="currentKm"
                      type="number"
                      inputMode="numeric"
                      placeholder="e.g., 12345"
                      value={form.currentKm}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, currentKm: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="commissionedAt">
                      Commissioned (Purchase) Date
                    </Label>
                    <Input
                      id="commissionedAt"
                      type="date"
                      value={form.commissionedAt}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          commissionedAt: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastServiceAt">Last Service Date</Label>
                    <Input
                      id="lastServiceAt"
                      type="date"
                      value={form.lastServiceAt}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          lastServiceAt: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special equipment, modifications, etc. (not stored)"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending
                      ? "Registering..."
                      : "Register Vehicle"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setForm({
                        assetType: undefined,
                        sector: "",
                        model: "",
                        currentKm: "",
                        commissionedAt: "",
                        lastServiceAt: "",
                        notes: "",
                      })
                    }
                    disabled={createMutation.isPending}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Vehicle Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by ID, Model, Sector, or Type..."
                  className="flex-1"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <Button onClick={() => void 0}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Filter by Sector:</Label>
                  <Select
                    value={sectorFilter ?? "all"}
                    onValueChange={(v) =>
                      setSectorFilter(v === "all" ? undefined : v)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="Police">Police</SelectItem>
                      <SelectItem value="Traffic Police">
                        Traffic Police
                      </SelectItem>
                      <SelectItem value="Military Police">
                        Military Police
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Status:</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(v: any) => setStatusFilter(v)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Operational">Active</SelectItem>
                      <SelectItem value="In Maintenance">
                        In Maintenance
                      </SelectItem>
                      <SelectItem value="Decommissioned">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AssetsTable
              title={
                <span className="flex items-center gap-2">
                  <Car className="h-5 w-5" /> Registered Vehicles
                </span>
              }
              pageSize={10}
              sector={sectorFilter}
              assetTypes={["Patrol Car", "Armored Vehicle"]}
              filter={tableFilter}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isTechnician ? (
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Register New Vehicle
                    </Button>
                  ) : null}
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="mr-2 h-4 w-4" />
                    Bulk Schedule Maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export Vehicle List
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Import Vehicle Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Types</CardTitle>
              </CardHeader>
              <CardContent>
                {allQuery.isLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-muted h-4 w-full animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Patrol Cars:</span>
                      <span className="font-medium">
                        {typeCounts.patrol} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Armored Vehicles:</span>
                      <span className="font-medium">
                        {typeCounts.armored} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other:</span>
                      <span className="font-medium">
                        {typeCounts.other} units
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {allQuery.isLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-muted h-4 w-full animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="font-semibold text-red-600">
                          URGENT ({alerts.urgent})
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Vehicles overdue for service
                      </p>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="font-semibold text-yellow-600">
                          WARNING ({alerts.warning})
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Service due within 30-180 days
                      </p>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="font-semibold text-blue-600">
                          INFO ({alerts.info})
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Recent service within 30-90 days
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Statistics by Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sector</TableHead>
                    <TableHead>Total Vehicles</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>In Maintenance</TableHead>
                    <TableHead>Overdue Service</TableHead>
                    <TableHead>Average Age (Years)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectorStats.map((s) => (
                    <TableRow key={s.sector}>
                      <TableCell className="font-medium">{s.sector}</TableCell>
                      <TableCell>{s.total}</TableCell>
                      <TableCell>{s.active}</TableCell>
                      <TableCell>{s.inMaint}</TableCell>
                      <TableCell>{s.overdue}</TableCell>
                      <TableCell>
                        {s.avgAgeYears == null ? "—" : s.avgAgeYears.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {allQuery.isError ? (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Failed to load statistics</AlertTitle>
                <AlertDescription>
                  {String((allQuery.error as any)?.message ?? "Unknown error")}
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
