export const PRODUCT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"] as const;

export const PRODUCT_COLORS = ["White", "Black", "Off-white", "Green", "Brown"] as const;

export const PRODUCT_COLOR_SWATCHES: Record<string, string> = {
  White: "#ffffff",
  Black: "#000000",
  "Off-white": "#f2ead9",
  Green: "#3f5c3f",
  Brown: "#6b4423",
};

export type SizeQuantities = Partial<Record<(typeof PRODUCT_SIZES)[number], number>>;

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  size_quantities: SizeQuantities;
  discount_percent: number;
  colors: string[];
  created_at: string;
};

export function totalStock(sizeQuantities: SizeQuantities): number {
  return Object.values(sizeQuantities).reduce((sum: number, q) => sum + (q ?? 0), 0);
}

export function availableSizes(sizeQuantities: SizeQuantities): string[] {
  return PRODUCT_SIZES.filter((s) => (sizeQuantities[s] ?? 0) > 0);
}

export function getDiscountedPrice(price: number, discountPercent: number): number {
  if (!discountPercent) return price;
  return Math.round(price * (1 - discountPercent / 100));
}

export const ORDER_STATUSES = ["pending", "delivered"] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;

export type Order = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  delivery_fee: number;
  notes: string | null;
  total: number;
  status: string;
  payment_status: string;
  payment_ref: string | null;
  flw_transaction_id: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image_url: string;
  size: string;
  color?: string;
  quantity: number;
};
