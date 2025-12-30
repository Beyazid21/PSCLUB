import { getProducts, getCategories, getTables } from "@/app/actions";
import MenuClient from "@/components/menu/menu-client";
import { notFound } from "next/navigation"; // 404 üçün

export const dynamic = 'force-dynamic';

export default async function MenuPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params;
  
  const tables = await getTables();
  
  const tableExists = tables.find(t => t.id === tableId);

  if (!tableExists) {
    notFound(); 
  }

  const products = await getProducts();
  const categories = await getCategories();
  const availableProducts = products.filter(p => p.inStock);

  return (
   <MenuClient 
      tableId={tableExists.id} // Bazaya bu gedəcək
      tableName={tableExists.name || tableExists.number.toString()} // Ekranda bu görünəcək
      initialProducts={availableProducts} 
      categories={categories} 
    />
  );
}