import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { WorkOS } from "@workos-inc/node";

const workos = new WorkOS(env.WORKOS_API_KEY);

/**
 * Users router: fetch organization users from WorkOS and filter technicians.
 */
export const usersRouter = createTRPCRouter({
  getTechnicians: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.roles?.includes("technician")) throw new Error("Forbidden");

    const organization = ctx.organizationId;
    const users = await workos.userManagement.listOrganizationMemberships({
      organizationId: organization,
    });
    const technicianMembers = users.data.filter(
      (user) =>
        // skip signedin user ctx.user
        (user.userId !== ctx.user.id &&
          user.roles?.some(
            (role) => (role as { slug?: string }).slug === "technician",
          )) ??
        false,
    );
    const technicians = await Promise.all(
      technicianMembers.map((user) =>
        workos.userManagement.getUser(user.userId),
      ),
    );
    // append current user to technicians
    technicians.push(ctx.user);
    return technicians;
  }),
});
