'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Link as LinkIcon, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { createProduct, updateProduct } from '@/app/actions';
import { toast } from 'sonner';

// Sxemada z.coerce.number() istifadə edirik ki, input-dan gələn string-i rəqəmə çevirsin
const formSchema = z.object({
  name: z.string().min(1, 'Ad mütləqdir'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Qiymət müsbət olmalıdır'),
  categoryId: z.string().min(1, 'Kateqoriya mütləqdir'),
  purchasePrice: z.coerce.number().min(0, 'Alış qiyməti müsbət olmalıdır'),
  image: z.string().optional(),
});

// Tip təhlükəsizliyi üçün z.infer istifadə edirik
type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: any; 
  productId?: string;
  categories: { id: string; name: string }[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  productId,
  categories,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');

  // useForm daxilində tipləri və defaultValues-u dəqiqləşdiririk
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as any, // Bura 'as any' əlavə etdik
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price ? Number(initialData.price) : 0,
      categoryId: initialData?.categoryId || '',
      purchasePrice: initialData?.purchasePrice ? Number(initialData.purchasePrice) : 0,
      image: initialData?.image || '',
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Yükləmə uğursuz oldu');
        return;
      }

      form.setValue('image', data.url);
      setImagePreview(data.url);
      toast.success('Şəkil yükləndi');
    } catch (error) {
      toast.error('Yükləmə zamanı xəta baş verdi');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Sahələri tək-tək əlavə etmək TypeScript üçün ən təhlükəsiz yoldur
      formData.append('name', values.name);
      formData.append('price', values.price.toString());
      formData.append('purchasePrice', values.purchasePrice.toString());
      formData.append('categoryId', values.categoryId);
      
      if (values.description) formData.append('description', values.description);
      if (values.image) formData.append('image', values.image);

      if (productId) {
        await updateProduct(productId, formData);
        toast.success('Məhsul yeniləndi');
      } else {
        await createProduct(formData);
        toast.success('Məhsul yaradıldı');
      }
      
      router.refresh();
      router.push('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error('Gözlənilməz xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-lg">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Məhsulun Adı</FormLabel>
              <FormControl>
                <Input placeholder="Məs: PlayStation 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Təsvir</FormLabel>
              <FormControl>
                <Textarea placeholder="Məhsul haqqında qısa məlumat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Satış Qiyməti (AZN)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Alış Qiyməti (AZN)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kateqoriya</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kateqoriya seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Məhsul Şəkli</FormLabel>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant={imageMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setImageMode('url')}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              URL
            </Button>
            <Button
              type="button"
              variant={imageMode === 'upload' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setImageMode('upload')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Yüklə
            </Button>
          </div>

          {imageMode === 'url' ? (
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="https://..." 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setImagePreview(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yüklənir...
                </p>
              )}
            </div>
          )}

          {imagePreview && (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-contain"
                onError={() => setImagePreview('')}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagePreview('');
                  form.setValue('image', '');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <Button disabled={loading || uploading} type="submit" className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {productId ? 'Yadda saxla' : 'Məhsulu Yarat'}
        </Button>
      </form>
    </Form>
  );
};