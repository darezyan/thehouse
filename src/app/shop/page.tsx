import Link from "next/link";
import { getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { getDiscountedPrice, totalStock } from "@/lib/types";

export const revalidate = 0;

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="theme-noir -mt-16 min-h-screen bg-background pt-16 text-foreground">
      <div className="flex justify-center px-5 pt-6 pb-2">
        <img
          src="/brand/logo.png"
          alt="The House"
          className="h-32 w-auto sm:h-44"
        />
      </div>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">
            New arrivals coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
            {products.map((product) => {
              const soldOut = totalStock(product.size_quantities) === 0;
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group block"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
                    <img
                      src={product.image_urls[0]}
                      alt={product.name}
                      className={
                        "h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" +
                        (soldOut ? " opacity-50" : "")
                      }
                    />
                    {soldOut && (
                      <span className="absolute top-3 left-3 bg-black px-2.5 py-1 text-xs font-semibold tracking-wide text-(--brand-gold) uppercase">
                        Sold out
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-0.5 text-center">
                    <p className="text-sm font-medium tracking-wide uppercase">
                      {product.name}
                    </p>
                    {soldOut ? (
                      <p className="text-sm font-medium uppercase">Sold out</p>
                    ) : product.discount_percent > 0 ? (
                      <p className="text-sm">
                        <span className="mr-1.5 text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-(--brand-gold)">
                          {formatPrice(getDiscountedPrice(product.price, product.discount_percent))}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-(--brand-gold)">{formatPrice(product.price)}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
