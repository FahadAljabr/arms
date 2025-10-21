import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/theme-toggle";

export function MainNavigation() {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">ARMS</span>
            <span className="text-muted-foreground hidden text-sm sm:inline">
              Fleet Management
            </span>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/dashboard"
                    className="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Dashboard
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  Vehicle Management
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
                          href="/vehicles"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium">
                            Vehicle Registry
                          </div>
                          <p className="text-muted-foreground text-sm leading-tight">
                            Manage your fleet of vehicles, track registrations,
                            and monitor vehicle status.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem
                      href="/vehicles/register"
                      title="Register Vehicle"
                    >
                      Add new vehicles to the fleet registry.
                    </ListItem>
                    <ListItem href="/vehicles/search" title="Search Vehicles">
                      Find and filter vehicles by various criteria.
                    </ListItem>
                    <ListItem href="/vehicles/reports" title="Vehicle Reports">
                      Generate comprehensive vehicle reports.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Maintenance</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href="/maintenance" title="Maintenance Tracking">
                      Track ongoing and completed maintenance activities.
                    </ListItem>
                    <ListItem
                      href="/maintenance/schedule"
                      title="Schedule Maintenance"
                    >
                      Plan and schedule upcoming maintenance tasks.
                    </ListItem>
                    <ListItem
                      href="/maintenance/history"
                      title="Maintenance History"
                    >
                      View historical maintenance records and patterns.
                    </ListItem>
                    <ListItem
                      href="/maintenance/alerts"
                      title="Maintenance Alerts"
                    >
                      Manage maintenance alerts and notifications.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Weapons</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href="/weapons" title="Weapon Inventory">
                      Manage weapon inventory and tracking.
                    </ListItem>
                    <ListItem href="/weapons/register" title="Register Weapon">
                      Add new weapons to the inventory system.
                    </ListItem>
                    <ListItem
                      href="/weapons/inspection"
                      title="Weapon Inspections"
                    >
                      Schedule and track weapon inspections.
                    </ListItem>
                    <ListItem href="/weapons/reports" title="Weapon Reports">
                      Generate weapon inventory and status reports.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/reports"
                    className="group bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Reports
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Theme Toggle and Mobile menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Mobile menu button - you can implement this later */}
            <div className="md:hidden">
              <button className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md p-2.5 focus:outline-none">
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  href: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none",
            className,
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};
