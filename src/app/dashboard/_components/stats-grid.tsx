import { Card, CardContent } from "~/components/ui/card"

interface StatCardProps {
  number: string
  label: string
}

function StatCard({ number, label }: StatCardProps) {
  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{number}</div>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}

export function StatsGrid() {
  const stats = [
    { number: "247", label: "Total Vehicles" },
    { number: "18", label: "Vehicles in Maintenance" },
    { number: "1,245", label: "Total Weapons" },
    { number: "32", label: "Overdue Maintenance" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard key={index} number={stat.number} label={stat.label} />
      ))}
    </div>
  )
}