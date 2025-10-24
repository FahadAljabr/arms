import "~/styles/globals.css";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { withAuth } from "@workos-inc/authkit-nextjs";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { MainNavigation } from "~/components/main-navigation";
import { ThemeProvider } from "~/components/theme-provider";

export const metadata: Metadata = {
  title: "Vehicle & Weapon Maintenance System",
  description: "Comprehensive maintenance tracking for vehicles and weapons",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await withAuth({ ensureSignedIn: false });
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthKitProvider>
            <TRPCReactProvider>
              <MainNavigation />
              <main>{children}</main>
            </TRPCReactProvider>
          </AuthKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
