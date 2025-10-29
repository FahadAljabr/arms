"use client";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { api, type RouterOutputs } from "~/trpc/react";
import { useMemo } from "react";

type AlertType = "urgent" | "warning" | "info";

function getAlertIcon(type: AlertType) {
  switch (type) {
    case "urgent":
      return <AlertTriangle className="h-4 w-4" />;
    case "warning":
      return <AlertCircle className="h-4 w-4" />;
    case "info":
      return <Info className="h-4 w-4" />;
  }
}

function getAlertVariant(type: AlertType) {
  switch (type) {
    case "urgent":
      return "destructive";
    case "warning":
      return "default";
    case "info":
      return "default";
  }
}

function getAlertPrefix(type: AlertType) {
  switch (type) {
    case "urgent":
      return "URGENT:";
    case "warning":
      return "WARNING:";
    case "info":
      return "INFO:";
  }
}

export function MaintenanceAlerts() {
  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
    error: plansErr,
  } = api.maintenancePlan.getAll.useQuery();
  const {
    data: assets,
    isLoading: assetsLoading,
    isError: assetsError,
    error: assetsErr,
  } = api.asset.getAll.useQuery();

  const today = new Date();
  type Plan = RouterOutputs["maintenancePlan"]["getAll"][number];

  const computed = useMemo(() => {
    const alerts: Array<{ type: AlertType; message: string }> = [];
    const overdue = (plans ?? []).filter(
      (p: Plan) => p.nextDueDate && new Date(p.nextDueDate) < today,
    );
    const dueSoon = (plans ?? []).filter((p: Plan) => {
      if (!p.nextDueDate) return false;
      const d = new Date(p.nextDueDate);
      const diffDays = Math.ceil(
        (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffDays >= 0 && diffDays <= 7;
    });
    const inMaintenance = (assets ?? []).filter(
      (a) => a.status === "In Maintenance",
    );

    if (overdue.length > 0) {
      alerts.push({
        type: "urgent",
        message: `${overdue.length} assets overdue for maintenance`,
      });
    }
    if (dueSoon.length > 0) {
      alerts.push({
        type: "warning",
        message: `${dueSoon.length} assets due for maintenance within 7 days`,
      });
    }
    if (inMaintenance.length > 0) {
      alerts.push({
        type: "info",
        message: `${inMaintenance.length} assets currently in maintenance`,
      });
    }

    return alerts;
  }, [plans, assets]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {plansLoading || assetsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted h-10 w-full animate-pulse rounded"
              />
            ))}
          </div>
        ) : plansError || assetsError ? (
          <Alert variant="destructive">
            <AlertTitle>Failed to load alerts</AlertTitle>
            <AlertDescription>
              {String(
                (plansErr as unknown as { message?: string })?.message ??
                  (assetsErr as unknown as { message?: string })?.message ??
                  "Unknown error",
              )}
            </AlertDescription>
          </Alert>
        ) : computed.length === 0 ? (
          <Alert>
            {getAlertIcon("info")}
            <AlertDescription>
              No maintenance alerts at this time.
            </AlertDescription>
          </Alert>
        ) : (
          computed.map((alert, index) => (
            <Alert
              key={index}
              variant={getAlertVariant(alert.type)}
              className={alert.type === "urgent" ? "border-dashed" : ""}
            >
              {getAlertIcon(alert.type)}
              <AlertDescription>
                <strong>{getAlertPrefix(alert.type)}</strong> {alert.message}
              </AlertDescription>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
}
