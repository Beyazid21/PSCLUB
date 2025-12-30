import { TableForm } from "@/components/admin/table-form";

export const dynamic = 'force-dynamic';

export default async function NewTablePage() {


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Yeni Masası</h2>
      </div>
      <TableForm />   
    </div>
  );
}
