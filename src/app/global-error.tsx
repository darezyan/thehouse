"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <div
          className="flex min-h-screen items-center justify-center bg-cover bg-center px-5"
          style={{ backgroundImage: "url('/brand/banner.jpg')" }}
        >
          <div className="mx-auto w-full max-w-md bg-(--brand-cream)/95 px-8 py-14 text-center shadow-xl">
            <h1 className="text-2xl font-semibold tracking-wide uppercase">
              Something went wrong
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sorry about that. Please try again.
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-black px-6 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
