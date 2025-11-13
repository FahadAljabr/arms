"use client";

import React, { useMemo, useState } from "react";
import { api, type RouterInputs, type RouterOutputs } from "~/trpc/react";
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
import { Search, Shield, Plus, Filter, Wrench } from "lucide-react";

// Stable list of weapon types used for filtering and display
const WEAPON_TYPES = [
  "Pistol",
  "Rifle",
  "Shotgun",
  "Submachine Gun",
  "Sniper Rifle",
  "Other",
] as const;

export default function WeaponsClient({
  isTechnician,
  canSetLocation = false,
}: {
  isTechnician: boolean;
  canSetLocation?: boolean;
}) {
  // Search & filters
  const [keyword, setKeyword] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string | undefined>(
    undefined,
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Operational" | "In Maintenance" | "Decommissioned"
  >("all");

  // Fetch once; cache used by table as well
  const allQuery = api.asset.getAll.useQuery();

  // Types
  type Asset = RouterOutputs["asset"]["getAll"][number];
  type CreateAssetInput = RouterInputs["asset"]["create"];

  // Weapon types and derived collection
  const weaponTypes = WEAPON_TYPES as unknown as ReadonlyArray<
    Asset["assetType"]
  >;
  const weaponAssets = useMemo(() => {
    const rows = allQuery.data ?? [];
    return rows.filter((a) => weaponTypes.includes(a.assetType));
  }, [allQuery.data, weaponTypes]);

  // Create mutation
  const utils = api.useUtils();
  const createMutation = api.asset.create.useMutation({
    onSuccess: async () => {
      await utils.asset.getAll.invalidate();
      setForm({
        assetType: undefined,
        sector: "",
        model: "",
        commissionedAt: "",
        lastServiceAt: "",
        notes: "",
      });
    },
  });

  // Form state
  const [form, setForm] = useState({
    assetType: undefined as undefined | Asset["assetType"],
    sector: "",
    model: "",
    commissionedAt: "",
    lastServiceAt: "",
    notes: "",
  });

  const submitForm: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!form.assetType || !form.sector) return;

    const payload: CreateAssetInput = {
      assetType: form.assetType,
      sector: form.sector,
      model: form.model || undefined,
      commissionedAt: form.commissionedAt
        ? new Date(form.commissionedAt)
        : undefined,
      lastServiceAt: form.lastServiceAt
        ? new Date(form.lastServiceAt)
        : undefined,
    };

    void createMutation.mutateAsync(payload);
  };

  // Table filter
  const tableFilter = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return (asset: Asset) => {
      if (statusFilter !== "all" && asset.status !== statusFilter) return false;
      if (kw) {
        const hay =
          `${asset.id} ${asset.model ?? ""} ${asset.sector} ${asset.assetType}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    };
  }, [keyword, statusFilter]);

  // Alerts and stats derived from lastServiceAt, sector breakdown, counts by type
  const now = new Date().getTime();
  const days = (ms: number) => Math.floor(ms / (1000 * 60 * 60 * 24));

  const alerts = useMemo(() => {
    let urgent = 0,
      warning = 0,
      info = 0;
    for (const a of weaponAssets) {
      if (!a.lastServiceAt) continue;
      const d = new Date(a.lastServiceAt).getTime();
      const ageDays = days(now - d);
      if (ageDays >= 180) urgent++;
      else if (ageDays >= 90) warning++;
      else if (ageDays >= 30) info++;
    }
    return { urgent, warning, info };
  }, [weaponAssets, now]);

  const sectorStats = useMemo(() => {
    const sectors = ["Police", "Traffic Police", "Military Police"] as const;
    return sectors.map((sec) => {
      const items = weaponAssets.filter((a) => a.sector === sec);
      const total = items.length;
      const active = items.filter((a) => a.status === "Operational").length;
      const inMaint = items.filter((a) => a.status === "In Maintenance").length;
      const overdue = items.filter((a) => {
        if (!a.lastServiceAt) return false;
        const d = new Date(a.lastServiceAt).getTime();
        return days(now - d) >= 180;
      }).length;
      return { sector: sec, total, active, inMaint, overdue };
    });
  }, [weaponAssets, now]);

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of WEAPON_TYPES) c[t] = 0;
    for (const a of weaponAssets) {
      const t = a.assetType as unknown as (typeof WEAPON_TYPES)[number];
      if (WEAPON_TYPES.includes(t)) c[t] = (c[t] ?? 0) + 1;
      else c.Other = (c.Other ?? 0) + 1;
    }
    return {
      Pistol: c.Pistol ?? 0,
      Rifle: c.Rifle ?? 0,
      Shotgun: c.Shotgun ?? 0,
      "Submachine Gun": c["Submachine Gun"] ?? 0,
      "Sniper Rifle": c["Sniper Rifle"] ?? 0,
      Other: c.Other ?? 0,
    } as const;
  }, [weaponAssets]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Weapon Management
          </h1>
          <p className="text-muted-foreground">
            Register, track, and manage weapons inventory
          </p>
        </div>

        {isTechnician ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Register New Weapon
              </CardTitle>
            </CardHeader>
            <CardContent>
              {createMutation.isError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Failed to register</AlertTitle>
                  <AlertDescription>
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : "Unknown error"}
                  </AlertDescription>
                </Alert>
              ) : null}
              <form className="space-y-6" onSubmit={submitForm}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weapon-model">Model / Identifier</Label>
                    <Input
                      id="weapon-model"
                      placeholder="e.g., Glock 17, M4A1"
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
                    <Label htmlFor="weapon-type">Weapon Type *</Label>
                    <Select
                      value={form.assetType}
                      onValueChange={(v: Asset["assetType"]) =>
                        setForm((f) => ({ ...f, assetType: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEAPON_TYPES.map((t) => (
                          <SelectItem key={t} value={t as unknown as string}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending
                      ? "Registering..."
                      : "Register Weapon"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setForm({
                        assetType: undefined,
                        sector: "",
                        model: "",
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
              Weapon Search & Filter
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
                <Button type="button">
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
                    onValueChange={(v: "all" | Asset["status"]) =>
                      setStatusFilter(v)
                    }
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
                  <Shield className="h-5 w-5" /> Registered Weapons
                </span>
              }
              pageSize={10}
              sector={sectorFilter}
              assetTypes={weaponTypes as unknown as Array<Asset["assetType"]>}
              filter={tableFilter}
              canSetLocation={canSetLocation}
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
                      Register New Weapon
                    </Button>
                  ) : null}
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="mr-2 h-4 w-4" />
                    Bulk Schedule Maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export Weapon List
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weapon Types</CardTitle>
              </CardHeader>
              <CardContent>
                {allQuery.isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-muted h-4 w-full animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pistols:</span>
                      <span className="font-medium">
                        {typeCounts.Pistol} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rifles:</span>
                      <span className="font-medium">
                        {typeCounts.Rifle} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shotguns:</span>
                      <span className="font-medium">
                        {typeCounts.Shotgun} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other:</span>
                      <span className="font-medium">
                        {typeCounts.Other} units
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
                    {Array.from({ length: 3 }).map((_, i) => (
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
                        Weapons overdue for service
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
            <CardTitle>Weapon Statistics by Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sector</TableHead>
                    <TableHead>Total Weapons</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>In Maintenance</TableHead>
                    <TableHead>Overdue Service</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {allQuery.isError ? (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Failed to load statistics</AlertTitle>
                <AlertDescription>
                  {allQuery.error instanceof Error
                    ? allQuery.error.message
                    : "Unknown error"}
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
