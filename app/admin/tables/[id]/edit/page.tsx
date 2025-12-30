import { getTableById } from "@/app/actions";
import { TableForm } from "@/components/admin/table-form";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditTablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const table = await getTableById(id);

  // Əgər belə bir masa yoxdursa 404 göstər
  if (!table) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Masanı Redaktə Et</h2>
      </div>
      
      {/* TableForm üçün yalnız masaya aid olan datanı göndəririk */}
      <TableForm 
        initialData={{
          number: table.number,
          isActive: table.isActive,
        }}
        tableId={id}
      />
    </div>
  );
}