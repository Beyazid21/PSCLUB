'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import Pusher from 'pusher-js';

export function OrderNotification() {
  useEffect(() => {
    // 1. Pusher-i işə salırıq
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: 'eu', // Sənin cluster-in nədirsə onu yaz (adətən eu olur)
    });

    // 2. Kanalı dinləyirik (Server action-da trigger etdiyin kanal adı)
    const channel = pusher.subscribe('admin-orders');

    // 3. Hadisə baş verəndə (new-order)
    channel.bind('new-order', (data: any) => {
      // Səs funksiyası
      const playSound = () => {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log("Brauzer səsə icazə vermədi:", e));
      };

      playSound();
      toast.success(`Yeni sifariş! Masa: ${data.table?.name || data.table?.number}`, {
        duration: 5000,
        position: 'top-right',
      });
    });

    return () => {
      pusher.unsubscribe('admin-orders');
    };
  }, []);

  return null;
}