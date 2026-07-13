"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { getDiscountedPrice, type Product } from "@/lib/types";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";

export default function ProductDetail({ product }: { product: Product }) {
  const galleryImages = useMemo(() => {
    const colorImages = product.colors
      .map((c) => product.color_images[c])
      .filter((url): url is string => Boolean(url));
    // image_urls may already contain a color's photo (it's used as the
    // fallback cover when no general photo is uploaded), so dedupe.
    return Array.from(new Set([...product.image_urls, ...colorImages]));
  }, [product]);

  const colorImageIndex = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of product.colors) {
      const url = product.color_images[c];
      if (url) {
        const index = galleryImages.indexOf(url);
        if (index !== -1) map[c] = index;
      }
    }
    return map;
  }, [product, galleryImages]);

  const [activeIndex, setActiveIndex] = useState(0);

  const discountedPrice = getDiscountedPrice(product.price, product.discount_percent);
  const hasDiscount = product.discount_percent > 0;

  return (
    <div className="grid gap-10 sm:grid-cols-2">
      <ProductGallery
        images={galleryImages}
        alt={product.name}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
      />

      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold tracking-wide uppercase">{product.name}</h1>
        <p className="mt-2 text-lg">
          {hasDiscount ? (
            <>
              <span className="mr-2 text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-(--brand-gold)">{formatPrice(discountedPrice)}</span>
            </>
          ) : (
            <span className="text-(--brand-gold)">{formatPrice(product.price)}</span>
          )}
        </p>

        <p className="mt-6 leading-relaxed text-foreground/80">{product.description}</p>

        <div className="mt-8">
          <ProductActions
            product={product}
            onColorSelect={(color) => {
              const index = colorImageIndex[color];
              if (index !== undefined) setActiveIndex(index);
            }}
          />
        </div>
      </div>
    </div>
  );
}
