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

const formSchema = z.object({
  name: z.string().min(1, 'Ad mütləqdir'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Qiymət müsbət olmalıdır'),
  categoryId: z.string().min(1, 'Kateqoriya mütləqdir'),
  purchasePrice: z.coerce.number().min(0, 'Alış qiyməti müsbət olmalıdır'),
  image: z.string().optional(),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      purchasePrice: 0,
      image: '',
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
         if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
         }
      });

      if (productId) {
         await updateProduct(productId, formData);
      } else {
         await createProduct(formData);
      }
      
      // Redirect happens in action
    } catch (error) {
      console.error(error);
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
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Satir Qiymeti (AZN)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="9.99" {...field} />
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
                <Input type="number" step="0.01" placeholder="9.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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

        {/* Image Upload Section */}
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

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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

        <Button disabled={loading || uploading} type="submit">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {productId ? 'Yadda saxla' : 'Yarat'}
        </Button>
      </form>
    </Form>
  );
};
