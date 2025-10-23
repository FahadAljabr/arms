// ARMS schema using Drizzle ORM for Postgres with Zod validators
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  doublePrecision,
  index,
  integer,
  numeric,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  boolean,
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

export const roles = createTable(
  "roles",
  (t) => ({
    id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
    roleName: t.varchar({ length: 50 }).notNull(),
    createdAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
  }),
  (tbl) => [uniqueIndex("roles_role_name_unique").on(tbl.roleName)],
);

export const users = createTable(
  "users",
  (t) => ({
    // WorkOS user id (e.g., "user_01H...")
    id: t.varchar({ length: 100 }).primaryKey(),
    fullName: t.varchar({ length: 255 }).notNull(),
    email: t.varchar({ length: 255 }).notNull(),
    roleId: t
      .integer()
      .notNull()
      .references(() => roles.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    isActive: t.boolean().notNull().default(true),
    lastLoginAt: t.timestamp({ withTimezone: true }),
    createdAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  }),
  (tbl) => [
    uniqueIndex("users_email_unique").on(tbl.email),
    index("users_role_id_idx").on(tbl.roleId),
  ],
);

export const sectors = createTable(
  "sectors",
  (t) => ({
    id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
    sectorName: t.varchar({ length: 100 }).notNull(),
    createdAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  }),
  (tbl) => [uniqueIndex("sectors_sector_name_unique").on(tbl.sectorName)],
);

export const assets = createTable(
  "assets",
  (t) => ({
    id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
    assetUid: t.varchar({ length: 100 }).notNull(),
    assetType: assetTypeEnum("asset_type").notNull(),
    model: t.varchar({ length: 100 }),
    status: assetStatusEnum("status").notNull().default("Operational"),
    sectorId: t
      .integer()
      .notNull()
      .references(() => sectors.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    currentKm: t.integer(),
    lastServiceAt: t.timestamp({ withTimezone: true }),
    commissionedAt: t.timestamp({ withTimezone: true }),
    decommissionedAt: t.timestamp({ withTimezone: true }),
    riskScore: doublePrecision(),
    createdAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  }),
  (tbl) => [
    uniqueIndex("assets_asset_uid_unique").on(tbl.assetUid),
    index("assets_sector_id_idx").on(tbl.sectorId),
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
    // Note: Users.id is varchar(100), here spec asks for varchar(64). It's okay as values will fit.
    technicianId: t
      .varchar({ length: 64 })
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    officerId: t
      .varchar({ length: 64 })
      .references(() => users.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    issueDate: t.timestamp({ withTimezone: true }).notNull(),
    completionDate: t.timestamp({ withTimezone: true }),
    problemDescription: t.text().notNull(),
    actionTaken: t.text(),
    status: recordStatusEnum("status").notNull().default("Open"),
    odometerKm: t.integer(),
    downtimeHours: t.integer(),
    severity: severityEnum("severity"),
    category: t.varchar({ length: 50 }),
    createdAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
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
    createdAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
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
    createdAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: t
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  }),
  (tbl) => [uniqueIndex("maintenance_plans_asset_unique").on(tbl.assetId)],
);

export const auditLogs = createTable("audit_logs", (t) => ({
  id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: t.varchar({ length: 64 }).references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  actionType: t.varchar({ length: 50 }).notNull(),
  tableName: t.varchar({ length: 50 }),
  recordId: t.integer(),
  details: t.text(), // JSON string
  ipAddress: t.varchar({ length: 64 }),
  userAgent: t.varchar({ length: 255 }),
  prevHash: t.varchar({ length: 128 }),
  rowHash: t.varchar({ length: 128 }),
  createdAt: t
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`),
}));

// =====================
// Relations
// =====================

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  technicianRecords: many(maintenanceRecords, { relationName: "technician" }),
  officerRecords: many(maintenanceRecords, { relationName: "officer" }),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const sectorsRelations = relations(sectors, ({ many }) => ({
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  sector: one(sectors, {
    fields: [assets.sectorId],
    references: [sectors.id],
  }),
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
    technician: one(users, {
      fields: [maintenanceRecords.technicianId],
      references: [users.id],
      relationName: "technician",
    }),
    officer: one(users, {
      fields: [maintenanceRecords.officerId],
      references: [users.id],
      relationName: "officer",
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

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// =====================
// Zod Schemas (Insert/Select)
// =====================

export const insertRoleSchema = createInsertSchema(roles);
export const selectRoleSchema = createSelectSchema(roles);

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertSectorSchema = createInsertSchema(sectors);
export const selectSectorSchema = createSelectSchema(sectors);

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

export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const selectAuditLogSchema = createSelectSchema(auditLogs);
