import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-black text-white">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="flex justify-center mb-8">
           <div className="p-4 bg-white rounded-2xl">
              <QrCode className="w-24 h-24 text-black" />
           </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight">PlayStation Klubu</h1>
        <p className="text-gray-300">
          Xoş gəlmisiniz! Sifariş vermək üçün zəhmət olmasa masasınızdakı QR kodu skan edin.
        </p>
        
        <div className="pt-8 space-y-4">
          <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 rounded-xl font-semibold shadow-lg shadow-blue-900/50">
            QR Kodu Skan Edin
          </Button>
        </div>
      </div>
    </div>
  );
}

