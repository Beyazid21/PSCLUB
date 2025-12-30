'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCategory } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditCategoryFormProps {
  categoryId: string;
  initialName: string;
}

export function EditCategoryForm({ categoryId, initialName }: EditCategoryFormProps) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await updateCategory(categoryId, formData);
    if (result && !result.success) {
      toast.error(result.error);
    } else {
      toast.success('Kateqoriya yeniləndi');
      router.push('/admin/categories');
    }
  };

  return (
    <form action={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Kateqoriya Adı</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={initialName}
          placeholder="Məs: İçkilər" 
          required 
        />
      </div>
      
      <div className="flex gap-4">
        <Button type="submit">Yadda Saxla</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İmtina
        </Button>
      </div>
    </form>
  );
}
