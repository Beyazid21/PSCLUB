'use client';

import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/app/actions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Bu məhsulu silmək istədiyinizdən əminsiniz?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success('Məhsul silindi');
        router.refresh();
      } else {
        toast.error(result.error || 'Xəta baş verdi');
      }
    } catch (error) {
      toast.error('Xəta baş verdi');
    }
    setIsDeleting(false);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash className="h-4 w-4 mr-1" />
      Sil
    </Button>
  );
}
