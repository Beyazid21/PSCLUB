import React, { useState, useEffect } from 'react';
import { useScene } from '../hooks/useScene';
import { useCustomAssets } from '../hooks/useCustomAssets';
import { DEFAULT_ASSETS } from '../assets/defaultAssets';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LiveJsonPanel: React.FC = () => {
  const { items, setItems } = useScene();
  const { customAssets } = useCustomAssets();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Combine assets for lookup
  const allAssets = [...DEFAULT_ASSETS, ...customAssets];

  // Live Export: Update text when items change
  useEffect(() => {
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

    const exportData = {
      scene_id: "dataset_yhq_001",
      metadata: {
        description: "Traffic scenario description here",
        background: "grid_canvas"
      },
      objects
    };
    setJsonText(JSON.stringify(exportData, null, 2));
  }, [items]);

  // Live Import: Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setJsonText(newValue);

    try {
      const parsed = JSON.parse(newValue);
      const objects = parsed.objects || (Array.isArray(parsed) ? parsed : []);
      
      const newItems = objects.map((o: any) => {
        // Find asset by name
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
             // Scale handles size
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

      setItems(newItems as any);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className={`border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col z-20 shadow-[-5px_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 ${isCollapsed ? 'h-10' : 'h-64'}`}>
        <div 
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
            <div className="flex items-center gap-2">
                {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>Live Scenario JSON</span>
            </div>
            {error && <span className="text-red-500 normal-case">{error}</span>}
        </div>
        {!isCollapsed && (
            <textarea 
                className="flex-1 w-full p-4 font-mono text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none resize-none text-slate-700 dark:text-slate-300"
                value={jsonText}
                onChange={handleTextChange}
                spellCheck={false}
            />
        )}
    </div>
  );
};

export default LiveJsonPanel;
