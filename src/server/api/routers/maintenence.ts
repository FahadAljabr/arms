import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { hasRole } from "~/server/auth/roles";
import {
  maintenanceRecords,
  insertMaintenanceRecordSchema,
  insertSparePartSchema,
  spareParts,
  maintenancePlans,
  insertMaintenancePlanSchema,
} from "~/server/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export const maintenenceRecordRouter = createTRPCRouter({
  // Get all maintenance records
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.maintenanceRecords.findMany({
      orderBy: (maintenanceRecords, { desc }) => [
        desc(maintenanceRecords.createdAt),
      ],
    });
    return rows;
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.query.maintenanceRecords.findFirst({
        where: (maintenanceRecords, { eq }) =>
          eq(maintenanceRecords.id, input.id),
      });
      return record ?? null;
    }),
  create: protectedProcedure
    .input(
      insertMaintenanceRecordSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !hasRole(ctx.user, "technician")) {
        throw new Error(
          "Forbidden: only technicians can create maintenance records",
        );
      }

      const [created] = await ctx.db
        .insert(maintenanceRecords)
        .values(input)
        .returning();
      return created;
    }),
  update: protectedProcedure
    .input(
      // Use the insert schema but make all fields optional except for id which is required
      insertMaintenanceRecordSchema
        .partial()
        .extend({ id: z.number().int().positive() }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !hasRole(ctx.user, "technician")) {
        throw new Error(
          "Forbidden: only technicians can update maintenance records",
        );
      }
    }),
  getByCategory: protectedProcedure
    .input(z.object({ category: z.string().min(2).max(100) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.maintenanceRecords.findMany({
        where: (maintenanceRecords, { eq }) =>
          eq(maintenanceRecords.category, input.category),
        orderBy: (maintenanceRecords, { desc }) => [
          desc(maintenanceRecords.createdAt),
        ],
      });
      return rows;
    }),

  // delete a maintenance record by its ID (Technicians only)
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !hasRole(ctx.user, "technician")) {
        throw new Error(
          "Forbidden: only technicians can delete maintenance records",
        );
      }
      const [deleted] = await ctx.db
        .delete(maintenanceRecords)
        .where(eq(maintenanceRecords.id, input.id))
        .returning();
      return deleted;
    }),
});

export const maintenancePlanRouter = createTRPCRouter({
  // Create
  create: protectedProcedure
    .input(
      insertMaintenancePlanSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !hasRole(ctx.user, "technician")) {
        throw new Error(
          "Forbidden: only technicians can create maintenance plans",
        );
      }
    }),
  // get all
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.maintenancePlans.findMany({
      orderBy: (maintenancePlans, { desc }) => [
        desc(maintenancePlans.createdAt),
      ],
    });
    return rows;
  }),
  // get by id
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.query.maintenancePlans.findFirst({
        where: (maintenancePlans, { eq }) => eq(maintenancePlans.id, input.id),
      });
      return record ?? null;
    }),
  // update
  update: protectedProcedure
    .input(
      insertMaintenancePlanSchema
        .partial()
        .extend({ id: z.number().int().positive() }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !hasRole(ctx.user, "technician")) {
        throw new Error(
          "Forbidden: only technicians can update maintenance plans",
        );
      }

      const [updated] = await ctx.db
        .update(maintenancePlans)
        .set(input)
        .where(eq(maintenancePlans.id, input.id))
        .returning();

      return updated;
    }),
  // delete
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !hasRole(ctx.user, "technician")) {
        throw new Error(
          "Forbidden: only technicians can delete maintenance plans",
        );
      }

      const [deleted] = await ctx.db
        .delete(maintenancePlans)
        .where(eq(maintenancePlans.id, input.id))
        .returning();

      return deleted;
    }),
});

// ============================ Spare Parts Management ============================

export const sparePartsRouter = createTRPCRouter({
  // get all spare parts
  getall: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.spareParts.findMany({
      orderBy: (spareParts, { desc }) => [desc(spareParts.createdAt)],
    });
    return rows;
  }),

  // getById
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.query.spareParts.findFirst({
        where: (spareParts, { eq }) => eq(spareParts.id, input.id),
      });
      return record ?? null;
    }),
  // create technician only
  create: protectedProcedure
    .input(
      insertSparePartSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !hasRole(ctx.user, "technician")) {
        throw new Error("Forbidden: only technicians can create spare parts");
      }

      const [created] = await ctx.db
        .insert(spareParts)
        .values(input)
        .returning();
      return created;
    }),
  // update technician only
  update: protectedProcedure
    .input(
      insertSparePartSchema
        .partial()
        .extend({ id: z.number().int().positive() }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !hasRole(ctx.user, "technician")) {
        throw new Error("Forbidden: only technicians can update spare parts");
      }

      const [updated] = await ctx.db
        .update(spareParts)
        .set(input)
        .where(eq(spareParts.id, input.id))
        .returning();
      return updated;
    }),
  // delete technician only
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !hasRole(ctx.user, "technician")) {
        throw new Error("Forbidden: only technicians can delete spare parts");
      }

      const [deleted] = await ctx.db
        .delete(spareParts)
        .where(eq(spareParts.id, input.id))
        .returning();
      return deleted;
    }),
});
