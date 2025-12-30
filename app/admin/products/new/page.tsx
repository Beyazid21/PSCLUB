import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Yeni Məhsul</h2>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
