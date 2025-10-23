import React from "react";
import { AssetsTable } from "../_components/assets-table";
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
import { Search, Car, Plus, Filter, Edit, Eye, Wrench } from "lucide-react";

export default function VehiclesPage() {
  const vehicles = [
    {
      id: "POL-001",
      title: "Police Patrol Car",
      sector: "Police",
      type: "Toyota Camry 2023",
      status: "ACTIVE",
      lastService: "2025-09-15",
      sectorClass: "border-l-4 border-blue-500",
    },
    {
      id: "TR-045",
      title: "Traffic Motorcycle",
      sector: "Traffic Police",
      type: "Harley Davidson 2022",
      status: "IN MAINTENANCE",
      lastService: "2025-09-20",
      sectorClass: "border-l-4 border-green-500",
    },
    {
      id: "APC-012",
      title: "Armored Personnel Carrier",
      sector: "Military Police",
      type: "M113 Variant 2020",
      status: "ACTIVE",
      lastService: "2025-09-18",
      sectorClass: "border-l-4 border-red-500",
    },
    {
      id: "POL-033",
      title: "Emergency Response Vehicle",
      sector: "Police",
      type: "Ford F-150 2024",
      status: "ACTIVE",
      lastService: "2025-09-12",
      sectorClass: "border-l-4 border-blue-500",
    },
    {
      id: "TR-067",
      title: "Traffic Control Van",
      sector: "Traffic Police",
      type: "Mercedes Sprinter 2021",
      status: "OVERDUE MAINTENANCE",
      lastService: "2025-08-10",
      sectorClass: "border-l-4 border-green-500",
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "IN MAINTENANCE":
        return "secondary";
      case "OVERDUE MAINTENANCE":
        return "destructive";
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
            Vehicle Management
          </h1>
          <p className="text-muted-foreground">
            Register, track, and manage military and security vehicles
          </p>
        </div>

        {/* Vehicle Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Register New Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vehicle-id">Vehicle ID/Plate Number *</Label>
                  <Input
                    id="vehicle-id"
                    placeholder="e.g., POL-001, TR-045, APC-012"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
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
                  <Label htmlFor="vehicle-type">Vehicle Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patrol-car">Patrol Car</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="armored-vehicle">
                        Armored Vehicle
                      </SelectItem>
                      <SelectItem value="transport-truck">
                        Transport Truck
                      </SelectItem>
                      <SelectItem value="emergency-vehicle">
                        Emergency Vehicle
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input id="manufacturer" placeholder="e.g., Toyota, Ford" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="e.g., Camry, F-150" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2024"
                    min="1990"
                    max="2025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN Number</Label>
                  <Input id="vin" placeholder="17-digit VIN" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Purchase Date</Label>
                  <Input id="purchase-date" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Special equipment, modifications, etc."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Register Vehicle</Button>
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
              Vehicle Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by Vehicle ID, Type, or Sector..."
                  className="flex-1"
                />
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Filter by Sector:</Label>
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
                      <SelectItem value="inactive">Inactive</SelectItem>
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
          {/* Vehicle List */}
          <div className="lg:col-span-2">
            <AssetsTable
              title={
                <span className="flex items-center gap-2">
                  <Car className="h-5 w-5" /> Registered Vehicles
                </span>
              }
              pageSize={10}
              assetTypes={["Patrol Car", "Armored Vehicle"]}
            />
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
                    Register New Vehicle
                  </Button>
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

            {/* Vehicle Types */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Patrol Cars:</span>
                    <span className="font-medium">178 units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Motorcycles:</span>
                    <span className="font-medium">45 units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Armored Vehicles:</span>
                    <span className="font-medium">12 units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport Trucks:</span>
                    <span className="font-medium">8 units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Vehicles:</span>
                    <span className="font-medium">4 units</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="font-semibold text-red-600">
                        URGENT (6)
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Vehicles overdue for service
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="font-semibold text-yellow-600">
                        WARNING (18)
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Service due within 7 days
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="font-semibold text-blue-600">
                        INFO (32)
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Service due within 30 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="mb-2 font-semibold">Today:</h4>
                    <div className="text-muted-foreground space-y-1">
                      <p>• 2 vehicles registered</p>
                      <p>• 5 maintenance completed</p>
                      <p>• 1 vehicle transferred</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">This Week:</h4>
                    <div className="text-muted-foreground space-y-1">
                      <p>• 12 vehicles registered</p>
                      <p>• 28 maintenance activities</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Vehicle Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Statistics by Sector</CardTitle>
          </CardHeader>
          <CardContent>
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
                <TableRow>
                  <TableCell className="font-medium">Police</TableCell>
                  <TableCell>156</TableCell>
                  <TableCell>142</TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>6</TableCell>
                  <TableCell>4.2</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Traffic Police</TableCell>
                  <TableCell>67</TableCell>
                  <TableCell>58</TableCell>
                  <TableCell>7</TableCell>
                  <TableCell>2</TableCell>
                  <TableCell>3.8</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Military Police</TableCell>
                  <TableCell>24</TableCell>
                  <TableCell>21</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>6.1</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
