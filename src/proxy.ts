import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  defaultPathForUser,
  isPathAllowedForUser,
} from "@/modules/auth/roleAccess";
import {
  isOrganizationRole,
  isSystemRole,
  type AuthUser,
  type OrganizationRole,
  type SystemRole,
} from "@/modules/auth/types";

const publicExactPaths = new Set([
  "/login",
  "/forgot-password",
  "/reset-password",
]);

function isPublicPath(pathname: string) {
  if (publicExactPaths.has(pathname)) {
    return true;
  }

  if (pathname === "/auth/callback" || pathname.startsWith("/auth/callback/")) {
    return true;
  }

  // Semi-public borrower portal: /p/{token}/{loanId}
  if (pathname === "/p" || pathname.startsWith("/p/")) {
    return true;
  }

  return false;
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

function redirectTo(request: NextRequest, pathname: string, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(new URL(pathname, request.url));
  copyCookies(response, redirectResponse);
  return redirectResponse;
}

type AccessSnapshot = Pick<AuthUser, "role" | "systemRole" | "organization">;

async function resolveAccess(
  supabase: unknown,
  userId: string,
): Promise<AccessSnapshot> {
  const fallback: AccessSnapshot = {
    role: "owner",
    systemRole: null,
    organization: null,
  };

  try {
    const client = supabase as {
      from: (table: string) => {
        select: (columns: string) => {
          eq: (column: string, value: string) => {
            eq: (column: string, value: string) => {
              maybeSingle: () => Promise<{
                data: { role: string; organizations?: unknown } | null;
              }>;
            };
            maybeSingle: () => Promise<{
              data: {
                default_organization_id: string | null;
                system_role: string | null;
                is_active: boolean | null;
              } | null;
            }>;
            order?: (column: string, opts: { ascending: boolean }) => {
              limit: (n: number) => {
                maybeSingle: () => Promise<{
                  data: {
                    role: string;
                    organization_id: string;
                    organizations:
                      | { id: string; name: string }
                      | { id: string; name: string }[]
                      | null;
                  } | null;
                }>;
              };
            };
          };
        };
      };
    };

    const { data: profile } = await client
      .from("profiles")
      .select("default_organization_id, system_role, is_active")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.is_active === false) {
      return fallback;
    }

    const systemRole: SystemRole | null = isSystemRole(profile?.system_role)
      ? profile.system_role
      : null;

    if (systemRole === "superadmin") {
      return { role: "owner", systemRole, organization: null };
    }

    const orgId = profile?.default_organization_id;
    if (orgId) {
      const { data: member } = await client
        .from("organization_members")
        .select("role, organization_id, organizations(id, name)")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .maybeSingle();

      if (member && isOrganizationRole(member.role)) {
        const orgRaw = (
          member as {
            organizations?:
              | { id: string; name: string }
              | { id: string; name: string }[]
              | null;
            organization_id?: string;
          } | null
        )?.organizations;
        const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw;
        const memberOrgId =
          (member as { organization_id?: string }).organization_id ?? orgId;

        return {
          role: member.role,
          systemRole: null,
          organization: org?.id
            ? { id: org.id, name: org.name?.trim() || "—" }
            : { id: memberOrgId, name: "—" },
        };
      }
      // Stale default_organization_id without membership → onboarding
    }

    // No default org: check any membership
    const membershipQuery = client
      .from("organization_members")
      .select("role, organization_id, organizations(id, name)")
      .eq("user_id", userId) as {
      order: (
        column: string,
        opts: { ascending: boolean },
      ) => {
        limit: (n: number) => {
          maybeSingle: () => Promise<{
            data: {
              role: string;
              organization_id: string;
              organizations:
                | { id: string; name: string }
                | { id: string; name: string }[]
                | null;
            } | null;
          }>;
        };
      };
    };

    const { data: firstMember } = await membershipQuery
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstMember && isOrganizationRole(firstMember.role)) {
      const orgRaw = firstMember.organizations;
      const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw;
      return {
        role: firstMember.role,
        systemRole: null,
        organization: org?.id
          ? { id: org.id, name: org.name?.trim() || "—" }
          : { id: firstMember.organization_id, name: "—" },
      };
    }

    return { role: "owner", systemRole: null, organization: null };
  } catch {
    return fallback;
  }
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isPublicPath(pathname)) {
      return redirectTo(request, "/login", response);
    }

    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        let cookiesChanged = false;

        cookiesToSet.forEach(({ name, value }) => {
          if (request.cookies.get(name)?.value !== value) {
            cookiesChanged = true;
          }
          request.cookies.set(name, value);
        });

        // Avoid rewriting Set-Cookie on every getUser() when nothing changed —
        // that can trigger App Router RSC refetch storms.
        if (!cookiesChanged) {
          return;
        }

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((pathname === "/login" || pathname === "/forgot-password") && user) {
    const access = await resolveAccess(supabase, user.id);
    return redirectTo(request, defaultPathForUser(access), response);
  }

  if (!isPublicPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (user && !isPublicPath(pathname)) {
    const access = await resolveAccess(supabase, user.id);
    if (!isPathAllowedForUser(pathname, access)) {
      return redirectTo(request, defaultPathForUser(access), response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Exclude static assets and `/api/*` route handlers.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
