"use server";

import { z } from "zod";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/require-admin";
import { supabaseAdmin, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase-admin";
import { PRODUCT_SIZES } from "@/lib/types";

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name"),
  description: z.string().trim().min(10, "Enter a description (min 10 characters)"),
  price: z.coerce.number().positive("Enter a valid price"),
  discountPercent: z.coerce.number().int().min(0, "Enter 0-100").max(100, "Enter 0-100"),
  sizeQuantities: z.record(z.string(), z.number().int().min(0)),
  colors: z.array(z.string()),
});

function parseProductForm(formData: FormData) {
  const sizeQuantities: Record<string, number> = {};
  for (const size of PRODUCT_SIZES) {
    const raw = Number(formData.get(`qty_${size}`) ?? 0);
    sizeQuantities[size] = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  }

  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    discountPercent: formData.get("discountPercent") || 0,
    sizeQuantities,
    colors: formData.getAll("colors"),
  });
}

function flattenIssues(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

async function uploadImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, buffer, { contentType: file.type || "image/jpeg" });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadImage(file));
  }
  return urls;
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdminAction();

  const result = parseProductForm(formData);
  if (!result.success) {
    return { fieldErrors: flattenIssues(result.error) };
  }

  const imageFiles = formData.getAll("images").filter(
    (f): f is File => f instanceof File && f.size > 0
  );
  if (imageFiles.length === 0) {
    return { fieldErrors: { images: "Upload at least one product photo" } };
  }

  let imageUrls: string[];
  try {
    imageUrls = await uploadImages(imageFiles);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed" };
  }

  const { error } = await supabaseAdmin.from("products").insert({
    name: result.data.name,
    description: result.data.description,
    price: result.data.price,
    discount_percent: result.data.discountPercent,
    size_quantities: result.data.sizeQuantities,
    colors: result.data.colors,
    image_urls: imageUrls,
  });

  if (error) {
    return { error: "Something went wrong creating the product." };
  }

  revalidatePath("/nimda/products");
  revalidatePath("/shop");
  redirect("/nimda/products");
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdminAction();

  const result = parseProductForm(formData);
  if (!result.success) {
    return { fieldErrors: flattenIssues(result.error) };
  }

  const existingImages = formData.getAll("existingImages").map(String);
  const newImageFiles = formData.getAll("images").filter(
    (f): f is File => f instanceof File && f.size > 0
  );

  let newImageUrls: string[];
  try {
    newImageUrls = await uploadImages(newImageFiles);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed" };
  }

  const imageUrls = [...existingImages, ...newImageUrls];
  if (imageUrls.length === 0) {
    return { fieldErrors: { images: "A product needs at least one photo" } };
  }

  const update = {
    name: result.data.name,
    description: result.data.description,
    price: result.data.price,
    discount_percent: result.data.discountPercent,
    size_quantities: result.data.sizeQuantities,
    colors: result.data.colors,
    image_urls: imageUrls,
  };

  const { error } = await supabaseAdmin.from("products").update(update).eq("id", productId);

  if (error) {
    return { error: "Something went wrong updating the product." };
  }

  revalidatePath("/nimda/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${productId}`);
  redirect("/nimda/products");
}

export async function deleteProductAction(productId: string) {
  await requireAdminAction();
  await supabaseAdmin.from("products").delete().eq("id", productId);
  revalidatePath("/nimda/products");
  revalidatePath("/shop");
}
