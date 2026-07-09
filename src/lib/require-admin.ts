import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "./admin-session";

async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

// For Server Components (layouts/pages): redirects to login if unauthenticated.
export async function requireAdminPage() {
  if (!(await hasValidAdminSession())) {
    redirect("/nimda/login");
  }
}

// For Server Actions: throws instead of redirecting, since actions are
// reachable directly via POST regardless of which page rendered them.
export async function requireAdminAction() {
  if (!(await hasValidAdminSession())) {
    throw new Error("Unauthorized");
  }
}
