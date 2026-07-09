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
  sizeQuantities: z.record(z.string(), z.number().int().min(0)),
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
    sizeQuantities,
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

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdminAction();

  const result = parseProductForm(formData);
  if (!result.success) {
    return { fieldErrors: flattenIssues(result.error) };
  }

  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { fieldErrors: { image: "Upload a product photo" } };
  }

  let imageUrl: string;
  try {
    imageUrl = await uploadImage(imageFile);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed" };
  }

  const { error } = await supabaseAdmin.from("products").insert({
    name: result.data.name,
    description: result.data.description,
    price: result.data.price,
    size_quantities: result.data.sizeQuantities,
    image_url: imageUrl,
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

  const update: Record<string, unknown> = {
    name: result.data.name,
    description: result.data.description,
    price: result.data.price,
    size_quantities: result.data.sizeQuantities,
  };

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      update.image_url = await uploadImage(imageFile);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed" };
    }
  }

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
