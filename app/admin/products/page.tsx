import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { StockToggleButton } from "@/components/admin/stock-toggle-button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProducts } from "@/app/actions";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Məhsullar</h2>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Yeni Məhsul
          </Button>
        </Link>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Kateqoriya</TableHead>
              <TableHead>Qiymət</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                 <TableCell colSpan={5} className="text-center h-24">Məhsul tapılmadı.</TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category?.name || '-'}</TableCell>
                <TableCell>{product.price.toFixed(2)} AZN</TableCell>
                <TableCell>
                  {product.inStock ? (
                    <span className="text-green-600">Var</span>
                  ) : (
                    <span className="text-red-600">Yoxdur</span>
                  )}
                </TableCell>
             <TableCell className="text-right space-x-2">
  {/* Yeni əlavə edilən Stok Düyməsi */}
  <StockToggleButton productId={product.id} inStock={product.inStock} />
  
  <Button variant="ghost" size="sm" asChild>
    <Link href={`/admin/products/${product.id}/edit`}>
      <Pencil className="h-4 w-4 mr-1" />
      Redaktə
    </Link>
  </Button>
  <DeleteProductButton productId={product.id} />
</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
