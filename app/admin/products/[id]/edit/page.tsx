import { ProductForm } from "@/components/admin/product-form";
import { getCategories, getProduct } from "@/app/actions";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Məhsulu Redaktə Et</h2>
      </div>
      <ProductForm 
        initialData={{
          name: product.name,
          description: product.description || '',
          price: product.price,
          purchasePrice: product.purchasePrice,
          categoryId: product.categoryId,
          image: product.image || ''
        }}
        productId={id}
        categories={categories} 
      />
    </div>
  );
}
