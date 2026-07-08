export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sizes: string[];
  in_stock: boolean;
  created_at: string;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image_url: string;
  size: string;
  quantity: number;
};
