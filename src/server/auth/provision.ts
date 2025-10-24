/**
 * Legacy no-op. Users are provisioned and managed by WorkOS.
 * Left in place to avoid breaking imports during development.
 */
export async function ensureProvisionedUser(_: {
  id: string;
  email: string | null | undefined;
  firstName?: string | null;
  lastName?: string | null;
}) {
  return null;
}
