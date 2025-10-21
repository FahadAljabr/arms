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

interface MaintenanceActivity {
  id: string;
  type: string;
  sector: string;
  activity: string;
  date: string;
  status: "COMPLETED" | "IN PROGRESS" | "SCHEDULED";
}

const activities: MaintenanceActivity[] = [
  {
    id: "POL-001",
    type: "Police Car",
    sector: "Police",
    activity: "Oil Change",
    date: "2025-09-24",
    status: "COMPLETED",
  },
  {
    id: "TR-045",
    type: "Traffic Vehicle",
    sector: "Traffic Police",
    activity: "Brake Inspection",
    date: "2025-09-23",
    status: "IN PROGRESS",
  },
  {
    id: "APC-012",
    type: "Armored Vehicle",
    sector: "Military Police",
    activity: "Engine Service",
    date: "2025-09-22",
    status: "COMPLETED",
  },
  {
    id: "W-9871",
    type: "Service Rifle",
    sector: "Military Police",
    activity: "Cleaning & Inspection",
    date: "2025-09-21",
    status: "COMPLETED",
  },
  {
    id: "POL-033",
    type: "Police Car",
    sector: "Police",
    activity: "Tire Replacement",
    date: "2025-09-20",
    status: "SCHEDULED",
  },
];

function getStatusVariant(status: MaintenanceActivity["status"]) {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "IN PROGRESS":
      return "secondary";
    case "SCHEDULED":
      return "outline";
    default:
      return "outline";
  }
}

export function MaintenanceActivitiesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Maintenance Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Vehicle/Weapon ID</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Sector</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    <a
                      href={`#${activity.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {activity.id}
                    </a>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {activity.type}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {activity.sector}
                  </TableCell>
                  <TableCell>{activity.activity}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {activity.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(activity.status)}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
