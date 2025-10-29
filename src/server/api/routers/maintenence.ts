import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import {
  maintenanceRecords,
  insertMaintenanceRecordSchema,
  insertSparePartSchema,
  spareParts,
  maintenancePlans,
  insertMaintenancePlanSchema,
  insertMaintenanceRecordPartSchema,
  maintenanceRecordParts,
} from "~/server/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export const maintenenceRecordRouter = createTRPCRouter({
  // Get all maintenance records
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.maintenanceRecords.findMany({
      with: {
        asset: true,
      },
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
        with: {
          asset: true,
          parts: true,
        },
      });
      return record ?? null;
    }),
  create: protectedProcedure
    .input(
      insertMaintenanceRecordSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        deletedAt: true,
        deletedBy: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error(
          "Forbidden: only technicians can create maintenance records",
        );
      }

      const actor = ctx.user.id;

      const [created] = await ctx.db
        .insert(maintenanceRecords)
        .values({ ...input, createdBy: actor, updatedBy: actor })
        .returning();
      return created;
    }),
  update: protectedProcedure
    .input(
      // Use the insert schema but make all fields optional except for id which is required
      insertMaintenanceRecordSchema
        .partial()
        .extend({ id: z.number().int().positive() })
        .omit({
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
          deletedAt: true,
          deletedBy: true,
        }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error(
          "Forbidden: only technicians can update maintenance records",
        );
      }
      const actor = ctx.user.id;
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(maintenanceRecords)
        .set({ ...data, updatedBy: actor })
        .where(eq(maintenanceRecords.id, id))
        .returning();
      return updated;
    }),
  // add record parts (conjuncture table)
  addRecordParts: protectedProcedure
    .input(
      insertMaintenanceRecordPartSchema.omit({
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        deletedBy: true,
        createdBy: true,
        updatedBy: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error(
          "Forbidden: only technicians can add parts to maintenance records",
        );
      }

      const actor = ctx.user.id;

      const [created] = await ctx.db
        .insert(maintenanceRecordParts)
        .values({ ...input, createdBy: actor, updatedBy: actor })
        .returning();
      return created;
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
      if (!ctx.user || !ctx.roles?.includes("technician")) {
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
  // mark a maintenance record as Closed set Completion Date (Technicians only)
  markAsClosed: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error(
          "Forbidden: only technicians can mark maintenance records as Closed",
        );
      }
      const actor = ctx.user.id;
      const [updated] = await ctx.db
        .update(maintenanceRecords)
        .set({
          status: "Closed",
          completionDate: new Date(),
          updatedBy: actor,
        })
        .where(eq(maintenanceRecords.id, input.id))
        .returning();
      return updated;
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
        createdBy: true,
        updatedBy: true,
        deletedAt: true,
        deletedBy: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error(
          "Forbidden: only technicians can create maintenance plans",
        );
      }
      const actor = ctx.user.id;
      const [created] = await ctx.db
        .insert(maintenancePlans)
        .values({ ...input, createdBy: actor, updatedBy: actor })
        .returning();
      return created;
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
        .extend({ id: z.number().int().positive() })
        .omit({
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
          deletedAt: true,
          deletedBy: true,
        }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error(
          "Forbidden: only technicians can update maintenance plans",
        );
      }

      const actor = ctx.user.id;
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(maintenancePlans)
        .set({ ...data, updatedBy: actor })
        .where(eq(maintenancePlans.id, id))
        .returning();

      return updated;
    }),
  // delete
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
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
        createdBy: true,
        updatedBy: true,
        deletedAt: true,
        deletedBy: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error("Forbidden: only technicians can create spare parts");
      }

      const actor = ctx.user.id;

      const [created] = await ctx.db
        .insert(spareParts)
        .values({ ...input, createdBy: actor, updatedBy: actor })
        .returning();
      return created;
    }),
  // update technician only
  update: protectedProcedure
    .input(
      insertSparePartSchema
        .partial()
        .extend({ id: z.number().int().positive() })
        .omit({
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
          deletedAt: true,
          deletedBy: true,
        }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error("Forbidden: only technicians can update spare parts");
      }

      const actor = ctx.user.id;
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(spareParts)
        .set({ ...data, updatedBy: actor })
        .where(eq(spareParts.id, id))
        .returning();
      return updated;
    }),
  // delete technician only
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.roles?.includes("technician")) {
        throw new Error("Forbidden: only technicians can delete spare parts");
      }

      const [deleted] = await ctx.db
        .delete(spareParts)
        .where(eq(spareParts.id, input.id))
        .returning();
      return deleted;
    }),
});
