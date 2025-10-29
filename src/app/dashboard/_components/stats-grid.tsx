"use client";

import { Card, CardContent } from "~/components/ui/card";
import { api } from "~/trpc/react";

interface StatCardProps {
  number: string;
  label: string;
}

function StatCard({ number, label }: StatCardProps) {
  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{number}</div>
        <p className="text-muted-foreground mt-1 text-sm">{label}</p>
      </CardContent>
    </Card>
  );
}

export function StatsGrid() {
  const { data: assets, isLoading: assetsLoading } =
    api.asset.getAll.useQuery();
  const { data: plans, isLoading: plansLoading } =
    api.maintenancePlanRouter.getAll.useQuery();

  const totalWeapons = (assets ?? []).filter(
    (a) => a.assetType === "Rifle",
  ).length;
  const totalVehicles = (assets ?? []).filter(
    (a) => a.assetType !== "Rifle",
  ).length;
  const vehiclesInMaintenance = (assets ?? []).filter(
    (a) => a.assetType !== "Rifle" && a.status === "In Maintenance",
  ).length;

  const today = new Date();
  const overdue = (plans ?? []).filter(
    (p) => p.nextDueDate && new Date(p.nextDueDate) < today,
  ).length;

  const loading = assetsLoading || plansLoading;

  const stats = [
    { number: loading ? "…" : String(totalVehicles), label: "Total Vehicles" },
    {
      number: loading ? "…" : String(vehiclesInMaintenance),
      label: "Vehicles in Maintenance",
    },
    { number: loading ? "…" : String(totalWeapons), label: "Total Weapons" },
    { number: loading ? "…" : String(overdue), label: "Overdue Maintenance" },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} number={stat.number} label={stat.label} />
      ))}
    </div>
  );
}
