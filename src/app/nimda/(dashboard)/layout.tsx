import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin";
import { logoutAction } from "./actions";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="-mt-16 min-h-screen bg-(--brand-cream) pt-16">
      <div className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <nav className="flex items-center gap-6 text-sm font-medium tracking-wide uppercase">
            <Link href="/nimda">Dashboard</Link>
            <Link href="/nimda/products">Products</Link>
            <Link href="/nimda/orders">Orders</Link>
          </nav>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-10">{children}</div>
    </div>
  );
}
