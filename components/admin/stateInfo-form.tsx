'use client';

import { useState, useEffect } from 'react';
import { saveStateInfo } from "@/app/actions";
import { toast } from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react'; // Navigation ikonunu əlavə etdik

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [coords, setCoords] = useState({
    lat: initialData?.latitude || 40.4093,
    lng: initialData?.longitude || 49.8671
  });

  // Mənim konumuma get funksiyası
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Brauzeriniz yerləşməni dəstəkləmir.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        toast.success("Konumunuz təyin edildi");
      },
      () => {
        toast.error("Konumunuza giriş icazəsi verilmədi.");
      }
    );
  };

  function MapEvents() {
    useMapEvents({
      click(e) {
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, 16); // Fokuslananda daha yaxın zoom (16) edirik
    }, [center, map]);
    return null;
  }

  async function handleSubmit(formData: FormData) {
    const result = await saveStateInfo(formData);
    if (result.success) {
      toast.success("Məlumatlar yeniləndi");
    } else {
      toast.error(result?.error || "Bir xəta baş verdi");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Sol tərəf: Form */}
      <form action={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow h-fit">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Restoran Ayarları
          </h2>
          {/* KONUM DÜYMƏSİ */}
          <button
            type="button"
            onClick={handleLocateMe}
            className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-100 transition shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" /> Mənim Konumum
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 uppercase tracking-tighter text-[10px]">Restoran Adı</label>
          <input name="restaurantName" defaultValue={initialData?.restaurantName} className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-tighter text-[10px]">En dairəsi (Lat)</label>
            <input 
              name="latitude" 
              type="number" 
              step="any" 
              value={coords.lat} 
              onChange={(e) => setCoords({...coords, lat: parseFloat(e.target.value)})}
              className="border w-full p-2 rounded bg-gray-50 font-mono text-sm" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-tighter text-[10px]">Uzunluq dairəsi (Lng)</label>
            <input 
              name="longitude" 
              type="number" 
              step="any" 
              value={coords.lng} 
              onChange={(e) => setCoords({...coords, lng: parseFloat(e.target.value)})}
              className="border w-full p-2 rounded bg-gray-50 font-mono text-sm" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 uppercase tracking-tighter text-[10px]">İcazə verilən radius (metr)</label>
          <input name="allowedRadius" type="number" defaultValue={initialData?.allowedRadius || 100} className="border w-full p-2 rounded" required />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full font-bold transition">
          Yadda Saxla
        </button>
      </form>

      {/* Sağ tərəf: Xəritə */}
      <div className="relative group h-[450px] rounded-lg overflow-hidden shadow-inner border border-gray-200 z-0">
        <MapContainer center={[coords.lat, coords.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapEvents />
          <ChangeView center={[coords.lat, coords.lng]} />
          <Marker position={[coords.lat, coords.lng]} icon={customIcon} />
        </MapContainer>
        
        {/* Xəritə üzərində köməkçi yazı */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <span className="bg-black/60 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
                Xəritədə dəqiq yeri seçin
            </span>
        </div>
      </div>
    </div>
  );
}