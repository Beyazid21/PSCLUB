import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { AssetType } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (label: string, name: string, category: AssetType) => void;
  previewSrc: string | null;
}

const CATEGORIES: AssetType[] = ['vehicle', 'road', 'sign', 'annotation', 'text', 'custom'];

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onConfirm, previewSrc }) => {
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetType>('custom');

  const handleConfirm = () => {
    if (label && name) {
        onConfirm(label, name, category);
        setLabel('');
        setName('');
        setCategory('custom');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-96 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">New Asset Details</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {previewSrc && (
            <div className="mb-4 flex justify-center bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
                <img src={previewSrc} alt="Preview" className="max-h-32 object-contain" />
            </div>
        )}

        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Display Label</label>
                <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                    placeholder="e.g. My Red Car"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                />
            </div>
            
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">System Name (ID)</label>
                <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                    placeholder="e.g. my_red_car"
                    value={name}
                    onChange={e => setName(e.target.value)} 
                />
                <p className="text-[10px] text-slate-400 mt-1">Unique identifier for JSON export (snake_case recommended)</p>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AssetType)}
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!label || !name}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
