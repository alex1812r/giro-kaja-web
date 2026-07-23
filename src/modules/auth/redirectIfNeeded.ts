import type { AuthUser } from "@/modules/auth/types";

import { defaultPathForUser, isPathAllowedForUser } from "./roleAccess";

/**
 * Returns a destination only when the current path is not allowed.
 * Callers must skip navigation when this returns null to avoid
 * `router.replace(sameUrl)` loops (RSC refetch storms in App Router).
 */
export function redirectPathIfNeeded(
  pathname: string,
  user: Pick<AuthUser, "role" | "systemRole" | "organization">,
): string | null {
  if (isPathAllowedForUser(pathname, user)) {
    return null;
  }

  const destination = defaultPathForUser(user);
  return destination === pathname ? null : destination;
}
