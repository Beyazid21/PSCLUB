import { useState, useEffect, useCallback } from 'react';
import type { Asset } from '../types';
import { getFromDB, saveToDB, STORES } from '../utils/db';

const DB_KEY = 'custom_assets_list';

export const useCustomAssets = () => {
  const [customAssets, setCustomAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const saved = await getFromDB(STORES.CUSTOM_ASSETS, DB_KEY);
        if (saved) {
          setCustomAssets(saved);
        }
      } catch (e) {
        console.error("Failed to load custom assets from DB", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAssets();
  }, []);

  // Save to IndexedDB whenever assets change
  useEffect(() => {
    if (!isLoading) {
        saveToDB(STORES.CUSTOM_ASSETS, DB_KEY, customAssets).catch(console.error);
    }
  }, [customAssets, isLoading]);

  const addCustomAsset = useCallback((asset: Asset) => {
    setCustomAssets((prev) => [...prev, asset]);
  }, []);

  const removeCustomAsset = useCallback((id: string) => {
    setCustomAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    customAssets,
    addCustomAsset,
    removeCustomAsset,
    isLoadingAssets: isLoading
  };
};
