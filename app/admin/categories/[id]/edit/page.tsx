
import { getCategory, updateCategory } from "@/app/actions";
import { notFound } from "next/navigation";
import { EditCategoryForm } from "@/components/admin/edit-category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Kateqoriyanı Redaktə Et</h2>
      </div>
      <EditCategoryForm categoryId={id} initialName={category.name} />
    </div>
  );
}
