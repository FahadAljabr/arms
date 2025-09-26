import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"

export function QuickNavigation() {
  const navItems = [
    { label: "System Overview", href: "#overview" },
    { label: "Performance Charts", href: "#performance" },
    { label: "Vehicle Registry", href: "/vehicles" },
    { label: "Maintenance Logs", href: "/maintenance" },
    { label: "Weapon Inventory", href: "/weapons" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className="text-blue-600 hover:underline text-sm"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function SectorBreakdown() {
  const sectors = [
    { name: "Police", vehicles: "156", weapons: "892" },
    { name: "Traffic Police", vehicles: "67", weapons: "234" },
    { name: "Military Police", vehicles: "24", weapons: "119" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2 text-sm">
          {sectors.map((sector, index) => (
            <li key={index} className="ml-4">
              <strong>{sector.name}:</strong> {sector.vehicles} vehicles, {sector.weapons} weapons
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export function SystemStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <strong>Server Status:</strong>{" "}
          <Badge variant="default" className="ml-1">
            ONLINE
          </Badge>
        </p>
        <p>
          <strong>Last Update:</strong> 2025-09-25 14:30
        </p>
        <p>
          <strong>Active Users:</strong> 12
        </p>
        <p>
          <strong>Database Size:</strong> 245 MB
        </p>
      </CardContent>
    </Card>
  )
}

export function RecentActions() {
  const actions = [
    { time: "14:25", action: "Vehicle POL-089 registered" },
    { time: "14:10", action: "Maintenance completed for TR-023" },
    { time: "13:45", action: "Weapon W-5567 inspection logged" },
    { time: "13:30", action: "New user account created" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs">
          {actions.map((action, index) => (
            <p key={index}>
              <strong>{action.time}</strong> - {action.action}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}