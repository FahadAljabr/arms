import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const assetRouter = createTRPCRouter({
  // Get a single asset by its numeric ID
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.query.assets.findFirst({
        where: (assets, { eq }) => eq(assets.id, input.id),
      });
      return asset ?? null;
    }),

  // Get all assets that belong to a specific sector
  getBySector: protectedProcedure
    .input(z.object({ sectorId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.assets.findMany({
        where: (assets, { eq }) => eq(assets.sectorId, input.sectorId),
        orderBy: (assets, { asc }) => [asc(assets.id)],
      });
      return rows;
    }),

  // Get all assets
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.assets.findMany({
      orderBy: (assets, { desc }) => [desc(assets.createdAt)],
    });
    return rows;
  }),
});
