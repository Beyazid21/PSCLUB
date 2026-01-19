import React, { useState, useMemo } from 'react';
import type { Asset, AssetType } from '../types';
import { DEFAULT_ASSETS } from '../assets/defaultAssets';
import { EXTERNAL_ASSETS } from '../assets/externalAssets';
import AssetItem from './AssetItem';
import UploadModal from './UploadModal';
import { Upload, Car, Construction, Info, Package } from 'lucide-react';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES: { id: AssetType | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <div className="w-4 h-4 font-bold text-xs" >ALL</div> },
  { id: 'vehicle', label: 'Vehicles', icon: <Car size={16} /> },
  { id: 'road', label: 'Roads', icon: <Construction size={16} /> },
  { id: 'sign', label: 'Signs', icon: <Info size={16} /> },
  { id: 'annotation', label: 'Annotations', icon: <Upload size={16} className="rotate-45" /> },
  { id: 'text', label: 'Text', icon: <div className="text-xs font-bold ring-1 ring-current rounded px-1">T</div> },
  { id: 'custom', label: 'Custom', icon: <Package size={16} /> }
];

interface SidebarProps {
  className?: string;
  onCustomAsset: (asset: Asset) => void;
  onRemoveAsset: (id: string) => void;
  customAssets: Asset[];
}

const Sidebar: React.FC<SidebarProps> = ({ className, onCustomAsset, onRemoveAsset, customAssets }) => {
  const [activeCategory, setActiveCategory] = useState<AssetType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ src: string, width: number, height: number } | null>(null);

  const allAssets = useMemo(() => [...DEFAULT_ASSETS, ...EXTERNAL_ASSETS, ...customAssets], [customAssets]);

  const filteredAssets = useMemo(() => {
    if (activeCategory === 'all') return allAssets;
    return allAssets.filter(a => a.type === activeCategory);
  }, [activeCategory, allAssets]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
               setPendingImage({
                   src: event.target?.result as string,
                   width: img.width,
                   height: img.height
               });
               setIsModalOpen(true);
            }
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleConfirmUpload = (label: string, name: string, category: AssetType) => {
      if (pendingImage) {
          const newAsset: Asset = {
              id: uuidv4(),
              type: category,
              name: name,
              label: label,
              src: pendingImage.src,
              width: pendingImage.width,
              height: pendingImage.height
          };
          onCustomAsset(newAsset);
          setIsModalOpen(false);
          setPendingImage(null);
          
          // Switch to the category of the new asset so the user sees it immediately
          setActiveCategory(category);
      }
  };

  return (
    <div className={clsx("h-full flex flex-col bg-sidebar-light dark:bg-sidebar-dark border-r border-slate-200 dark:border-slate-700", className)}>
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Traffic Editor</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Professional Scene Builder</p>
      </div>

      <div className="flex p-2 gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all whitespace-nowrap",
              activeCategory === cat.id 
                ? "bg-primary text-white shadow-md" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
            {filteredAssets.map(asset => {
                const isCustom = customAssets.some(ca => ca.id === asset.id);
                return (
                    <AssetItem 
                        key={asset.id} 
                        asset={asset} 
                        onDelete={isCustom ? () => onRemoveAsset(asset.id) : undefined}
                    />
                );
            })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary transition-colors text-slate-500 hover:text-primary">
            <Upload size={20} className="mr-2" />
            <span className="text-sm font-medium">Upload Asset</span>
            <input type="file" className="hidden" accept="image/png, image/svg+xml, image/jpeg" onChange={handleFileUpload} />
        </label>
      </div>

      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmUpload}
        previewSrc={pendingImage?.src || null}
      />
    </div>
  );
};

export default Sidebar;
