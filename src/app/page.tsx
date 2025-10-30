import Link from "next/link";
import {
  withAuth,
  getSignInUrl,
  getSignUpUrl,
  signOut,
} from "@workos-inc/authkit-nextjs";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ShieldCheck, Wrench, Activity, BarChart3, Lock } from "lucide-react";

export default async function Home() {
  const { user } = await withAuth();
  let signInUrl = "/login";
  try {
    signInUrl = await getSignInUrl();
  } catch {
    // Fallback to internal login route if WorkOS URLs aren't available
    signInUrl = "/login";
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.15),transparent_60%)]" />
          <div className="container mx-auto px-6 py-24">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30">
                Prototype
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
                ARMS — Asset Readiness Management System
              </h1>
              <p className="mt-6 text-lg/8 text-pretty text-slate-300">
                A comprehensive digital maintenance tracking system prototype
                for military and security vehicles and weapons. Monitor
                readiness, plan maintenance, and keep your fleet mission‑ready.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {user ? (
                  <>
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <form
                      action={async () => {
                        "use server";
                        await signOut();
                      }}
                    >
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        Sign out
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      <Link href={signInUrl}>Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Authentication secured by WorkOS. No credit card required for
                demo.
              </p>
            </div>
          </div>
        </section>

        {/* Key value props */}
        <section className="container mx-auto px-6 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group border-slate-800 bg-slate-900/50 p-6 backdrop-blur hover:border-slate-700">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Real‑time Readiness</h3>
              <p className="mt-2 text-sm text-slate-300">
                Track operational status across vehicles and weapons with clear
                readiness indicators and alerts.
              </p>
            </Card>
            <Card className="group border-slate-800 bg-slate-900/50 p-6 backdrop-blur hover:border-slate-700">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Maintenance Planning</h3>
              <p className="mt-2 text-sm text-slate-300">
                Schedule activities, log records, manage spare parts, and close
                work orders efficiently.
              </p>
            </Card>
            <Card className="group border-slate-800 bg-slate-900/50 p-6 backdrop-blur hover:border-slate-700">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Secure & Compliant</h3>
              <p className="mt-2 text-sm text-slate-300">
                Role‑based access with enterprise SSO powered by WorkOS, built
                for sensitive environments.
              </p>
            </Card>
          </div>
        </section>

        {/* Secondary features */}
        <section className="container mx-auto px-6 pt-6 pb-24">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-start gap-4">
                <BarChart3 className="mt-1 h-6 w-6 text-cyan-300" />
                <div>
                  <h4 className="text-base font-semibold">
                    Operational insight
                  </h4>
                  <p className="mt-2 text-sm text-slate-300">
                    See trends across units, sectors, and categories. Identify
                    bottlenecks and improve readiness over time.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-start gap-4">
                <Lock className="mt-1 h-6 w-6 text-emerald-300" />
                <div>
                  <h4 className="text-base font-semibold">
                    Auditable by design
                  </h4>
                  <p className="mt-2 text-sm text-slate-300">
                    Full change history with responsible technicians,
                    timestamps, and status transitions for every record.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-10 flex items-center justify-center">
            {user ? (
              <Button asChild size="lg">
                <Link href="/dashboard">Open ARMS Dashboard</Link>
              </Button>
            ) : null}
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
