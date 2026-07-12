import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { getDiscountedPrice } from "@/lib/types";
import ProductActions from "@/components/ProductActions";
import ProductGallery from "@/components/ProductGallery";

export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const discountedPrice = getDiscountedPrice(product.price, product.discount_percent);
  const hasDiscount = product.discount_percent > 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link
        href="/shop"
        className="mb-6 inline-block text-sm font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground"
      >
        ← Back
      </Link>

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="overflow-hidden bg-muted">
          <ProductGallery images={product.image_urls} alt={product.name} />
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-wide uppercase">
            {product.name}
          </h1>
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

          <p className="mt-6 leading-relaxed text-foreground/80">
            {product.description}
          </p>

          <div className="mt-8">
            <ProductActions product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
