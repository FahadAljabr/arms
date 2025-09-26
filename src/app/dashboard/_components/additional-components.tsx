import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"

export function QuickActions() {
  const actions = [
    { label: "Register New Vehicle", href: "/vehicles#register", variant: "default" as const },
    { label: "Register New Weapon", href: "/weapons#register", variant: "outline" as const },
    { label: "Schedule Maintenance", href: "/maintenance#schedule", variant: "outline" as const },
    { label: "Generate Report", href: "#reports", variant: "outline" as const },
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant}
          asChild
        >
          <a href={action.href}>{action.label}</a>
        </Button>
      ))}
    </div>
  )
}

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Performance by Sector</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10">
          <p className="text-muted-foreground italic text-sm text-center">
            [Chart: Bar graph showing maintenance completion rates by sector]
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function UpcomingMaintenance() {
  const schedule = [
    { period: "Today (Sept 25)", description: "3 vehicles, 2 weapons scheduled" },
    { period: "Tomorrow (Sept 26)", description: "5 vehicles scheduled" },
    { period: "This Week", description: "18 total maintenance activities" },
    { period: "Next Week", description: "12 scheduled inspections" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Maintenance Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm ml-4">
          {schedule.map((item, index) => (
            <li key={index} className="list-disc">
              <strong>{item.period}:</strong> {item.description}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}