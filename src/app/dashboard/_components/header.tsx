import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"

export function DashboardHeader() {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Vehicle & Weapon Maintenance System Overview</p>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}