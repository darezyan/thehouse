import { supabase } from "./supabase";
import type { Product } from "./types";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to load product:", error.message);
    return null;
  }
  return data;
}
