import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";
import MarkDeliveredButton from "./mark-delivered-button";

export const revalidate = 0;

type OrderWithItems = Order & { order_items: OrderItem[] };

function OrderCard({ order }: { order: OrderWithItems }) {
  return (
    <div className="border border-black/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-sm text-muted-foreground">{order.email}</p>
          <p className="text-sm text-muted-foreground">{order.phone}</p>
          <p className="text-sm text-muted-foreground">
            {order.address}, {order.city}, {order.state}
          </p>
          {order.notes && (
            <p className="mt-1 text-sm text-muted-foreground italic">Note: {order.notes}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleString("en-NG")} ·{" "}
            <span className="font-mono">{order.id.slice(0, 8)}</span>
          </p>
        </div>
        <div className="text-right">
          {order.status === "delivered" ? (
            <span className="text-xs font-medium tracking-wide text-green-700 uppercase">
              Delivered
            </span>
          ) : (
            <MarkDeliveredButton orderId={order.id} />
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1.5 border-t border-black/5 pt-4 text-sm">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span>
              {item.product_name}{" "}
              {[item.size, item.color].filter(Boolean).length > 0
                ? `(${[item.size, item.color].filter(Boolean).join(", ")})`
                : ""}{" "}
              × {item.quantity}
            </span>
            <span>{formatPrice(item.unit_price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Delivery</span>
          <span>{formatPrice(order.delivery_fee)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-1.5 font-medium">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

export default async function AdminOrdersPage() {
  // Checkout creates the order row before the customer pays (so the
  // payment_ref exists for Flutterwave's callback/webhook to find), which
  // means most rows are abandoned/failed checkouts, not real orders — only
  // ones that actually got paid should ever show up here.
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .returns<OrderWithItems[]>();

  const pendingOrders = (orders ?? []).filter((o) => o.status !== "delivered");
  const deliveredOrders = (orders ?? []).filter((o) => o.status === "delivered");

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-wide uppercase">Orders</h1>

      <section>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase">
          Awaiting delivery ({pendingOrders.length})
        </h2>
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {pendingOrders.length === 0 && (
            <p className="py-6 text-center text-muted-foreground">No orders awaiting delivery.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase">
          Delivered ({deliveredOrders.length})
        </h2>
        <div className="space-y-4">
          {deliveredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {deliveredOrders.length === 0 && (
            <p className="py-6 text-center text-muted-foreground">No delivered orders yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
