'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/store';
import Link from 'next/link';

interface MenuClientProps {
  tableId: string;
  initialProducts: any[];
  tableName: string;
  categories: any[];
}

export default function MenuClient({ tableId,tableName, initialProducts, categories }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const cart = useCart();

  useEffect(() => {
    cart.setTableId(tableId);
  }, [tableId]);

  const filteredProducts = activeCategory === 'all' 
    ? initialProducts 
    : initialProducts.filter(p => p.categoryId === activeCategory);

  const handleAddToCart = (product: any) => {
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
           <h1 className="text-xl font-bold">Masa #{tableName}</h1>
           <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">Aktiv</span>
        </div>
        
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              activeCategory === 'all' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Hamsı
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeCategory === category.id 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-row h-32">
            <div className="w-32 h-32 bg-gray-200 shrink-0">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">{product.price.toFixed(2)} AZN</span>
                <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => handleAddToCart(product)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
             Bu kateqoriyada məhsul tapılmadı.
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50">
          <Link href="/cart">
            <Button className="w-full h-14 rounded-full shadow-lg bg-black text-white flex justify-between px-6 text-lg hover:bg-gray-900">
               <div className="flex items-center gap-2">
                 <div className="bg-white/20 px-2 py-0.5 rounded text-sm font-semibold">
                    {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                 </div>
                 <span>Səbətə bax</span>
               </div>
               <span className="font-bold">{cart.total().toFixed(2)} AZN</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
