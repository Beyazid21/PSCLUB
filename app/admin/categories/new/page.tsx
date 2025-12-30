'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewCategoryPage() {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await createCategory(formData);
    if (result && !result.success) {
      toast.error(result.error);
    } else {
      toast.success('Kateqoriya yaradıldı');
      router.push('/admin/categories');
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Yeni Kateqoriya</h2>
      </div>
      
      <form action={handleSubmit} className="max-w-lg space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Kateqoriya Adı</Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="Məs: İçkilər" 
            required 
          />
        </div>
        
        <div className="flex gap-4">
          <Button type="submit">Yarat</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İmtina
          </Button>
        </div>
      </form>
    </div>
  );
}
