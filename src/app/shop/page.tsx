import Link from "next/link";
import { getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";

export const revalidate = 0;

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="-mt-16 w-full">
        <img
          src="/brand/banner.jpg"
          alt=""
          className="h-72 w-full object-cover sm:h-105"
        />
      </div>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">
            New arrivals coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group block"
              >
                <div className="aspect-3/4 w-full overflow-hidden bg-white">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-3 space-y-0.5 text-center">
                  <p className="text-sm font-medium tracking-wide uppercase">
                    {product.name}
                  </p>
                  <p className="text-sm text-(--brand-gold)">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
