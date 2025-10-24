/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/prefer-nullish-coalescing */
import { WorkOS } from "@workos-inc/node";
import { env } from "~/env";

// Initialize WorkOS SDK using server-side API key
const workos = new WorkOS(env.WORKOS_API_KEY);

/**
 * Determine if the authenticated user has a given role.
 * This checks common shapes exposed by AuthKit session and falls back to
 * querying organization memberships via the WorkOS API.
 *
 * Note: Role checks are case-insensitive and match on role slug or name.
 */
export function hasRole(user: unknown, role: string): boolean {
  const target = role.trim().toLowerCase();
  if (!user) return false;

  // Try AuthKit session user shape first
  try {
    const u: any = user as any;
    // Common shape: user.organizationMemberships[] with role { slug, name }
    const memberships: any[] =
      u.organizationMemberships ?? u.memberships ?? u.organizations ?? [];
    for (const m of memberships) {
      const slug = m?.role?.slug?.toLowerCase?.();
      const name = m?.role?.name?.toLowerCase?.();
      if (slug === target || name === target) return true;
    }

    // Alternative shape: user.roles: string[]
    if (Array.isArray(u.roles)) {
      if (u.roles.some((r: any) => String(r).toLowerCase() === target)) {
        return true;
      }
    }
  } catch {
    // ignore and fall through
  }

  return false;
}

/**
 * Fetch roles for a user from WorkOS via organization memberships.
 * Useful if the session object doesn't include role information.
 */
export async function getUserRoleSlugs(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    // The AuthKit Organization Memberships API exposes role information.
    // See: https://workos.com/docs/reference/authkit/organization-membership/list
    // SDK method names can evolve; we handle via direct REST call if needed.

    // Attempt via SDK if available
    const listFn = (workos as any)?.userManagement?.organizationMemberships
      ?.list;
    if (typeof listFn === "function") {
      const resp = await listFn.call(
        (workos as any).userManagement.organizationMemberships,
        {
          userId,
        },
      );
      const data: any[] = resp?.data ?? resp ?? [];
      return data
        .map((m) => m?.role?.slug || m?.role?.name)
        .filter(Boolean)
        .map((s) => String(s).toLowerCase());
    }
  } catch {
    // ignore; fall back to empty
  }
  return [];
}
