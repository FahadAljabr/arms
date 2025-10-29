import { DashboardHeader } from "./_components/header";
import { StatsGrid } from "./_components/stats-grid";
import {
  QuickActions,
  PerformanceChart,
  UpcomingMaintenance,
} from "./_components/additional-components";
import { MaintenanceActivitiesTable } from "./_components/maintenance-activities-table";
import { MaintenanceAlerts } from "./_components/maintenance-alerts";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { hasRole } from "~/server/auth/roles";
import {
  QuickNavigation,
  SectorBreakdown,
  SystemStatus,
  RecentActions,
} from "./_components/sidebar-components";

export default async function DashboardPage() {
  const { user } = await withAuth({ ensureSignedIn: true });
  const isTechnician = hasRole(user, "technician");
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <div className="space-y-6">
        <h2 id="overview" className="text-2xl font-semibold">
          System Overview
        </h2>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Quick Actions */}
        <QuickActions isTechnician={isTechnician} />

        {/* Dashboard Grid - Main Content and Sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content Area - Takes up 2/3 of the space */}
          <div className="space-y-6 lg:col-span-2">
            {/* Dashboard Grid - Activities and Alerts */}
            <div className="grid grid-cols-1 gap-6">
              <MaintenanceActivitiesTable />
              <MaintenanceAlerts />
            </div>

            {/* Performance Chart */}
            <div id="performance">
              <PerformanceChart />
            </div>

            {/* Upcoming Maintenance */}
            <UpcomingMaintenance />
          </div>

          {/* Sidebar - Takes up 1/3 of the space */}
          <div className="space-y-6">
            <QuickNavigation />
            <SectorBreakdown />
            <SystemStatus />
            <RecentActions />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-border text-muted-foreground mt-12 border-t pt-6 text-center text-xs">
        <p>
          &copy; 2025 Vehicle & Weapon Maintenance System. All rights reserved.
          |{" "}
          <a
            href="https://www.example.com/support"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Technical Support
          </a>
        </p>
      </footer>
    </div>
  );
}
