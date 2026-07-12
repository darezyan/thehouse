"use client";

import { useActionState, useState } from "react";
import { PRODUCT_SIZES, PRODUCT_COLORS, PRODUCT_COLOR_SWATCHES, type SizeQuantities } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductFormState } from "./actions";

const initialState: ProductFormState = {};

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

  const [existingImages, setExistingImages] = useState<string[]>(initialValues?.imageUrls ?? []);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialValues?.colors ?? []);
  const [colorPreviews, setColorPreviews] = useState<Record<string, string>>({});

  function handleNewImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function toggleColor(color: string, checked: boolean) {
    setSelectedColors((cur) => (checked ? [...cur, color] : cur.filter((c) => c !== color)));
  }

  function handleColorImage(color: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setColorPreviews((cur) => ({ ...cur, [color]: file ? URL.createObjectURL(file) : "" }));
  }

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initialValues?.name} aria-invalid={!!fieldErrors.name} />
        {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialValues?.description}
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
            defaultValue={initialValues?.price}
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
            defaultValue={initialValues?.discountPercent ?? 0}
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
                defaultValue={initialValues?.sizeQuantities[size] ?? 0}
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
          {PRODUCT_COLORS.map((color) => (
            <label key={color} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="colors"
                value={color}
                checked={selectedColors.includes(color)}
                onChange={(e) => toggleColor(color, e.target.checked)}
                className="h-4 w-4 accent-(--brand-gold)"
              />
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: PRODUCT_COLOR_SWATCHES[color] }}
              />
              {color}
            </label>
          ))}
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
        <Label>Product photos</Label>
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
        </p>
        {fieldErrors.images && <p className="text-sm text-destructive">{fieldErrors.images}</p>}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="h-11 px-6 text-sm" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
