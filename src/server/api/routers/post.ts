import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { roles } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ roleName: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(roles).values({
        roleName: input.roleName,
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const role = await ctx.db.query.roles.findFirst({
      orderBy: (roles, { desc }) => [desc(roles.createdAt)],
    });

    return role ?? null;
  }),
});
