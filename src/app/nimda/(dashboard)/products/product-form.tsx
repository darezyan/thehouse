"use client";

import { useActionState, useState } from "react";
import { PRODUCT_SIZES, PRODUCT_COLORS, PRODUCT_COLOR_SWATCHES, type SizeQuantities } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductFormState } from "./actions";

const initialState: ProductFormState = {};

// Vercel's serverless functions hard-cap request bodies at 4.5MB no matter
// what next.config's bodySizeLimit says, and phone camera photos routinely
// exceed that — so shrink every image client-side before it's ever uploaded.
async function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

async function compressFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file)));
}

function replaceInputFiles(input: HTMLInputElement, files: File[]) {
  const dt = new DataTransfer();
  for (const file of files) dt.items.add(file);
  input.files = dt.files;
}

type ProductFormProps = {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  submitLabel: string;
  initialValues?: {
    name: string;
    description: string;
    price: number;
    discountPercent: number;
    sizeQuantities: SizeQuantities;
    colors: string[];
    colorImages: Record<string, string>;
    imageUrls: string[];
  };
};

export default function ProductForm({ action, submitLabel, initialValues }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state.fieldErrors ?? {};

  // Controlled so a failed submission (e.g. missing photo) can't wipe what
  // was already typed — uncontrolled defaultValue inputs were losing their
  // values across the round trip.
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [price, setPrice] = useState(initialValues?.price?.toString() ?? "");
  const [discountPercent, setDiscountPercent] = useState(
    (initialValues?.discountPercent ?? 0).toString()
  );
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const size of PRODUCT_SIZES) {
      initial[size] = (initialValues?.sizeQuantities[size] ?? 0).toString();
    }
    return initial;
  });

  const [existingImages, setExistingImages] = useState<string[]>(initialValues?.imageUrls ?? []);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialValues?.colors ?? []);
  const [colorPreviews, setColorPreviews] = useState<Record<string, string>>({});
  // Submit is blocked while > 0, so a fast click can't beat compression and
  // send the original oversized file straight through.
  const [compressingCount, setCompressingCount] = useState(0);

  async function handleNewImages(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    setCompressingCount((c) => c + 1);
    try {
      const compressed = await compressFiles(files);
      replaceInputFiles(input, compressed);
      setNewImagePreviews(compressed.map((f) => URL.createObjectURL(f)));
    } finally {
      setCompressingCount((c) => c - 1);
    }
  }

  function toggleColor(color: string, checked: boolean) {
    setSelectedColors((cur) => (checked ? [...cur, color] : cur.filter((c) => c !== color)));
  }

  async function handleColorImage(color: string, e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) {
      setColorPreviews((cur) => ({ ...cur, [color]: "" }));
      return;
    }
    setCompressingCount((c) => c + 1);
    try {
      const [compressed] = await compressFiles([file]);
      replaceInputFiles(input, [compressed]);
      setColorPreviews((cur) => ({ ...cur, [color]: URL.createObjectURL(compressed) }));
    } finally {
      setCompressingCount((c) => c - 1);
    }
  }

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!fieldErrors.name}
        />
        {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={!!fieldErrors.description}
        />
        {fieldErrors.description && (
          <p className="text-sm text-destructive">{fieldErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (NGN)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-invalid={!!fieldErrors.price}
          />
          {fieldErrors.price && <p className="text-sm text-destructive">{fieldErrors.price}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="discountPercent">Discount (%)</Label>
          <Input
            id="discountPercent"
            name="discountPercent"
            type="number"
            min="0"
            max="100"
            step="1"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            aria-invalid={!!fieldErrors.discountPercent}
          />
          {fieldErrors.discountPercent && (
            <p className="text-sm text-destructive">{fieldErrors.discountPercent}</p>
          )}
          <p className="text-xs text-muted-foreground">0 means no discount.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Quantity available per size</Label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {PRODUCT_SIZES.map((size) => (
            <div key={size} className="space-y-1">
              <Label htmlFor={`qty_${size}`} className="text-xs text-muted-foreground">
                {size}
              </Label>
              <Input
                id={`qty_${size}`}
                name={`qty_${size}`}
                type="number"
                min="0"
                step="1"
                value={sizeQuantities[size]}
                onChange={(e) =>
                  setSizeQuantities((cur) => ({ ...cur, [size]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Set a size to 0 to hide it from customers. If every size is 0, the whole product is
          treated as out of stock.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Colors (optional)</Label>
        <div className="flex flex-wrap gap-3">
          {PRODUCT_COLORS.map((color) => {
            const isSelected = selectedColors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color, !isSelected)}
                aria-pressed={isSelected}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition",
                  isSelected
                    ? "border-(--brand-gold) bg-(--brand-gold)/10"
                    : "border-border hover:border-(--brand-gold)/50"
                )}
              >
                {isSelected && <input type="hidden" name="colors" value={color} />}
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/20"
                  style={{ backgroundColor: PRODUCT_COLOR_SWATCHES[color] }}
                />
                {color}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Leave all unchecked if this product doesn&apos;t come in different colors. Each color you
          check needs its own photo below.
        </p>

        {selectedColors.length > 0 && (
          <div className="space-y-3 border-l-2 border-black/10 pl-4">
            {selectedColors.map((color) => {
              const existing = initialValues?.colorImages[color];
              const preview = colorPreviews[color];
              return (
                <div key={color} className="space-y-1">
                  <Label htmlFor={`colorImage_${color}`} className="text-xs">
                    {color} photo
                  </Label>
                  <div className="flex items-center gap-3">
                    {(preview || existing) && (
                      <img
                        src={preview || existing}
                        alt=""
                        className="h-16 w-14 object-cover"
                      />
                    )}
                    {existing && !preview && (
                      <input type="hidden" name={`existingColorImage_${color}`} value={existing} />
                    )}
                    <input
                      id={`colorImage_${color}`}
                      name={`colorImage_${color}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleColorImage(color, e)}
                      className="block text-sm file:mr-3 file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {fieldErrors.colors && <p className="text-sm text-destructive">{fieldErrors.colors}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Product photos{selectedColors.length > 0 ? " (optional)" : ""}</Label>
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {existingImages.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="h-28 w-24 object-cover" />
                <input type="hidden" name="existingImages" value={url} />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setExistingImages((imgs) => imgs.filter((u) => u !== url))}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {newImagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {newImagePreviews.map((url) => (
              <img key={url} src={url} alt="" className="h-28 w-24 object-cover opacity-80" />
            ))}
          </div>
        )}
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleNewImages}
          className="block w-full text-sm file:mr-3 file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        <p className="text-xs text-muted-foreground">
          The first photo is the cover image shown in the shop. Customers can swipe through all of
          them on the product page.
          {selectedColors.length > 0
            ? " If you skip these, the first color's photo below becomes the cover instead."
            : ""}
        </p>
        {fieldErrors.images && <p className="text-sm text-destructive">{fieldErrors.images}</p>}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button
        type="submit"
        className="h-11 px-6 text-sm"
        disabled={pending || compressingCount > 0}
      >
        {pending ? "Saving..." : compressingCount > 0 ? "Processing photo..." : submitLabel}
      </Button>
    </form>
  );
}
