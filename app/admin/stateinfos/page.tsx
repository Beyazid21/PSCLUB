import { getStateInfo } from "@/app/actions";
import SettingsForm from "@/components/admin/stateInfo-form";
import { MapPin, RefreshCw, Info } from "lucide-react";
import Link from "next/link";

export default async function StateInfoPage() {
  // Bazadan məlumatı çəkirik
  const settings = await getStateInfo();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Başlıq Hissəsi */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <MapPin className="text-blue-600 w-6 h-6" /> Obyekt Tənzimləmələri
          </h1>
          <p className="text-sm text-gray-500">Restoranın məkandaxili sifariş üçün konum ayarları</p>
        </div>
        
        {/* Səhifəni yeniləmək üçün düymə */}
        <Link 
          href="/admin/stateinfos" 
          className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg transition text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Yenilə
        </Link>
      </div>

      {!settings ? (
        /* Məlumat hələ heç yoxdursa (İlk Yaratma) */
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-center text-amber-800">
            <Info className="w-5 h-5" />
            <p className="font-medium">Sistemdə obyekt məlumatı tapılmadı. Zəhmət olmasa aşağıdakı formu dolduraraq ilk qeydi yaradın.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SettingsForm initialData={null} />
          </div>
        </div>
      ) : (
        /* Məlumat varsa (Dəyişdirmə/Görüntüləmə) */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Sol tərəf: Mövcud Məlumatların Xülasəsi (1/4 hissə) */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
              <h3 className="font-bold text-gray-700 border-b pb-2">Mövcud Məlumatlar</h3>
              
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Obyekt Adı</label>
                <p className="text-md font-semibold text-gray-800">{settings.restaurantName}</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Koordinatlar</label>
                <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                  <p className="text-xs font-mono text-gray-600">Lat: <span className="text-blue-600">{settings.latitude.toFixed(6)}</span></p>
                  <p className="text-xs font-mono text-gray-600">Lng: <span className="text-blue-600">{settings.longitude.toFixed(6)}</span></p>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Xidmət Radiusu</label>
                <p className="text-xl font-bold text-green-600">{settings.allowedRadius} <span className="text-sm font-normal text-gray-400">metr</span></p>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-[10px] text-gray-400 italic">
                  Son redaktə:<br />
                  {new Date(settings.updatedAt).toLocaleString('az-AZ')}
                </p>
              </div>
            </div>
          </div>

          {/* Sağ tərəf: Redaktə Formu və Xəritə (3/4 hissə) */}
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <SettingsForm initialData={settings} />
          </div>
        </div>
      )}
    </div>
  );
}