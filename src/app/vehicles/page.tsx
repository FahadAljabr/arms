import React from "react";
import { withAuth } from "@workos-inc/authkit-nextjs";
import VehiclesClient from "./_components/vehicles-client";

export default async function VehiclesPage() {
  const { roles } = await withAuth({ ensureSignedIn: true });
  const isTechnician = roles?.includes("technician") ?? false;
  return <VehiclesClient isTechnician={isTechnician} />;
}
