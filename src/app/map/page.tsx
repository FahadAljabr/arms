import { redirect } from "next/navigation";
import { withAuth } from "@workos-inc/authkit-nextjs";
import MapClient from "./_components/map-client";

export const metadata = {
  title: "Asset Map | ARMS",
  description: "Interactive map showing asset locations",
};

export default async function MapPage() {
  const { user, roles } = await withAuth();
  const isAdmin = roles?.includes("admin") ?? false;
  const isMajorGeneral = roles?.includes("major-general") ?? false;
  if (!user) {
    redirect("/login");
  }
  if (isAdmin || isMajorGeneral) {
    return (
      <div className="h-screen w-full">
        <MapClient />
      </div>
    );
  } else {
    redirect("/");
  }
}
