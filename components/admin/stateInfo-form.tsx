'use client';

import { useState, useEffect } from 'react';
import { saveStateInfo } from "@/app/actions";
import { toast } from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Leaflet ikon xətasını düzəltmək üçün (Next.js ilə işləyəndə lazımdır)
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

  // Xəritə üzərinə klikləyəndə koordinatları yeniləyən alt-komponent
  function MapEvents() {
    useMapEvents({
      click(e) {
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  // Koordinatları əllə dəyişəndə xəritəni həmin yerə aparmaq üçün
  function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center);
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
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" /> Restoran Ayarları
        </h2>
        
        <div>
          <label className="block text-sm font-medium">Restoran Adı</label>
          <input name="restaurantName" defaultValue={initialData?.restaurantName} className="border w-full p-2 rounded" required />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">En dairəsi (Lat)</label>
            <input 
              name="latitude" 
              type="number" 
              step="any" 
              value={coords.lat} 
              onChange={(e) => setCoords({...coords, lat: parseFloat(e.target.value)})}
              className="border w-full p-2 rounded" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Uzunluq dairəsi (Lng)</label>
            <input 
              name="longitude" 
              type="number" 
              step="any" 
              value={coords.lng} 
              onChange={(e) => setCoords({...coords, lng: parseFloat(e.target.value)})}
              className="border w-full p-2 rounded" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">İcazə verilən radius (metr)</label>
          <input name="allowedRadius" type="number" defaultValue={initialData?.allowedRadius || 100} className="border w-full p-2 rounded" required />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full transition">
          Yadda Saxla
        </button>
      </form>

      {/* Sağ tərəf: Xəritə */}
      <div className="h-[450px] rounded-lg overflow-hidden shadow border border-gray-200 z-0">
        <MapContainer center={[coords.lat, coords.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapEvents />
          <ChangeView center={[coords.lat, coords.lng]} />
          <Marker position={[coords.lat, coords.lng]} icon={customIcon} />
        </MapContainer>
        <div className="bg-gray-50 p-2 text-xs text-center text-gray-500">
          Xəritə üzərinə klikləyərək restoranın yerini təyin edə bilərsiniz.
        </div>
      </div>
    </div>
  );
}