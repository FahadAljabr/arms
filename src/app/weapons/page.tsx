import React from "react";
import { withAuth } from "@workos-inc/authkit-nextjs";
import WeaponsClient from "./_components/weapons-client";

export default async function WeaponsPage() {
  const { roles } = await withAuth({ ensureSignedIn: true });
  const isTechnician = roles?.includes("technician") ?? false;
  return <WeaponsClient isTechnician={isTechnician} />;
}
