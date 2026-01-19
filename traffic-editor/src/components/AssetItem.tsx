import React from 'react';
import type { Asset } from '../types';
import { X } from 'lucide-react';

interface AssetItemProps {
  asset: Asset;
  onDelete?: () => void;
}

const AssetItem: React.FC<AssetItemProps> = ({ asset, onDelete }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'ASSET', asset }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group relative p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm cursor-grab hover:shadow-md transition-all border border-slate-200 dark:border-slate-600 flex flex-col items-center gap-2"
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
          title="Delete Asset"
        >
          <X size={12} />
        </button>
      )}
      <div className="w-16 h-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded">
        <img src={asset.src} alt={asset.label} className="max-w-full max-h-full object-contain" />
      </div>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center truncate w-full">
        {asset.label}
      </span>
    </div>
  );
};

export default AssetItem;
