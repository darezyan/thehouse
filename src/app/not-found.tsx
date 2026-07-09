import { redirect } from "next/navigation";

// Without this, Next statically pre-builds this page at build time and the
// redirect never actually fires per-request on Vercel — it just serves a
// static 404 with no redirect. Forcing dynamic rendering makes the redirect
// run on every request, matching what local `next dev` already did.
export const dynamic = "force-dynamic";

export default function NotFound() {
  redirect("/");
}
