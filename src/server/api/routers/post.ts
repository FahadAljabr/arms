import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Deprecated: roles are now managed by WorkOS; this is a no-op to keep types stable in dev.
  create: publicProcedure
    .input(z.object({ roleName: z.string().min(1) }))
    .mutation(async () => {
      return { ok: true } as const;
    }),

  // Deprecated: always returns null since roles are not stored locally anymore
  // Keep return type compatible with the old shape `{ roleName: string } | null`.
  getLatest: publicProcedure.query(async () => {
    return null as unknown as { roleName: string } | null;
  }),
});
