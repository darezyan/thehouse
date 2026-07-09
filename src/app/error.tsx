"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="-mt-16 flex min-h-screen items-center justify-center bg-cover bg-center px-5 pt-16"
      style={{ backgroundImage: "url('/brand/banner.jpg')" }}
    >
      <div className="mx-auto w-full max-w-md bg-(--brand-cream)/95 px-8 py-14 text-center shadow-xl">
        <h1 className="text-2xl font-semibold tracking-wide uppercase">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          Sorry about that. You can try again, or head back home.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="h-11 px-6" onClick={() => unstable_retry()}>
            Try again
          </Button>
          <Button
            className="h-11 px-6"
            variant="outline"
            nativeButton={false}
            render={<Link href="/">Go home</Link>}
          />
        </div>
      </div>
    </div>
  );
}
