import { Alert, AlertDescription } from "~/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { AlertTriangle, Info, AlertCircle } from "lucide-react"

interface MaintenanceAlert {
  type: "urgent" | "warning" | "info"
  message: string
}

const alerts: MaintenanceAlert[] = [
  {
    type: "urgent",
    message: "Vehicle TR-067 overdue for inspection by 15 days",
  },
  {
    type: "warning",
    message: "8 vehicles scheduled for maintenance this week",
  },
  {
    type: "info",
    message: "New maintenance protocols updated for armored vehicles",
  },
  {
    type: "urgent",
    message: "Weapon W-4523 requires immediate inspection",
  },
]

function getAlertIcon(type: MaintenanceAlert["type"]) {
  switch (type) {
    case "urgent":
      return <AlertTriangle className="h-4 w-4" />
    case "warning":
      return <AlertCircle className="h-4 w-4" />
    case "info":
      return <Info className="h-4 w-4" />
  }
}

function getAlertVariant(type: MaintenanceAlert["type"]) {
  switch (type) {
    case "urgent":
      return "destructive"
    case "warning":
      return "default"
    case "info":
      return "default"
  }
}

function getAlertPrefix(type: MaintenanceAlert["type"]) {
  switch (type) {
    case "urgent":
      return "URGENT:"
    case "warning":
      return "WARNING:"
    case "info":
      return "INFO:"
  }
}

export function MaintenanceAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <Alert key={index} variant={getAlertVariant(alert.type)} className={
            alert.type === "urgent" ? "border-dashed" : ""
          }>
            {getAlertIcon(alert.type)}
            <AlertDescription>
              <strong>{getAlertPrefix(alert.type)}</strong> {alert.message}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}