import React, { useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import CanvasArea from './components/CanvasArea';
import type { CanvasHandle } from './components/CanvasArea';
import { useScene } from './hooks/useScene';
import { useCustomAssets } from './hooks/useCustomAssets';
import JsonModal from './components/JsonModal';
import LiveJsonPanel from './components/LiveJsonPanel';
import { Download, Trash2, Copy, Layers, Sun, Moon, FileJson, Upload as UploadIcon, Code } from 'lucide-react';
import { DEFAULT_ASSETS } from './assets/defaultAssets';
import { EXTERNAL_ASSETS } from './assets/externalAssets';
import type { Asset, DragItem } from './types';

function App() {
  const { 
    items, 
    setItems,
    selectedId, 
    setSelectedId, 
    addItem, 
    updateItem, 
    deleteItem, 
    bringToFront, 
    sendToBack, 
    duplicateItem,
    undo,
    redo
  } = useScene();
  
  const { customAssets, addCustomAsset, removeCustomAsset, isLoadingAssets } = useCustomAssets();
  const { isLoading: isLoadingScene } = useScene();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [isExporting, setIsExporting] = React.useState(false);
  const [showLiveJson, setShowLiveJson] = React.useState(true);
  const [jsonModal, setJsonModal] = React.useState<{ isOpen: boolean; type: 'import' | 'export' }>({ isOpen: false, type: 'export' });
  const canvasRef = useRef<CanvasHandle>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleCustomAsset = (asset: Asset) => {
    addCustomAsset(asset);
  };

  const handleImportJson = (jsonString: string) => {
      try {
          const parsed = JSON.parse(jsonString);
          const objects = parsed.objects || (Array.isArray(parsed) ? parsed : []);
          const allAssets = [...DEFAULT_ASSETS, ...EXTERNAL_ASSETS, ...customAssets];

          const newItems = objects.map((o: any) => {
              const asset = allAssets.find(a => a.name === o.name);
              if (asset) {
                  return {
                      id: crypto.randomUUID(),
                      assetId: asset.id,
                      name: asset.name,
                      label: o.label || asset.label,
                      type: asset.type,
                      src: asset.src,
                      x: o.x || 0,
                      y: o.y || 0,
                      zIndex: o.zIndex || 1,
                      rotation: o.rotation || 0,
                      scaleX: o.width ? o.width / (asset.width || 1) : 1,
                      scaleY: o.height ? o.height / (asset.height || 1) : 1,
                      width: asset.width,
                      height: asset.height,
                      textContent: o.properties?.text || asset.textContent,
                      fontSize: 20,
                      color: '#000000'
                  };
              }
              return null;
          }).filter((i: any) => i !== null);

          if (newItems.length > 0) {
              setItems(newItems as any);
          }
      } catch (e) {
          console.error("Failed to parse imported JSON", e);
      }
  };

  const getExportData = () => {
    const objects = items.map(item => ({
      id: item.id.substring(0, 8),
      name: item.name,
      label: item.label,
      type: item.type,
      x: Math.round(item.x),
      y: Math.round(item.y),
      width: Math.round((item.width || 0) * item.scaleX),
      height: Math.round((item.height || 0) * item.scaleY),
      rotation: Math.round(item.rotation || 0),
      zIndex: item.zIndex || 1,
      properties: item.type === 'text' ? { text: item.textContent } : {}
    }));

    return JSON.stringify({
      scene_id: "dataset_yhq_001",
      metadata: {
        description: "Traffic scenario exported manually",
        background: "grid_canvas"
      },
      objects
    }, null, 2);
  };

  const dlImage = () => {
    setIsExporting(true);
    // Deselect to hide transformers
    const prevSelection = selectedId;
    setSelectedId(null);

    // Wait for render to update (grid removal)
    setTimeout(() => {
        const stage = canvasRef.current?.getStage();
        if (stage) {
            try {
                const dataURL = stage.toDataURL({ 
                    pixelRatio: 2,
                    mimeType: 'image/png'
                });
                downloadURI(dataURL, 'traffic-scene.png');
            } catch (e) {
                console.error("Export failed:", e);
                alert("Export failed. See console for details.");
            }
        }
        // Restore
        setIsExporting(false);
        if (prevSelection) setSelectedId(prevSelection);
    }, 100);
  };

  const downloadURI = (uri: string, name: string) => {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedId) deleteItem(selectedId);
    }
    
    // Copy/Paste (Duplicate)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
       // Ideally we separate copy and paste logic, but for now duplicate on 'v' or 'd'
       // Standard behavior: Ctrl+C copies ID, Ctrl+V duplicates. 
       // Current implementation: duplicateItem checks selectedId directly.
       if (e.key === 'v' && selectedId) {
           duplicateItem(selectedId);
       }
    }

    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
    }
  }, [selectedId, deleteItem, duplicateItem, undo, redo]);

  // Keyboard Shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDropItem = (dragItem: DragItem, x: number, y: number) => {
      if (dragItem.type === 'ASSET') {
          addItem(dragItem.asset, x, y);
      }
  };

  if (isLoadingAssets || isLoadingScene) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Loading project assets...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden font-sans">
      
      <Sidebar 
        className="w-72 flex-shrink-0 z-20 shadow-xl"
        onCustomAsset={handleCustomAsset}
        onRemoveAsset={removeCustomAsset}
        customAssets={customAssets}
      />

      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            {selectedId && (
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1 mr-2 px-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase mr-2">Layer</label>
                <input 
                  type="number" 
                  className="w-12 bg-slate-100 dark:bg-slate-900 border-none rounded p-1 text-xs text-center font-bold focus:ring-1 focus:ring-primary outline-none"
                  value={items.find(i => i.id === selectedId)?.zIndex || 1}
                  onChange={(e) => updateItem(selectedId, { zIndex: parseInt(e.target.value) || 1 })}
                  min="0"
                />
              </div>
            )}

            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1 mr-2">
                 <button
                    onClick={() => setJsonModal({ isOpen: true, type: 'import' })}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                    title="Import JSON"
                  >
                    <UploadIcon size={20} />
                  </button>
                  <button
                    onClick={() => setJsonModal({ isOpen: true, type: 'export' })}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                    title="Export JSON"
                  >
                    <FileJson size={20} />
                  </button>
                  <button
                    onClick={() => setShowLiveJson(!showLiveJson)}
                    className={`p-2 rounded-lg transition-colors ${showLiveJson ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    title="Toggle Live JSON Panel"
                  >
                    <Code size={20} />
                  </button>
            </div>

            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1">
              <button
                onClick={() => selectedId && bringToFront(selectedId)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50"
                disabled={!selectedId}
                title="Bring to Front"
              >
                <Layers size={20} />
              </button>
              <button
                onClick={() => selectedId && sendToBack(selectedId)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50"
                disabled={!selectedId}
                title="Send to Back"
              >
                <Layers size={20} className="rotate-180" />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              <button
                onClick={() => selectedId && duplicateItem(selectedId)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50"
                disabled={!selectedId}
                title="Duplicate (Ctrl+V)"
              >
                <Copy size={20} />
              </button>
              <button
                onClick={() => selectedId && deleteItem(selectedId)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors disabled:opacity-50"
                disabled={!selectedId}
                title="Delete (Del)"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1">
               <button
                onClick={dlImage}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                title="Export as PNG"
              >
                <Download size={20} />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
               <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
        </div>

        <CanvasArea
            ref={canvasRef}
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateItem={updateItem}
            onDropItem={handleDropItem}
            showGrid={!isExporting}
        />
        
        {showLiveJson && <LiveJsonPanel />}
        
        <JsonModal 
            isOpen={jsonModal.isOpen} 
            onClose={() => setJsonModal({ ...jsonModal, isOpen: false })} 
            type={jsonModal.type}
            data={getExportData()}
            onImport={handleImportJson}
        />
      </div>
    </div>
  );
}

export default App;
