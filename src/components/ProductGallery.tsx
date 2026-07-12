"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(index);
  }

  function goTo(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  if (images.length === 0) {
    return <div className="aspect-3/4 w-full bg-muted" />;
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex aspect-3/4 w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      >
        {images.map((src) => (
          <img
            key={src}
            src={src}
            alt={alt}
            className="h-full w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          {active > 0 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => goTo(active - 1)}
              className="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg"
            >
              ‹
            </button>
          )}
          {active < images.length - 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => goTo(active + 1)}
              className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg"
            >
              ›
            </button>
          )}

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition",
                  i === active ? "bg-black" : "bg-black/30"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
