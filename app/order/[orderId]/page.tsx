'use client';

import { CheckCircle2, Clock, ChefHat, Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { use, useEffect, useState } from 'react';
import Pusher from 'pusher-js';

const steps = [
  { id: 'PENDING', label: 'Sifariş Qəbul Edildi', icon: Clock, description: 'Sifarişiniz qeydə alındı.' },
  { id: 'PREPARING', label: 'Hazırlanır', icon: ChefHat, description: 'Komandamız sifarişinizi hazırlayır.' },
  { id: 'READY', label: 'Hazırdır', icon: CheckCircle2, description: 'Sifarişiniz hazırdır.' },
  { id: 'DELIVERED', label: 'Çatdırıldı', icon: Bell, description: 'Nuş olsun!' },
];

export default function OrderStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  // Statusu state-də saxlayırıq ki, Pusher gələndə dəyişsin
  const [currentStatus, setCurrentStatus] = useState('PENDING');

  useEffect(() => {
    // Pusher qoşulması
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
    });

    // Sifarişə özəl kanalı dinləyirik (Məsələn: order-cm5...)
    const channel = pusher.subscribe(`order-status-${orderId}`);

    channel.bind('status-updated', (data: { newStatus: string }) => {
      setCurrentStatus(data.newStatus);
    });

    return () => {
      pusher.unsubscribe(`order-status-${orderId}`);
    };
  }, [orderId]);

  const currentStepIndex = steps.findIndex(s => s.id === currentStatus);

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col">
       <div className="flex-1 max-w-md mx-auto w-full pt-8 space-y-8">
          <div className="text-center">
             <h1 className="text-2xl font-bold mb-2">Sifariş #{orderId.slice(-4)}</h1>
             <p className="text-gray-500">Status: {steps[currentStepIndex]?.label}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-8 relative overflow-hidden">
             <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-gray-100" />

             {steps.map((step, index) => {
               const isActive = index <= currentStepIndex;
               const isCurrent = index === currentStepIndex;
               
               return (
                 <div key={step.id} className="relative flex gap-4">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${isActive ? 'bg-green-600 text-white scale-110' : 'bg-gray-200 text-gray-400'}`}>
                        <step.icon className="w-4 h-4" />
                    </div>
                    <div className={`pt-1 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                        <h3 className={`font-semibold ${isCurrent ? 'text-green-600 font-bold' : 'text-gray-900'}`}>{step.label}</h3>
                        <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                 </div>
               );
             })}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <h3 className="font-semibold text-blue-900 mb-1">Kömək lazımdır?</h3>
             <p className="text-sm text-blue-700">Ofisiantı çağırmaq üçün masadakı düymədən istifadə edin.</p>
          </div>
       </div>

       <div className="pt-8 pb-4">
          <Button variant="secondary" className="w-full h-12 rounded-xl border-2 border-gray-200" asChild>
             {/* Sizin istədiyiniz Ana Səhifə (Menyu) keçidi */}
             <Link href="/">
               <ArrowLeft className="w-4 h-4 mr-2" />
               Menyuya Qayıt
             </Link>
          </Button>
       </div>
    </div>
  );
}