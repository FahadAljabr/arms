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
import {
  Search,
  Shield,
  Plus,
  Filter,
  Edit,
  Eye,
  Wrench,
  AlertTriangle,
} from "lucide-react";

export default function WeaponsPage() {
  const weapons = [
    {
      id: "W-4523",
      title: "Service Pistol",
      type: "Glock 17 (9mm)",
      sector: "Police",
      assignedTo: "Officer J. Martinez (Badge #4523)",
      status: "IN MAINTENANCE",
      securityLevel: "STANDARD",
      lastInspection: "2025-09-10",
      securityClass: "bg-white border",
    },
    {
      id: "W-9871",
      title: "Service Rifle",
      type: "M4A1 (.223)",
      sector: "Military Police",
      assignedTo: "Sgt. R. Thompson (MP-8901)",
      status: "ACTIVE",
      securityLevel: "RESTRICTED",
      lastInspection: "2025-09-21",
      securityClass: "bg-gray-50 border-gray-300",
    },
    {
      id: "W-5567",
      title: "Service Shotgun",
      type: "Remington 870 (12ga)",
      sector: "Traffic Police",
      assignedTo: "Officer K. Davis (TP-3456)",
      status: "ACTIVE",
      securityLevel: "STANDARD",
      lastInspection: "2025-09-18",
      securityClass: "bg-white border",
    },
    {
      id: "W-7890",
      title: "Sniper Rifle",
      type: "Remington 700 (.308)",
      sector: "Military Police",
      assignedTo: "Sniper Team Alpha",
      status: "STORAGE",
      securityLevel: "CLASSIFIED",
      lastInspection: "2025-09-05",
      securityClass: "bg-gray-100 border-gray-400",
    },
  ];

  const maintenanceLogs = [
    {
      id: "W-4523",
      startTime: "2025-09-25 09:00",
      technician: "Sarah Johnson",
      type: "Routine Cleaning & Inspection",
      issues:
        "Minor carbon buildup in barrel, trigger mechanism slightly stiff",
      actions: "Deep cleaning, lubrication, trigger adjustment",
      status: "IN PROGRESS",
      completion: "11:00",
    },
    {
      id: "W-9871",
      startTime: "2025-09-21 14:30",
      technician: "Sarah Johnson",
      type: "Routine Cleaning & Inspection",
      issues: "None",
      actions: "Standard cleaning, lubrication, function test",
      status: "COMPLETED",
      completion: "Returned to service",
    },
    {
      id: "W-3456",
      startTime: "2025-09-19 16:15",
      technician: "Mike Davis",
      type: "Repair Work",
      issues: "Damaged sight, worn grip",
      actions: "Sight replacement, grip maintenance",
      status: "COMPLETED",
      completion: "Returned to service",
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "IN MAINTENANCE":
        return "secondary";
      case "STORAGE":
        return "outline";
      default:
        return "default";
    }
  };

  const getSecurityBadge = (level: string) => {
    switch (level) {
      case "STANDARD":
        return "bg-white border text-black";
      case "RESTRICTED":
        return "bg-gray-100 border-gray-400 text-gray-800";
      case "CLASSIFIED":
        return "bg-gray-200 border-gray-500 text-gray-900";
      default:
        return "bg-white border text-black";
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Weapon Management
          </h1>
          <p className="text-muted-foreground">
            Register, track, and maintain military and security weapons
            inventory
          </p>
        </div>

        {/* Weapon Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Register New Weapon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weapon-id">Weapon ID/Serial Number *</Label>
                  <Input id="weapon-id" placeholder="e.g., W-4523, SR-8901" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weapon-sector">Assigned Sector *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="police">Police</SelectItem>
                      <SelectItem value="traffic">Traffic Police</SelectItem>
                      <SelectItem value="military">Military Police</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weapon-type">Weapon Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pistol">Service Pistol</SelectItem>
                      <SelectItem value="rifle">Service Rifle</SelectItem>
                      <SelectItem value="shotgun">Shotgun</SelectItem>
                      <SelectItem value="smg">Submachine Gun</SelectItem>
                      <SelectItem value="sniper">Sniper Rifle</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    placeholder="e.g., Glock, Smith & Wesson"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="e.g., Glock 17, M4A1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caliber">Caliber</Label>
                  <Input id="caliber" placeholder="e.g., 9mm, .223" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="assigned-officer">Assigned Officer</Label>
                  <Input
                    id="assigned-officer"
                    placeholder="Officer Name/Badge Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="security-level">Security Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="classified">Classified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Purchase Date</Label>
                  <Input id="purchase-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-inspection">Last Inspection</Label>
                  <Input id="last-inspection" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weapon-notes">Additional Notes</Label>
                <Textarea
                  id="weapon-notes"
                  placeholder="Modifications, special equipment, etc."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Register Weapon</Button>
                <Button type="reset" variant="outline">
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search and Filter */}
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
                  placeholder="Search by Weapon ID, Type, or Assigned Officer..."
                  className="flex-1"
                />
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Sector:</Label>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="police">Police</SelectItem>
                      <SelectItem value="traffic">Traffic Police</SelectItem>
                      <SelectItem value="military">Military Police</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Type:</Label>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="pistol">Pistols</SelectItem>
                      <SelectItem value="rifle">Rifles</SelectItem>
                      <SelectItem value="shotgun">Shotguns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Status:</Label>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">
                        In Maintenance
                      </SelectItem>
                      <SelectItem value="storage">In Storage</SelectItem>
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
          {/* Weapon Inventory Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Weapon Inventory (1,245 total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {weapons.map((weapon) => (
                    <div
                      key={weapon.id}
                      className={`rounded-lg border-2 border-gray-800 p-4 ${weapon.securityClass}`}
                    >
                      <div className="mb-3 border-b border-gray-300 pb-2 text-sm font-bold">
                        {weapon.id} - {weapon.title}
                      </div>
                      <div className="mb-4 space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {weapon.type}
                        </p>
                        <p>
                          <span className="font-medium">Sector:</span>{" "}
                          {weapon.sector}
                        </p>
                        <p>
                          <span className="font-medium">Assigned:</span>{" "}
                          {weapon.assignedTo}
                        </p>
                        <p>
                          <span className="font-medium">Last Inspection:</span>{" "}
                          {weapon.lastInspection}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Status:</span>
                          <Badge variant={getStatusVariant(weapon.status)}>
                            {weapon.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Security:</span>
                          <span
                            className={`px-2 py-1 text-xs font-bold ${getSecurityBadge(weapon.securityLevel)}`}
                          >
                            {weapon.securityLevel}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 text-center">
                  <Button variant="outline">Load More Weapons</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Register New Weapon
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="mr-2 h-4 w-4" />
                    Bulk Schedule Maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Transfer Weapon
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Inspection Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Today:</span>
                    <span>8 weapons scheduled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">This Week:</span>
                    <span>45 inspections</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Overdue:</span>
                    <span className="font-medium text-red-600">11 weapons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Next Month:</span>
                    <span>156 scheduled</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="font-semibold text-red-600">
                        HIGH PRIORITY
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      2 classified weapons overdue
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="font-semibold text-yellow-600">
                        MEDIUM
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      5 weapons need assignment update
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="font-semibold text-blue-600">INFO</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      New security protocols effective Oct 1
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ammunition Status */}
            <Card>
              <CardHeader>
                <CardTitle>Ammunition Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">9mm:</span>
                    <span>15,420 rounds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">.223:</span>
                    <span>8,950 rounds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">12ga:</span>
                    <span>2,340 shells</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">.308:</span>
                    <span className="font-medium text-yellow-600">
                      156 rounds ⚠️
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <span className="font-medium">Last Resupply:</span>
                    <span className="ml-2">2025-09-15</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Maintenance Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Weapon Maintenance Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceLogs.map((log, index) => (
                <div key={index} className="bg-muted rounded-lg border p-4">
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="font-semibold">
                        {log.id} - Maintenance{" "}
                        {log.status === "COMPLETED" ? "Completed" : "Started"}:{" "}
                        {log.startTime}
                      </p>
                      <p>
                        <span className="font-medium">Technician:</span>{" "}
                        {log.technician} |{" "}
                        <span className="font-medium">Type:</span> {log.type}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Issues Found:</span>{" "}
                        {log.issues}
                      </p>
                      <p>
                        <span className="font-medium">Actions:</span>{" "}
                        {log.actions}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 border-t pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge
                        variant={
                          log.status === "COMPLETED" ? "default" : "secondary"
                        }
                      >
                        {log.status}
                      </Badge>
                      {log.status === "IN PROGRESS" && (
                        <span className="text-muted-foreground text-sm">
                          (Expected completion: {log.completion})
                        </span>
                      )}
                      {log.status === "COMPLETED" && (
                        <span className="text-muted-foreground text-sm">
                          - {log.completion}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weapon Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Weapon Inventory Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sector</TableHead>
                  <TableHead>Total Weapons</TableHead>
                  <TableHead>Pistols</TableHead>
                  <TableHead>Rifles</TableHead>
                  <TableHead>Shotguns</TableHead>
                  <TableHead>Other</TableHead>
                  <TableHead>In Maintenance</TableHead>
                  <TableHead>Overdue Inspection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Police</TableCell>
                  <TableCell>892</TableCell>
                  <TableCell>456</TableCell>
                  <TableCell>234</TableCell>
                  <TableCell>178</TableCell>
                  <TableCell>24</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>8</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Traffic Police</TableCell>
                  <TableCell>234</TableCell>
                  <TableCell>156</TableCell>
                  <TableCell>45</TableCell>
                  <TableCell>28</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>2</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Military Police</TableCell>
                  <TableCell>119</TableCell>
                  <TableCell>34</TableCell>
                  <TableCell>67</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>6</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell>1</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
