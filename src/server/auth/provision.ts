import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { roles, users } from "~/server/db/schema";

/**
 * Ensure a DB user exists for the authenticated WorkOS user.
 * - Creates the user with a default role (Officer) if missing.
 * - Updates lastLoginAt on subsequent sign-ins.
 * Idempotent and safe to call on every request.
 */
export async function ensureProvisionedUser(params: {
  id: string;
  email: string | null | undefined;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const { id, email, firstName, lastName } = params;
  if (!id) return;

  // Check if user already exists
  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, id),
  });

  if (existing) {
    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
    return existing;
  }

  // Resolve a default role (Officer). Create it if it doesn't exist.
  let defaultRole = await db.query.roles.findFirst({
    where: (r, { eq }) => eq(r.roleName, "Officer"),
  });

  if (!defaultRole) {
    const inserted = await db
      .insert(roles)
      .values({ roleName: "Officer" })
      .returning();
    defaultRole = inserted[0];
  }

  const fullName = [firstName ?? "", lastName ?? ""].join(" ").trim();

  // Create the new user
  const [created] = await db
    .insert(users)
    .values({
      id,
      email: email ?? "",
      fullName: fullName || (email ?? "Unknown"),
      roleId: defaultRole!.id,
      isActive: true,
      lastLoginAt: new Date(),
    })
    .returning();

  return created;
}
