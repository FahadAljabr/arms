"use client";
import React, { useMemo, useState } from "react";
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
import { CalendarIcon, ClockIcon, UserIcon, AlertTriangle } from "lucide-react";
import { api } from "~/trpc/react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export default function MaintenancePage() {
  // Queries
  const {
    data: maintenanceRecords,
    isLoading: recordsLoading,
    isError: recordsError,
    error: recordsErr,
  } = api.maintenenceRecord.getAll.useQuery();

  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
    error: plansErr,
  } = api.maintenancePlan.getAll.useQuery();

  const {
    data: spareParts,
    isLoading: partsLoading,
    isError: partsError,
  } = api.spareParts.getall.useQuery();

  // Assets for selection in form (nice UX) — optional
  const {
    data: assets,
    isLoading: assetsLoading,
    isError: assetsError,
  } = api.asset.getAll.useQuery();

  const utils = api.useUtils();

  // Create Plan mutation
  const createPlan = api.maintenancePlan.create.useMutation({
    onSuccess: async () => {
      // refresh plans and dependent UIs
      await utils.maintenancePlan.getAll.invalidate();
      // reset form state
      setForm({
        assetId: "",
        maintenanceType: "",
        scheduledDate: "",
        severity: "",
        technician: "",
        estimatedHours: "",
        description: "",
      });
      setSubmitMsg({ type: "success", text: "Maintenance plan scheduled." });
    },
    onError: (err) => {
      setSubmitMsg({
        type: "error",
        text: err.message ?? "Failed to create plan",
      });
    },
  });

  // Local form state (controlled inputs)
  const [form, setForm] = useState({
    assetId: "",
    maintenanceType: "",
    scheduledDate: "",
    severity: "",
    technician: "",
    estimatedHours: "",
    description: "",
  });
  const [submitMsg, setSubmitMsg] = useState<null | {
    type: "success" | "error";
    text: string;
  }>(null);

  // Local pagination for active maintenance table
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const activeRecords = useMemo(() => {
    const all = (maintenanceRecords ?? []).filter((r) => r.status !== "Closed");
    return all;
  }, [maintenanceRecords]);

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return activeRecords.slice(start, start + pageSize);
  }, [activeRecords, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(activeRecords.length / pageSize)),
    [activeRecords.length],
  );

  const getSeverityColor = (
    severity: string | null | undefined,
  ): BadgeVariant => {
    if (!severity) return "default";
    const s = severity.toLowerCase();
    if (s === "critical" || s === "high") return "destructive";
    if (s === "medium") return "default";
    if (s === "low") return "secondary";
    return "default";
  };

  // Calendar: bucket maintenance plans and records by date within the current month
  const calendarDays = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      items: [] as Array<{
        id: string;
        task: string;
        severity: "low" | "medium" | "high";
      }>,
    }));

    // Plans due this month
    (plans ?? []).forEach((p) => {
      if (!p.nextDueDate) return;
      const due = new Date(p.nextDueDate as unknown as string);
      if (due.getFullYear() === year && due.getMonth() === month) {
        const d = due.getDate();
        const severity = "medium" as const;
        const id = `Asset-${p.assetId}`;
        days[d - 1]?.items.push({ id, task: "Plan Due", severity });
      }
    });

    // Record events: issues and completions in this month
    (maintenanceRecords ?? []).forEach((r) => {
      // Issue date
      const issue = new Date(r.issueDate as unknown as string);
      if (issue.getFullYear() === year && issue.getMonth() === month) {
        const d = issue.getDate();
        const sev = (r.severity ?? "Medium") as unknown as
          | "Low"
          | "Medium"
          | "High";
        const map: Record<string, "low" | "medium" | "high"> = {
          low: "low",
          medium: "medium",
          high: "high",
        };
        const s = map[(sev as string).toLowerCase()] ?? "medium";
        const id = r.asset ? `Asset-${r.asset.id}` : String(r.assetId);
        days[d - 1]?.items.push({ id, task: "Issue Reported", severity: s });
      }
      // Completion date
      if (r.completionDate) {
        const comp = new Date(r.completionDate as unknown as string);
        if (comp.getFullYear() === year && comp.getMonth() === month) {
          const d = comp.getDate();
          const id = r.asset ? `Asset-${r.asset.id}` : String(r.assetId);
          days[d - 1]?.items.push({ id, task: "Completed", severity: "low" });
        }
      }
    });
    return days;
  }, [plans, maintenanceRecords]);

  const timelineEvents = useMemo(() => {
    const rows = (maintenanceRecords ?? []).slice().sort((a, b) => {
      const aTime = new Date(a.issueDate).getTime();
      const bTime = new Date(b.issueDate).getTime();
      return bTime - aTime;
    });

    return rows.slice(0, 10).map((r) => ({
      date: new Date(r.issueDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      title: `${r.asset?.model ?? "Asset"} - ${r.problemDescription}`,
      status:
        r.status === "Closed"
          ? `Closed${r.completionDate ? ` on ${new Date(r.completionDate).toLocaleDateString()}` : ""}`
          : r.status,
    }));
  }, [maintenanceRecords]);

  // Today’s Schedule: plans due in the next 7 days
  const upcomingPlans = useMemo(() => {
    const today = new Date();
    const in7 = new Date();
    in7.setDate(today.getDate() + 7);
    return (plans ?? [])
      .filter((p) => {
        if (!p.nextDueDate) return false;
        const d = new Date(p.nextDueDate as unknown as string);
        return d >= today && d <= in7;
      })
      .sort(
        (a, b) =>
          new Date(a.nextDueDate as unknown as string).getTime() -
          new Date(b.nextDueDate as unknown as string).getTime(),
      )
      .slice(0, 8);
  }, [plans]);

  // Performance stats based on maintenanceRecords
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last7 = new Date();
    last7.setDate(now.getDate() - 7);

    const closed = (maintenanceRecords ?? []).filter(
      (r) => r.status === "Closed" && r.completionDate,
    );

    const within = (from: Date, to: Date) =>
      closed.filter((r) => {
        const c = new Date(r.completionDate as unknown as string);
        return c >= from && c <= to;
      });

    const durationHours = (r: (typeof closed)[number]) => {
      const start = new Date(r.issueDate as unknown as string).getTime();
      const end = new Date(r.completionDate as unknown as string).getTime();
      return Math.max(0, (end - start) / (1000 * 60 * 60));
    };

    const avgHours = (arr: (typeof closed)[number][]) => {
      if (!arr.length) return 0;
      const total = arr.reduce((sum, r) => sum + durationHours(r), 0);
      return total / arr.length;
    };

    const SLA_HOURS = 72; // on-time if closed within 72 hours
    const onTimeRate = (arr: (typeof closed)[number][]) => {
      if (!arr.length) return 0;
      const ok = arr.filter((r) => durationHours(r) <= SLA_HOURS).length;
      return (ok / arr.length) * 100;
    };

    const weekArr = within(last7, now);
    const monthArr = within(startOfMonth, now);
    const yearArr = within(startOfYear, now);

    // Overdue: open or in-progress older than 7 days
    const overdueThreshold = new Date();
    overdueThreshold.setDate(now.getDate() - 7);
    const overdueCount = (maintenanceRecords ?? []).filter(
      (r) =>
        r.status !== "Closed" &&
        new Date(r.issueDate as unknown as string) < overdueThreshold,
    ).length;

    return {
      completed: {
        week: weekArr.length,
        month: monthArr.length,
        year: yearArr.length,
      },
      avgHours: {
        week: avgHours(weekArr),
        month: avgHours(monthArr),
        year: avgHours(yearArr),
      },
      onTimeRate: {
        week: onTimeRate(weekArr),
        month: onTimeRate(monthArr),
        year: onTimeRate(yearArr),
      },
      overdueCount,
      slaHours: SLA_HOURS,
    };
  }, [maintenanceRecords]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Maintenance Tracking
          </h1>
          <p className="text-muted-foreground">
            Schedule, monitor, and log maintenance activities for vehicles and
            weapons
          </p>
        </div>

        {/* Schedule New Maintenance Form */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitMsg(null);
                const assetIdNum = Number(form.assetId);
                if (!assetIdNum || Number.isNaN(assetIdNum)) {
                  setSubmitMsg({
                    type: "error",
                    text: "Please select a valid Asset",
                  });
                  return;
                }
                if (!form.scheduledDate) {
                  setSubmitMsg({
                    type: "error",
                    text: "Please choose a scheduled date",
                  });
                  return;
                }
                const planDescription = [form.maintenanceType, form.description]
                  .filter(Boolean)
                  .join(" — ");
                createPlan.mutate({
                  assetId: assetIdNum,
                  planDescription: planDescription || "Scheduled maintenance",
                  // optional fields
                  nextDueDate: new Date(form.scheduledDate),
                  // frequencyDays / frequencyKm not collected in this simple form
                  createdBy: "ui",
                  updatedBy: "ui",
                } as any);
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="item-id">Vehicle/Weapon *</Label>
                  <Select
                    value={form.assetId}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, assetId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          assetsLoading
                            ? "Loading assets…"
                            : assetsError
                              ? "Failed to load assets"
                              : "Select Asset"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(assets ?? []).map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {`Asset-${a.id}`} {a.model ? `— ${a.model}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-type">Maintenance Type *</Label>
                  <Select
                    value={form.maintenanceType}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, maintenanceType: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine Service">
                        Routine Service
                      </SelectItem>
                      <SelectItem value="Safety Inspection">
                        Safety Inspection
                      </SelectItem>
                      <SelectItem value="Repair Work">Repair Work</SelectItem>
                      <SelectItem value="Major Overhaul">
                        Major Overhaul
                      </SelectItem>
                      <SelectItem value="Cleaning & Lubrication">
                        Cleaning & Lubrication
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Scheduled Date *</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, scheduledDate: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select
                    value={form.severity}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, severity: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="technician">Assigned Technician</Label>
                  <Select
                    value={form.technician}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, technician: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech1">
                        John Smith - Vehicle Specialist
                      </SelectItem>
                      <SelectItem value="tech2">
                        Sarah Johnson - Weapons Expert
                      </SelectItem>
                      <SelectItem value="tech3">
                        Mike Davis - General Maintenance
                      </SelectItem>
                      <SelectItem value="tech4">
                        Lisa Brown - Electronics
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated-hours">Estimated Hours</Label>
                  <Input
                    id="estimated-hours"
                    type="number"
                    placeholder="2.5"
                    step="0.5"
                    value={form.estimatedHours}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, estimatedHours: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance-notes">
                  Maintenance Description
                </Label>
                <Textarea
                  id="maintenance-notes"
                  placeholder="Describe the maintenance work required..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createPlan.isPending}>
                  {createPlan.isPending
                    ? "Scheduling…"
                    : "Schedule Maintenance"}
                </Button>
                <Button
                  type="reset"
                  variant="outline"
                  onClick={() => {
                    setForm({
                      assetId: "",
                      maintenanceType: "",
                      scheduledDate: "",
                      severity: "",
                      technician: "",
                      estimatedHours: "",
                      description: "",
                    });
                    setSubmitMsg(null);
                  }}
                >
                  Clear Form
                </Button>
              </div>
              {submitMsg ? (
                <div
                  className={
                    submitMsg.type === "success"
                      ? "mt-2 text-sm text-green-600"
                      : "mt-2 text-sm text-red-600"
                  }
                >
                  {submitMsg.text}
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {/* Maintenance Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Maintenance Calendar -{" "}
              {new Date().toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-7 gap-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="bg-muted rounded p-2 text-center font-semibold"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {plansLoading ? (
                <div className="text-muted-foreground col-span-7 py-8 text-center text-sm">
                  Loading calendar…
                </div>
              ) : plansError ? (
                <div className="col-span-7 py-8 text-center text-sm text-red-500">
                  {String(plansErr?.message ?? "Failed to load calendar")}
                </div>
              ) : (
                calendarDays.map((dayData, index) => (
                  <div key={index} className="min-h-[80px] rounded border p-2">
                    <div className="mb-1 text-sm font-semibold">
                      {dayData.day}
                    </div>
                    {dayData.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={`mb-1 rounded p-1 text-xs ${
                          item.severity === "high"
                            ? "border-red-300 bg-red-100 dark:bg-red-900/20"
                            : item.severity === "medium"
                              ? "border-yellow-300 bg-yellow-100 dark:bg-yellow-900/20"
                              : "border-green-300 bg-green-100 dark:bg-green-900/20"
                        }`}
                      >
                        {item.id} {item.task}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Active Maintenance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Currently Active Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Maintenance</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordsLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-muted-foreground text-center text-sm"
                        >
                          Loading records…
                        </TableCell>
                      </TableRow>
                    ) : recordsError ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-sm text-red-500"
                        >
                          {String(
                            recordsErr?.message ?? "Failed to load records",
                          )}
                        </TableCell>
                      </TableRow>
                    ) : pagedRecords.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-muted-foreground text-center text-sm"
                        >
                          No active maintenance.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedRecords.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">
                            {r.asset ? `Asset-${r.asset.id}` : r.assetId}
                          </TableCell>
                          <TableCell>{r.asset?.assetType ?? "—"}</TableCell>
                          <TableCell>{r.problemDescription}</TableCell>
                          <TableCell>{r.technicianId}</TableCell>
                          <TableCell>
                            {new Date(r.issueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getSeverityColor(
                                r.severity as unknown as string,
                              )}
                            >
                              {r.severity ?? "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {plansLoading ? (
                  <div className="text-muted-foreground text-sm">
                    Loading schedule…
                  </div>
                ) : plansError ? (
                  <div className="text-sm text-red-500">
                    {String(plansErr?.message ?? "Failed to load schedule")}
                  </div>
                ) : upcomingPlans.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    No items due in the next 7 days.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingPlans.map((p, i) => {
                      const d = new Date(p.nextDueDate as unknown as string);
                      const time = d.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          <span className="font-semibold">{time}</span>
                          <span>
                            {`Asset-${p.assetId}`} {p.planDescription}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Maintenance Alerts computed from plans and spare parts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Maintenance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plansLoading || partsLoading ? (
                  <div className="text-muted-foreground text-sm">
                    Loading alerts…
                  </div>
                ) : plansError || partsError ? (
                  <div className="text-sm text-red-500">
                    Failed to load alerts
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const today = new Date();
                      const in7 = new Date();
                      in7.setDate(today.getDate() + 7);
                      const overdue = (plans ?? []).filter(
                        (p) =>
                          p.nextDueDate &&
                          new Date(p.nextDueDate as unknown as string) < today,
                      );
                      const dueThisWeek = (plans ?? []).filter((p) => {
                        if (!p.nextDueDate) return false;
                        const d = new Date(p.nextDueDate as unknown as string);
                        return d >= today && d <= in7;
                      });
                      const lowStock = (spareParts ?? []).filter(
                        (sp) =>
                          (sp.reorderThreshold ?? 0) > 0 &&
                          (sp.quantityOnHand ?? 0) <=
                            (sp.reorderThreshold ?? 0),
                      );
                      return (
                        <>
                          <div className="flex items-start gap-2">
                            <Badge variant="destructive" className="mt-0.5">
                              Critical
                            </Badge>
                            <span>{overdue.length} plan(s) overdue</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Badge variant="default" className="mt-0.5">
                              Warning
                            </Badge>
                            <span>
                              {dueThisWeek.length} item(s) due in next 7 days
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Badge variant="secondary" className="mt-0.5">
                              Info
                            </Badge>
                            <span>
                              {lowStock.length} spare part(s) at or below
                              reorder threshold
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Maintenance History Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Maintenance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recordsLoading ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  Loading history…
                </div>
              ) : recordsError ? (
                <div className="py-6 text-center text-sm text-red-500">
                  {String(recordsErr?.message ?? "Failed to load history")}
                </div>
              ) : (
                timelineEvents.map((event, index) => (
                  <div key={index} className="border-primary border-l-4 pl-4">
                    <div className="text-muted-foreground mb-1 text-sm font-semibold">
                      {event.date}
                    </div>
                    <p className="mb-1 font-medium">{event.title}</p>
                    <p className="text-muted-foreground text-sm italic">
                      {event.status}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Performance Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>This Week</TableHead>
                  <TableHead>This Month</TableHead>
                  <TableHead>This Year</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    Completed Maintenance
                  </TableCell>
                  <TableCell>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : stats.completed.week}
                  </TableCell>
                  <TableCell>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : stats.completed.month}
                  </TableCell>
                  <TableCell>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : stats.completed.year}
                  </TableCell>
                  <TableCell>—</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Average Completion Time
                  </TableCell>
                  <TableCell>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : `${stats.avgHours.week.toFixed(1)} hours`}
                  </TableCell>
                  <TableCell>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : `${stats.avgHours.month.toFixed(1)} hours`}
                  </TableCell>
                  <TableCell>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : `${stats.avgHours.year.toFixed(1)} hours`}
                  </TableCell>
                  <TableCell>{`${stats.slaHours}h SLA`}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    On-Time Completion Rate
                  </TableCell>
                  <TableCell>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : `${stats.onTimeRate.week.toFixed(0)}%`}
                  </TableCell>
                  <TableCell>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : `${stats.onTimeRate.month.toFixed(0)}%`}
                  </TableCell>
                  <TableCell>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : `${stats.onTimeRate.year.toFixed(0)}%`}
                  </TableCell>
                  <TableCell>90%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Overdue Items</TableCell>
                  <TableCell colSpan={3}>
                    {recordsLoading
                      ? "…"
                      : recordsError
                        ? "—"
                        : stats.overdueCount}
                  </TableCell>
                  <TableCell>&lt; 50</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
