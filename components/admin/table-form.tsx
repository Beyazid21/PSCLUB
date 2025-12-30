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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch'; // Aktiv/Deaktiv üçün
import { Loader2 } from 'lucide-react';
import { createTable, updateTable } from '@/app/actions';
import { toast } from 'sonner';

const formSchema = z.object({
  number: z.coerce.number().min(1, 'Masa nömrəsi müsbət olmalıdır'),
  name: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface TableFormProps {
  initialData?: any; 
  tableId?: string;
}

export const TableForm: React.FC<TableFormProps> = ({
  initialData,
  tableId,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      number: 1,
      name: '',
      isActive: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      let result;
      if (tableId) {
        result = await updateTable(tableId, values);
      } else {
        result = await createTable(values);
      }

      if (result?.success) {
        toast.success(tableId ? 'Masa yeniləndi' : 'Masa yaradıldı');
        router.push('/admin/tables');
        router.refresh();
      } else {
        toast.error(result?.error || 'Xəta baş verdi');
      }
    } catch (error) {
      toast.error('Gözlənilməz xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-lg bg-white p-6 rounded-lg border shadow-sm">
        <div className="space-y-4">
          {/* Masa Nömrəsi */}
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Masa Nömrəsi</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Məs: 5" 
                    {...field} 
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  Müştərilərin görəcəyi unikal masa nömrəsi.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
     <FormField
            control={form.control}
            name="name" 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Masa adı</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="Məs: VIP künc və ya Balkon 1" 
                    {...field} 
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>Sizin görəcəyiniz masa adı (istəyə bağlı).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Aktiv/Deaktiv Switch */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Masa Aktivdir?</FormLabel>
                  <FormDescription>
                    Deaktiv masalarda menyuya giriş və sifariş mümkün olmayacaq.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button 
            disabled={loading} 
            type="submit" 
            className="w-full md:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tableId ? 'Dəyişiklikləri yadda saxla' : 'Masanı Yarat'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/admin/tables')}
            disabled={loading}
          >
            Ləğv et
          </Button>
        </div>
      </form>
    </Form>
  );
};