'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function OrderNotification() {
  // Səsi öncədən yükləyirik
  const playSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log("Səs çalınmadı (İstifadəçi aktivliyi lazımdır):", e));
  };

  // Bu funksiyanı yeni sifariş gələndə çağıracaqsan
  // Nümunə: Əgər useEffect daxilində API-ni yoxlayırsansa
  useEffect(() => {
    // Sifariş gəldiyini təmsil edən bir yoxlama:
    // playSound(); 
    // toast.success("Yeni sifariş gəldi!");
  }, []);

  return null;
}