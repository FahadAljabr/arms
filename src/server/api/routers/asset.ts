import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { assets, insertAssetSchema } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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
    // use draft zod schema for input validation
    .input(z.object({ sector: z.string().min(2).max(100) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.assets.findMany({
        where: (assets, { eq }) => eq(assets.sector, input.sector),
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

  // Create a new asset (Technicians only)
  create: protectedProcedure
    .input(
      insertAssetSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error("Forbidden: only technicians can create assets");
      }

      const [created] = await ctx.db.insert(assets).values(input).returning();
      return created;
    }),
  update: protectedProcedure
    .input(
      // Use the insert schema but make all fields optional except for id which is required
      insertAssetSchema.partial().extend({ id: z.number().int().positive() }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error("Forbidden: only technicians can update assets");
      }

      const [updated] = await ctx.db
        .update(assets)
        .set(input)
        .where(eq(assets.id, input.id))
        .returning();

      return updated;
    }),
  // Delete an asset by its ID (Technicians only)
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error("Forbidden: only technicians can delete assets");
      }

      const [deleted] = await ctx.db
        .delete(assets)
        .where(eq(assets.id, input.id))
        .returning();

      return deleted;
    }),
});
