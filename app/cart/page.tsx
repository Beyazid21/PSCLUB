'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/store';
import { useState } from 'react';

import { createNewOrder } from '@/app/actions';
import { toast } from 'sonner';

export default function CartPage() {
  const cart = useCart();
  const tableId = cart.tableId;
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleCheckout = async () => {
  if (!tableId) {
    toast.error('Masa nömrəsi tapılmadı.');
    return;
  }

  setIsOrdering(true);

  // --- ADDIM 1: Konumu Promise ilə alırıq ---
  const getPosition = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      });
    });
  };

  try {
    // Brauzer dəstəyini yoxla
    if (!navigator.geolocation) {
      throw new Error("GEOLOCATION_NOT_SUPPORTED");
    }

    // Konumun gəlməsini gözləyirik (Burada kod dayanır)
    const position = await getPosition();
    
    const userCoords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    // --- ADDIM 2: Yalnız konum uğurlu olsa bura keçir ---
    const result = await createNewOrder(
      tableId,
      cart.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity
      })),
      userCoords
    );

    if (result.success) {
      cart.clearCart();
      router.push(`/order/${result.order?.id}?tableId=${tableId}`)
      toast.success('Sifarişiniz qəbul olundu!');
    } else {
      toast.error(result.error || 'Xəta baş verdi');
    }

  } catch (error: any) {
    // --- ADDIM 3: Xəta olsa sifariş əsla yaradılmır ---
    console.error("Sifariş xətası:", error);
    
    if (error.code === 1) { // PERMISSION_DENIED
      toast.error("Sifariş üçün konum icazəsi verməlisiniz.");
    } else if (error.code === 2 || error.code === 3) { // POSITION_UNAVAILABLE və ya TIMEOUT
      toast.error("Konum alınarkən xəta baş verdi (GPS/İnternet).");
    } else if (error.message === "GEOLOCATION_NOT_SUPPORTED") {
      toast.error("Brauzeriniz konumu dəstəkləmir.");
    } else {
      toast.error("Gözlənilməz xəta baş verdi.");
    }
  } finally {
    setIsOrdering(false);
  }
};
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
         <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center text-gray-400">
               <ShoppingBag0Icon className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900">Səbətiniz boşdur</h2>
             <p className="text-gray-500">Menyuya qayıdın və ləzzətli yeməklər seçin!</p>
             <Button asChild className="mt-4 rounded-full px-8">
               <Link href={tableId ? `/menu/${tableId}` : '/'}>Menyuya Qayıt</Link>
             </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <Link href=".." onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
           <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Sifarişiniz</h1>
      </div>

      <div className="p-4 space-y-4 pb-32">
        {cart.items.map((item) => (
          <div key={item.productId} className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
             {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="w-20 h-20 bg-gray-100 rounded-lg object-cover" />
             )}
             <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between">
                   <h3 className="font-semibold">{item.name}</h3>
                   <span className="font-bold">{(item.price * item.quantity).toFixed(2)} AZN</span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                   <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                   </Button>
                   <span className="font-medium w-8 text-center">{item.quantity}</span>
                   <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                   </Button>
                </div>
             </div>
          </div>
        ))}

        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 mt-6">
           <div className="flex justify-between text-gray-500">
             <span>Cəmi</span>
             <span>{cart.total().toFixed(2)} AZN</span>
           </div>
           <div className="flex justify-between text-gray-500">
             <span>Servis Haqqı</span>
             <span>0.00 AZN</span>
           </div>
           <div className="border-t pt-4 flex justify-between font-bold text-xl">
             <span>Yekun</span>
             <span>{cart.total().toFixed(2)} AZN</span>
           </div>
        </div>
      </div>
      <div className="p-4 border-t">
         <Link href={`/menu/${tableId}`}>
            <Button variant="outline" className="w-full mb-2">
               Menyuya davam et
            </Button>
         </Link>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
         <Button 
            size="lg" 
            className="w-full h-14 rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
            onClick={handleCheckout}
            disabled={isOrdering}
         >
            {isOrdering ? 'Sifariş verilir...' : 'Sifarişi Təsdiqlə'}
            {!isOrdering && <ChevronRight className="ml-2 w-5 h-5" />}
         </Button>
      </div>
    </div>
  );
}

function ShoppingBag0Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
