import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { assets, users } from "~/server/db/schema";

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

  // Create a new asset (Technicians only)
  create: protectedProcedure
    .input(
      z.object({
        assetUid: z.string().min(1),
        assetType: z.enum(["Patrol Car", "Armored Vehicle", "Rifle", "Other"]),
        model: z.string().min(1).optional(),
        sectorId: z.number().int().positive(),
        currentKm: z.number().int().nonnegative().optional(),
        lastServiceAt: z.date().optional(),
        commissionedAt: z.date().optional(),
        decommissionedAt: z.date().optional(),
        riskScore: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Authorize: only technicians can create assets
      const currentUser = await ctx.db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, ctx.user!.id),
        with: { role: true },
      });

      const roleName = currentUser?.role?.roleName?.toLowerCase();
      if (roleName !== "technician") {
        throw new Error("Forbidden: only technicians can create assets");
      }

      const [created] = await ctx.db
        .insert(assets)
        .values({
          assetUid: input.assetUid,
          assetType: input.assetType,
          model: input.model,
          sectorId: input.sectorId,
          currentKm: input.currentKm,
          lastServiceAt: input.lastServiceAt,
          commissionedAt: input.commissionedAt,
          decommissionedAt: input.decommissionedAt,
          riskScore: input.riskScore,
        })
        .returning();

      return created;
    }),
});
