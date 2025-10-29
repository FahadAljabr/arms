import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

type QuickActionsProps = {
  /**
   * When true (technician), show registration actions.
   * When false (officer/others), hide registration actions.
   */
  isTechnician?: boolean;
};

export function QuickActions({ isTechnician = false }: QuickActionsProps) {
  const actions = [
    {
      label: "Register New Vehicle",
      href: "/vehicles#register",
      variant: "default" as const,
      category: "register" as const,
    },
    {
      label: "Register New Weapon",
      href: "/weapons#register",
      variant: "outline" as const,
      category: "register" as const,
    },
    {
      label: "Schedule Maintenance",
      href: "/maintenance#schedule",
      variant: "outline" as const,
      category: "other" as const,
    },
    {
      label: "Generate Report",
      href: "#reports",
      variant: "outline" as const,
      category: "other" as const,
    },
  ];

  const visibleActions = isTechnician
    ? actions
    : actions.filter((a) => a.category !== "register");

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {visibleActions.map((action, index) => (
        <Button key={index} variant={action.variant} asChild>
          <a href={action.href}>{action.label}</a>
        </Button>
      ))}
    </div>
  );
}

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Performance by Sector</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-muted-foreground/25 bg-muted/10 flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground text-center text-sm italic">
            [Chart: Bar graph showing maintenance completion rates by sector]
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function UpcomingMaintenance() {
  const schedule = [
    {
      period: "Today (Sept 25)",
      description: "3 vehicles, 2 weapons scheduled",
    },
    { period: "Tomorrow (Sept 26)", description: "5 vehicles scheduled" },
    { period: "This Week", description: "18 total maintenance activities" },
    { period: "Next Week", description: "12 scheduled inspections" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Maintenance Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="ml-4 space-y-2 text-sm">
          {schedule.map((item, index) => (
            <li key={index} className="list-disc">
              <strong>{item.period}:</strong> {item.description}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
