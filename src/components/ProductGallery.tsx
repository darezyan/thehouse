"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function ProductGallery({
  images,
  alt,
  activeIndex,
  onIndexChange,
}: {
  images: string[];
  alt: string;
  activeIndex: number;
  onIndexChange: (index: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  // While a programmatic smooth-scroll (from clicking a color/arrow/dot) is
  // still animating, the scroll event fires on its in-between positions —
  // without this guard, handleScroll reads one of those intermediate
  // positions as the "real" index and redirects the scroll mid-flight,
  // making it land one photo short of the intended target.
  const isProgrammaticScroll = useRef(false);
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = activeIndex * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) > 4) {
      isProgrammaticScroll.current = true;
      el.scrollTo({ left: target, behavior: "smooth" });
      if (settleTimeout.current) clearTimeout(settleTimeout.current);
      settleTimeout.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  }, [activeIndex]);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || isProgrammaticScroll.current) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== activeIndex) onIndexChange(index);
  }

  if (images.length === 0) {
    return <div className="aspect-3/4 w-full bg-muted" />;
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="no-scrollbar flex aspect-3/4 w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
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
          {activeIndex > 0 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => onIndexChange(activeIndex - 1)}
              className="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg"
            >
              ‹
            </button>
          )}
          {activeIndex < images.length - 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => onIndexChange(activeIndex + 1)}
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
                onClick={() => onIndexChange(i)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition",
                  i === activeIndex ? "bg-black" : "bg-black/30"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
