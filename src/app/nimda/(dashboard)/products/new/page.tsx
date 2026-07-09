import ProductForm from "../product-form";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-wide uppercase">New product</h1>
      <ProductForm action={createProductAction} submitLabel="Create product" />
    </div>
  );
}
