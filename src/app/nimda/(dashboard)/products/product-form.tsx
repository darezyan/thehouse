"use client";

import { useActionState } from "react";
import { PRODUCT_SIZES, type SizeQuantities } from "@/lib/types";
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
    sizeQuantities: SizeQuantities;
    imageUrl: string;
  };
};

export default function ProductForm({ action, submitLabel, initialValues }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state.fieldErrors ?? {};

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

      <div className="space-y-1.5">
        <Label htmlFor="image">Product photo{initialValues ? " (optional — leave blank to keep current)" : ""}</Label>
        {initialValues?.imageUrl && (
          <img
            src={initialValues.imageUrl}
            alt=""
            className="mb-2 h-32 w-28 object-cover"
          />
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="block w-full text-sm file:mr-3 file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        {fieldErrors.image && <p className="text-sm text-destructive">{fieldErrors.image}</p>}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="h-11 px-6 text-sm" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
