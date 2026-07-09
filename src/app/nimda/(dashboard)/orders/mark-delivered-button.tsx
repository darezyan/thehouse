"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { markOrderDeliveredAction } from "./actions";

export default function MarkDeliveredButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Mark this order as delivered? This can't be undone.")) return;
    startTransition(() => {
      markOrderDeliveredAction(orderId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 border border-black/10 px-3 py-1.5 text-xs font-medium tracking-wide uppercase hover:border-(--brand-gold) disabled:opacity-50"
    >
      <Check size={14} />
      {isPending ? "Marking..." : "Mark as delivered"}
    </button>
  );
}
