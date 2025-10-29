// ARMS schema using Drizzle ORM for Postgres with Zod validators
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  doublePrecision,
  index,
  numeric,
  pgEnum,
  pgTableCreator,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/**
 * Use the multi-project schema feature of Drizzle ORM.
 * All tables will be created with the prefix `arms_`.
 */
export const createTable = pgTableCreator((name) => `arms_${name}`);

// =====================
// Enums
// =====================
export const assetStatusEnum = pgEnum("asset_status", [
  "Operational",
  "In Maintenance",
  "Decommissioned",
]);

export const assetTypeEnum = pgEnum("asset_type", [
  "Patrol Car",
  "Armored Vehicle",
  "Rifle",
  "Other",
]);

export const recordStatusEnum = pgEnum("record_status", [
  "Open",
  "In Progress",
  "Closed",
]);

export const severityEnum = pgEnum("severity", ["Low", "Medium", "High"]);

// =====================
// Tables
// =====================

export const assets = createTable(
  "assets",
  (t) => ({
    id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
    assetType: assetTypeEnum("asset_type").notNull(),
    model: t.varchar({ length: 100 }),
    status: assetStatusEnum("status").notNull().default("Operational"),
    sector: t.text().notNull(),
    currentKm: t.integer(),
    lastServiceAt: t.timestamp({ withTimezone: true }),
    commissionedAt: t.timestamp({ withTimezone: true }),
    decommissionedAt: t.timestamp({ withTimezone: true }),
    riskScore: doublePrecision(),
    createdAt: t.timestamp({ withTimezone: true }).$defaultFn(() => new Date()),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    createdBy: t.varchar({ length: 100 }).notNull(),
    updatedBy: t.varchar({ length: 100 }).notNull(),
    deletedAt: t.timestamp({ withTimezone: true }),
    deletedBy: t.varchar({ length: 100 }),
  }),
  (tbl) => [
    index("assets_sector_idx").on(tbl.sector),
    index("assets_status_idx").on(tbl.status),
  ],
);

