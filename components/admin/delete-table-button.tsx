// components/admin/delete-table-button.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTable } from "@/app/actions";
import { toast } from "sonner";
import { useState } from "react";

export function DeleteTableButton({ tableId }: { tableId: string }) {
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (!confirm("Bu masanı silmək istədiyinizə əminsiniz?")) return;

    setLoading(true);
    const success = await deleteTable(tableId);
    
    if (success) {
      toast.success("Masa uğurla silindi");
    } else {
      toast.error("Masa silinə bilmədi (Aktiv sifarişləri ola bilər)");
    }
    setLoading(false);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onDelete} 
      disabled={loading}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}