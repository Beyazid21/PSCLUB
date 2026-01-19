import { useState, useEffect, useCallback } from 'react';
import type { SceneItem, Asset } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getFromDB, saveToDB, STORES } from '../utils/db';

const DB_KEY = 'scene_items_list';

export const useScene = () => {
  const [items, setItems] = useState<SceneItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadScene = async () => {
      try {
        const saved = await getFromDB(STORES.SCENE, DB_KEY);
        if (saved) {
             setItems(saved);
        }
      } catch (e) {
          console.error("Failed to load scene from DB", e);
      } finally {
          setIsLoading(false);
      }
    };
    loadScene();
  }, []);

  // History State
  const [history, setHistory] = useState<SceneItem[][]>([]);
  const [future, setFuture] = useState<SceneItem[][]>([]);

  // Wrap setItems to push to history before updating (unless it's an undo/redo op)
  const setSceneItems = useCallback((newItemsOrUpdater: SceneItem[] | ((prev: SceneItem[]) => SceneItem[])) => {
      setItems(prev => {
          const newItems = typeof newItemsOrUpdater === 'function' ? newItemsOrUpdater(prev) : newItemsOrUpdater;
          
          if (newItems !== prev) {
              setHistory(h => [...h, prev]);
              setFuture([]); // Clear future on new action
          }
          return newItems;
      });
  }, []);

  const undo = useCallback(() => {
      setHistory(prevHistory => {
          if (prevHistory.length === 0) return prevHistory;
          const newHistory = [...prevHistory];
          const previousState = newHistory.pop();
          
          if (previousState) {
              setFuture(f => [items, ...f]);
              setItems(previousState);
          }
          return newHistory;
      });
  }, [items]);

  const redo = useCallback(() => {
      setFuture(prevFuture => {
          if (prevFuture.length === 0) return prevFuture;
          const newFuture = [...prevFuture];
          const nextState = newFuture.shift();
          
          if (nextState) {
              setHistory(h => [...h, items]);
              setItems(nextState);
          }
          return newFuture;
      });
  }, [items]);

  // Save to IndexedDB whenever items change
  useEffect(() => {
     if (!isLoading) {
        saveToDB(STORES.SCENE, DB_KEY, items).catch(console.error);
     }
  }, [items, isLoading]);

  const addItem = useCallback((asset: Asset, x: number, y: number) => {
    const newItem: SceneItem = {
      id: uuidv4(),
      assetId: asset.id,
      name: asset.name,
      label: asset.label,
      type: asset.type,
      src: asset.src,
      x,
      y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      width: asset.width,
      height: asset.height,
      zIndex: 1,
      textContent: asset.textContent,
      fontSize: 20,
      color: '#000000'
    };
    setSceneItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  }, [items.length, setSceneItems]);

  const updateItem = useCallback((id: string, attrs: Partial<SceneItem>) => {
    setSceneItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...attrs } : item))
    );
  }, [setSceneItems]);

  const deleteItem = useCallback((id: string) => {
    setSceneItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedId(null);
  }, [setSceneItems]);

  const clearSelection = useCallback(() => setSelectedId(null), []);

  const bringToFront = useCallback((id: string) => {
    setSceneItems((prev) => {
        const itemIndex = prev.findIndex(item => item.id === id);
        if (itemIndex < 0) return prev;
        const newItems = [...prev];
        const [item] = newItems.splice(itemIndex, 1);
        newItems.push(item);
        return newItems;
    });
  }, [setSceneItems]);

  const sendToBack = useCallback((id: string) => {
      setSceneItems((prev) => {
        const itemIndex = prev.findIndex(item => item.id === id);
        if (itemIndex < 0) return prev;
        const newItems = [...prev];
        const [item] = newItems.splice(itemIndex, 1);
        newItems.unshift(item);
        return newItems;
      });
  }, [setSceneItems]);

    const duplicateItem = useCallback((id: string) => {
        const item = items.find(i => i.id === id);
        if (item) {
             const newItem = {
                 ...item,
                 id: uuidv4(),
                 x: item.x + 20,
                 y: item.y + 20,
                 zIndex: items.length
             };
             setSceneItems(prev => [...prev, newItem]);
             setSelectedId(newItem.id);
        }
    }, [items, setSceneItems]);

  return {
    items,
    setItems: setSceneItems,
    selectedId,
    setSelectedId,
    addItem,
    updateItem,
    deleteItem,
    clearSelection,
    bringToFront,
    sendToBack,
    duplicateItem,
    undo,
    redo,
    isLoading
  };
};
