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
    switch (severity.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  // Calendar: bucket maintenance plans by nextDueDate within the current month
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
    return days;
  }, [plans]);

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
            {/* TODO: wire to mutation api.maintenenceRecord.create with proper fields */}
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="item-id">Vehicle/Weapon ID *</Label>
                  <Input id="item-id" placeholder="e.g., POL-001, W-4523" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-type">Maintenance Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine Service</SelectItem>
                      <SelectItem value="inspection">
                        Safety Inspection
                      </SelectItem>
                      <SelectItem value="repair">Repair Work</SelectItem>
                      <SelectItem value="overhaul">Major Overhaul</SelectItem>
                      <SelectItem value="cleaning">
                        Cleaning & Lubrication
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Scheduled Date *</Label>
                  <Input id="scheduled-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="technician">Assigned Technician</Label>
                  <Select>
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
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Schedule Maintenance</Button>
                <Button type="reset" variant="outline">
                  Clear Form
                </Button>
              </div>
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span className="font-semibold">09:00</span>
                    <span>TR-045 Brake Repair (John S.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span className="font-semibold">11:30</span>
                    <span>W-1234 Cleaning (Sarah J.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span className="font-semibold">14:00</span>
                    <span>POL-089 Oil Change (Mike D.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span className="font-semibold">16:00</span>
                    <span>APC-012 Inspection (John S.)</span>
                  </div>
                </div>
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
        {/** TODO use API to fetch / tabulate / analyze statistics */}
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
                  <TableCell>28</TableCell>
                  <TableCell>124</TableCell>
                  <TableCell>1,456</TableCell>
                  <TableCell>1,500</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Average Completion Time
                  </TableCell>
                  <TableCell>3.2 hours</TableCell>
                  <TableCell>3.8 hours</TableCell>
                  <TableCell>4.1 hours</TableCell>
                  <TableCell>4.0 hours</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    On-Time Completion Rate
                  </TableCell>
                  <TableCell>89%</TableCell>
                  <TableCell>92%</TableCell>
                  <TableCell>87%</TableCell>
                  <TableCell>90%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Overdue Items</TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>32</TableCell>
                  <TableCell>124</TableCell>
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
