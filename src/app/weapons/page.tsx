import React from "react";
import { withAuth } from "@workos-inc/authkit-nextjs";
import WeaponsClient from "./_components/weapons-client";

export default async function WeaponsPage() {
  const { roles } = await withAuth({ ensureSignedIn: true });
  const isTechnician = roles?.includes("technician") ?? false;
  const isMajorGeneral = roles?.includes("major-general") ?? false;
  const isAdmin = roles?.includes("admin") ?? false;

  return (
    <WeaponsClient isTechnician={isTechnician || isMajorGeneral || isAdmin} />
  );
}
