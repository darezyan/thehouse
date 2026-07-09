"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDeliveryFeesAction, type DeliveryFormState } from "./actions";

const initialState: DeliveryFormState = {};

export default function DeliveryForm({
  lagosFee,
  otherStatesFee,
}: {
  lagosFee: number;
  otherStatesFee: number;
}) {
  const [state, formAction, pending] = useActionState(updateDeliveryFeesAction, initialState);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="max-w-sm space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="lagosFee">Lagos delivery fee (NGN)</Label>
        <Input
          id="lagosFee"
          name="lagosFee"
          type="number"
          min="0"
          step="1"
          defaultValue={lagosFee}
          aria-invalid={!!fieldErrors.lagosFee}
        />
        {fieldErrors.lagosFee && (
          <p className="text-sm text-destructive">{fieldErrors.lagosFee}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="otherStatesFee">Other states delivery fee (NGN)</Label>
        <Input
          id="otherStatesFee"
          name="otherStatesFee"
          type="number"
          min="0"
          step="1"
          defaultValue={otherStatesFee}
          aria-invalid={!!fieldErrors.otherStatesFee}
        />
        {fieldErrors.otherStatesFee && (
          <p className="text-sm text-destructive">{fieldErrors.otherStatesFee}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Saved.</p>}

      <Button type="submit" className="h-11 px-6 text-sm" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
