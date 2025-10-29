import React from "react";
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

export default function MaintenancePage() {
  const maintenanceData = [
    {
      id: "TR-045",
      type: "Vehicle",
      maintenance: "Brake System Repair",
      technician: "John Smith",
      started: "2025-09-23",
      progress: "75% Complete",
      severity: "HIGH",
    },
    {
      id: "W-4523",
      type: "Weapon",
      maintenance: "Routine Cleaning",
      technician: "Sarah Johnson",
      started: "2025-09-25",
      progress: "25% Complete",
      severity: "URGENT",
    },
    {
      id: "APC-012",
      type: "Vehicle",
      maintenance: "Engine Inspection",
      technician: "Mike Davis",
      started: "2025-09-24",
      progress: "50% Complete",
      severity: "MEDIUM",
    },
  ];

  const calendarDays = [
    { day: 23, items: [] },
    {
      day: 24,
      items: [{ id: "POL-001", task: "Service", severity: "medium" }],
    },
    {
      day: 25,
      items: [
        { id: "TR-045", task: "Repair", severity: "high" },
        { id: "W-1234", task: "Clean", severity: "low" },
      ],
    },
    {
      day: 26,
      items: [{ id: "APC-012", task: "Inspect", severity: "medium" }],
    },
    { day: 27, items: [{ id: "POL-033", task: "Service", severity: "low" }] },
    { day: 28, items: [] },
    { day: 29, items: [] },
    { day: 30, items: [{ id: "TR-067", task: "URGENT", severity: "high" }] },
    { day: 1, items: [] },
    {
      day: 2,
      items: [{ id: "W-5567", task: "Inspect", severity: "medium" }],
    },
    { day: 3, items: [{ id: "POL-089", task: "Service", severity: "low" }] },
    { day: 4, items: [] },
    { day: 5, items: [] },
    { day: 6, items: [] },
  ];

  const timelineEvents = [
    {
      date: "September 24, 2025",
      title:
        "POL-001 - Oil change and filter replacement completed by John Smith (2.5 hours)",
      status: "Completed successfully, vehicle returned to service",
    },
    {
      date: "September 22, 2025",
      title:
        "W-9871 - Routine cleaning and inspection completed by Sarah Johnson (1.0 hours)",
      status: "Passed all safety checks, no issues found",
    },
    {
      date: "September 21, 2025",
      title:
        "TR-089 - Tire replacement and wheel alignment by Mike Davis (3.0 hours)",
      status: "New tires installed, alignment within specifications",
    },
    {
      date: "September 20, 2025",
      title:
        "APC-015 - Major engine overhaul completed by John Smith (16.5 hours)",
      status: "Engine rebuilt, performance tests successful",
    },
  ];
  const getSeverityColor = (severity: string) => {
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
              Maintenance Calendar - September 2025
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
              {calendarDays.map((dayData, index) => (
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
              ))}
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
                    {maintenanceData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.maintenance}</TableCell>
                        <TableCell>{item.technician}</TableCell>
                        <TableCell>{item.started}</TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(item.severity)}>
                            {item.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

            {/* Maintenance Alerts */}
            {/* TODO use API to fetch alerts*/}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Maintenance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="destructive" className="mt-0.5">
                      Critical
                    </Badge>
                    <span>TR-067 overdue by 15 days</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="default" className="mt-0.5">
                      Warning
                    </Badge>
                    <span>6 items due this week</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">
                      Info
                    </Badge>
                    <span>Parts order arriving Friday</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">
                      Reminder
                    </Badge>
                    <span>Monthly safety meeting Tuesday</span>
                  </div>
                </div>
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
              {timelineEvents.map((event, index) => (
                <div key={index} className="border-primary border-l-4 pl-4">
                  <div className="text-muted-foreground mb-1 text-sm font-semibold">
                    {event.date}
                  </div>
                  <p className="mb-1 font-medium">{event.title}</p>
                  <p className="text-muted-foreground text-sm italic">
                    {event.status}
                  </p>
                </div>
              ))}
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
