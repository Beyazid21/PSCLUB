'use client';

import { CheckCircle2, Clock, ChefHat, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { use } from 'react';

const steps = [
  { id: 'PENDING', label: 'Sifariş Qəbul Edildi', icon: Clock, description: 'Sifarişiniz qeydə alındı.' },
  { id: 'PREPARING', label: 'Hazırlanır', icon: ChefHat, description: 'Komandamız sifarişinizi hazırlayır.' },
  { id: 'READY', label: 'Hazırdır', icon: CheckCircle2, description: 'Sifarişiniz hazırdır.' },
  { id: 'DELIVERED', label: 'Çatdırıldı', icon: Bell, description: 'Nuş olsun!' },
];

export default function OrderStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  
  // Mock status
  const currentStatus = 'PREPARING';
  const currentStepIndex = steps.findIndex(s => s.id === currentStatus);

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col">
       <div className="flex-1 max-w-md mx-auto w-full pt-8 space-y-8">
          <div className="text-center">
             <h1 className="text-2xl font-bold mb-2">Sifariş #{orderId.slice(-4)}</h1>
             <p className="text-gray-500">Təxmini vaxt: 10 dəq</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-8 relative overflow-hidden">
             
             {/* Progress Bar Line */}
             <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-gray-100" />

             {steps.map((step, index) => {
               const isActive = index <= currentStepIndex;
               const isCurrent = index === currentStepIndex;
               
               return (
                 <div key={step.id} className="relative flex gap-4">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                       <step.icon className="w-4 h-4" />
                    </div>
                    <div className={`pt-1 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                       <h3 className={`font-semibold ${isCurrent ? 'text-green-600' : 'text-gray-900'}`}>{step.label}</h3>
                       <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                 </div>
               );
             })}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <h3 className="font-semibold text-blue-900 mb-1">Kömək lazımdır?</h3>
             <p className="text-sm text-blue-700">Aşağıdakı düymə ilə ofisiantı çağırın.</p>
          </div>
       </div>

       <div className="pt-8 pb-4">
          <Button variant="secondary" className="w-full h-12 rounded-xl" asChild>
             <Link href="/">Ana Səhifəyə Qayıt</Link>
          </Button>
       </div>
    </div>
  );
}
