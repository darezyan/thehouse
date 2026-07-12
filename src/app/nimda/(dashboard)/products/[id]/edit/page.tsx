import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Product } from "@/lib/types";
import ProductForm from "../../product-form";
import { updateProductAction } from "../../actions";

export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .single<Product>();

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-wide uppercase">Edit product</h1>
      <ProductForm
        action={updateProductAction.bind(null, product.id)}
        submitLabel="Save changes"
        initialValues={{
          name: product.name,
          description: product.description,
          price: product.price,
          discountPercent: product.discount_percent,
          sizeQuantities: product.size_quantities,
          colors: product.colors,
          imageUrls: product.image_urls,
        }}
      />
    </div>
  );
}
