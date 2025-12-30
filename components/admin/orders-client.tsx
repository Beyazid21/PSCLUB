'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
// updateOrderStatus-un yanına deleteOrder əlavə edildi
import { updateOrderStatus, deleteOrder } from '@/app/actions'; 
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react'; // Silmə ikonu üçün

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isPusherActive, setIsPusherActive] = useState(false);

  useEffect(() => {
    if (!pusherClient) {
      console.log('Pusher not configured');
      return;
    }

    const channel = pusherClient.subscribe('admin-orders');
    setIsPusherActive(true);
    
    channel.bind('new-order', (newOrder: any) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`Yeni sifariş! Masa #${newOrder.table.number}`);
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed'));
      } catch (e) {}
    });

    return () => {
      pusherClient.unsubscribe('admin-orders');
    };
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    const result = await updateOrderStatus(id, status);
    if (result.success) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Status yeniləndi');
    }
  };

  // Sifarişi silmək funksiyası
  const handleDelete = async (id: string) => {
    if (!confirm('Bu sifarişi silmək istədiyinizə əminsiniz?')) return;

    const result = await deleteOrder(id);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Sifariş silindi');
    } else {
      toast.error(result.error || 'Xəta baş verdi');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Gözləyir</Badge>;
      case 'PREPARING': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Hazırlanır</Badge>;
      case 'READY': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Hazırdır</Badge>;
      case 'DELIVERED': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Çatdırılıb</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Canlı Sifarişlər</h2>
        {isPusherActive ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">Canlı Bağlantı Aktiv</Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Canlı yoxdur (Səhifəni yeniləyin)</Badge>
        )}
      </div>

      <div className="grid gap-4">
        {orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
            Hələ sifariş yoxdur.
          </div>
        )}
        {orders.map((order) => (
          <Card key={order.id} className={order.status === 'PENDING' ? 'border-l-4 border-l-yellow-400 shadow-md' : ''}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
  <span className="bg-black text-white px-2 py-1 rounded text-sm">
    Masa {order.table.number}
  </span>
  {/* Əgər masanın xüsusi adı varsa (məsələn: "Böyük Zal") */}
  {order.table.name && (
    <span className="text-sm font-medium text-blue-600">
      ({order.table.name})
    </span>
  )}
  <span className="text-xs font-normal text-gray-400">
    {format(new Date(order.createdAt), 'HH:mm')}
  </span>
</CardTitle>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
                {/* SİLMƏ DÜYMƏSİ BURADADIR */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(order.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="divide-y">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="py-2 flex justify-between items-center text-sm">
                      <span>{item.product.name} x <strong>{item.quantity}</strong></span>
                      <span className="text-gray-500">{(item.product.price * item.quantity).toFixed(2)} AZN</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t flex justify-between font-bold">
                  <span>Cəmi</span>
                  <span>{order.orderItems.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0).toFixed(2)} AZN</span>
                </div>

                <div className="flex gap-2 pt-2">
                   {order.status === 'PENDING' && (
                     <Button size="sm" onClick={() => handleStatusUpdate(order.id, 'PREPARING')}>
                       Hazırla
                     </Button>
                   )}
                   {order.status === 'PREPARING' && (
                     <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(order.id, 'READY')}>
                       Bitir
                     </Button>
                   )}
                   {order.status === 'READY' && (
                     <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}>
                       Təslim Et
                     </Button>
                   )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}