export const maintenanceRecords = createTable(
  "maintenance_records",
  (t) => ({
    id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
    assetId: t
      .integer()
      .notNull()
      .references(() => assets.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    technicianId: t.varchar({ length: 100 }).notNull(),
    issueDate: t.timestamp({ withTimezone: true }).notNull(),
    completionDate: t.timestamp({ withTimezone: true }),
    problemDescription: t.text().notNull(),
    actionTaken: t.text(),
    status: recordStatusEnum("status").notNull().default("Open"),
    odometerKm: t.integer(),
    downtimeHours: t.integer(),
    severity: severityEnum("severity"),
    category: t.varchar({ length: 50 }),
    createdAt: t.timestamp({ withTimezone: true }).$defaultFn(() => new Date()),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    createdBy: t.varchar({ length: 100 }).notNull(),
    updatedBy: t.varchar({ length: 100 }).notNull(),
    deletedAt: t.timestamp({ withTimezone: true }),
    deletedBy: t.varchar({ length: 100 }),
  }),
  (tbl) => [
    index("maintenance_records_asset_issue_idx").on(tbl.assetId, tbl.issueDate),
    index("maintenance_records_status_idx").on(tbl.status),
  ],
);

export const spareParts = createTable(
  "spare_parts",
  (t) => ({
    id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
    partName: t.varchar({ length: 255 }).notNull(),
    partNumber: t.varchar({ length: 100 }),
    unit: t.varchar({ length: 20 }), // pcs, liters, etc.
    unitCost: numeric({ precision: 12, scale: 2 }),
    reorderThreshold: t.integer().default(0),
    quantityOnHand: t.integer().notNull().default(0),
    createdAt: t.timestamp({ withTimezone: true }).$defaultFn(() => new Date()),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    createdBy: t.varchar({ length: 100 }).notNull(),
    updatedBy: t.varchar({ length: 100 }).notNull(),
    deletedAt: t.timestamp({ withTimezone: true }),
    deletedBy: t.varchar({ length: 100 }),
  }),
  (tbl) => [
    uniqueIndex("spare_parts_part_number_unique").on(tbl.partNumber),
    check("spare_parts_qty_non_negative", sql`${tbl.quantityOnHand} >= 0`),
  ],
);

export const maintenanceRecordParts = createTable(
  "maintenance_record_parts",
  (t) => ({
    recordId: t
      .integer()
      .notNull()
      .references(() => maintenanceRecords.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    partId: t
      .integer()
      .notNull()
      .references(() => spareParts.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    quantityUsed: t.integer().notNull(),
    createdAt: t.timestamp({ withTimezone: true }).$defaultFn(() => new Date()),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    createdBy: t.varchar({ length: 100 }).notNull(),
    updatedBy: t.varchar({ length: 100 }).notNull(),
    deletedAt: t.timestamp({ withTimezone: true }),
    deletedBy: t.varchar({ length: 100 }),
  }),
  (tbl) => [
    primaryKey({
      name: "maintenance_record_parts_pk",
      columns: [tbl.recordId, tbl.partId],
    }),
  ],
);

export const maintenancePlans = createTable(
  "maintenance_plans",
  (t) => ({
    id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
    assetId: t
      .integer()
      .notNull()
      .references(() => assets.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    planDescription: t.text().notNull(),
    frequencyKm: t.integer(),
    frequencyDays: t.integer(),
    nextDueDate: date(),
    lastMaintenanceKm: t.integer(),
    createdAt: t.timestamp({ withTimezone: true }).$defaultFn(() => new Date()),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    createdBy: t.varchar({ length: 100 }).notNull(),
    updatedBy: t.varchar({ length: 100 }).notNull(),
    deletedAt: t.timestamp({ withTimezone: true }),
    deletedBy: t.varchar({ length: 100 }),
  }),
  (tbl) => [uniqueIndex("maintenance_plans_asset_unique").on(tbl.assetId)],
);

// =====================
// Relations
// =====================

export const assetsRelations = relations(assets, ({ one, many }) => ({
  maintenanceRecords: many(maintenanceRecords),
  maintenancePlan: one(maintenancePlans, {
    fields: [assets.id],
    references: [maintenancePlans.assetId],
  }),
}));

export const maintenanceRecordsRelations = relations(
  maintenanceRecords,
  ({ one, many }) => ({
    asset: one(assets, {
      fields: [maintenanceRecords.assetId],
      references: [assets.id],
    }),
    parts: many(maintenanceRecordParts),
  }),
);

export const sparePartsRelations = relations(spareParts, ({ many }) => ({
  usedInRecords: many(maintenanceRecordParts),
}));

export const maintenanceRecordPartsRelations = relations(
  maintenanceRecordParts,
  ({ one }) => ({
    record: one(maintenanceRecords, {
      fields: [maintenanceRecordParts.recordId],
      references: [maintenanceRecords.id],
    }),
    part: one(spareParts, {
      fields: [maintenanceRecordParts.partId],
      references: [spareParts.id],
    }),
  }),
);

export const maintenancePlansRelations = relations(
  maintenancePlans,
  ({ one }) => ({
    asset: one(assets, {
      fields: [maintenancePlans.assetId],
      references: [assets.id],
    }),
  }),
);

// =====================
// Zod Schemas (Insert/Select)
// =====================

export const insertAssetSchema = createInsertSchema(assets);
export const selectAssetSchema = createSelectSchema(assets);

export const insertMaintenanceRecordSchema =
  createInsertSchema(maintenanceRecords);
export const selectMaintenanceRecordSchema =
  createSelectSchema(maintenanceRecords);

export const insertSparePartSchema = createInsertSchema(spareParts);
export const selectSparePartSchema = createSelectSchema(spareParts);

export const insertMaintenanceRecordPartSchema = createInsertSchema(
  maintenanceRecordParts,
);
export const selectMaintenanceRecordPartSchema = createSelectSchema(
  maintenanceRecordParts,
);

export const insertMaintenancePlanSchema = createInsertSchema(maintenancePlans);
export const selectMaintenancePlanSchema = createSelectSchema(maintenancePlans);
