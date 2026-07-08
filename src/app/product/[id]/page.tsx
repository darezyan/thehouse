import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import ProductActions from "@/components/ProductActions";

export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link
        href="/shop"
        className="mb-6 inline-block text-sm font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground"
      >
        ← Back
      </Link>

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="aspect-3/4 w-full overflow-hidden bg-muted">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-wide uppercase">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-(--brand-gold)">
            {formatPrice(product.price)}
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
