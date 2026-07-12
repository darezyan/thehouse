import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import ProductDetail from "@/components/ProductDetail";

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

      <ProductDetail product={product} />
    </div>
  );
}
