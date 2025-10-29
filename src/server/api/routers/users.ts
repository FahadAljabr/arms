import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { WorkOS } from "@workos-inc/node";

const workos = new WorkOS(env.WORKOS_API_KEY);

/**
 * Users router: fetch organization users from WorkOS and filter technicians.
 */
export const usersRouter = createTRPCRouter({
  getTechnicians: protectedProcedure.query(async ({ ctx }) => {
    const organization = ctx.organizationId;
    const users = await workos.userManagement.listOrganizationMemberships({
      organizationId: organization,
    });
    const technicianMembers = users.data.filter(
      (user) =>
        user.roles?.some(
          (role) =>
            "slug" in role && (role as { slug?: string }).slug === "technician",
        ) ?? false,
    );

    const technicians = await Promise.all(
      technicianMembers.map((user) => workos.userManagement.getUser(user.id)),
    );
    return technicians;
  }),
});
