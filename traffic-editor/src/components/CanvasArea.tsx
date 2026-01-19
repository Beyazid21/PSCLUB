import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import type { SceneItem, DragItem } from '../types';
import UrlImage from './UrlImage';
import TextItem from './TextItem';
import Konva from 'konva';

interface CanvasAreaProps {
  items: SceneItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateItem: (id: string, attrs: Partial<SceneItem>) => void;
  onDropItem: (dragItem: DragItem, x: number, y: number) => void;
  gridSize?: number;
  showGrid?: boolean;
}

export interface CanvasHandle {
  getStage: () => Konva.Stage | null;
}

const CanvasArea = forwardRef<CanvasHandle, CanvasAreaProps>(({ 
  items, 
  selectedId, 
  onSelect, 
  onUpdateItem, 
  onDropItem, 
  gridSize = 20, 
  showGrid = true 
}, ref) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current
  }));

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    stage.setPointersPositions(e);
    const pointerPosition = stage.getPointerPosition();
    
    if (pointerPosition) {
        // Transform pointer into local coordinate space (accounting for zoom/pan)
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const localPos = transform.point(pointerPosition);
        
        // Snap to grid
        const snappedX = Math.round(localPos.x / gridSize) * gridSize;
        const snappedY = Math.round(localPos.y / gridSize) * gridSize;

        const data = e.dataTransfer.getData('application/json');
        if (data) {
           const dragItem = JSON.parse(data) as DragItem;
           if (dragItem.type === 'ASSET') {
               onDropItem(dragItem, snappedX, snappedY);
           }
        }
    }
  };

  const renderGrid = () => {
    if (!showGrid) return null;
    
    // Create a large enough grid. Ideally dynamic based on viewport, but fixed large size is easier for MVP.
    // 5000x5000
    const width = 5000;
    const height = 5000;
    const lines = [];

    for (let i = 0; i < width / gridSize; i++) {
        lines.push(
            <Line
                key={`v-${i}`}
                points={[i * gridSize, 0, i * gridSize, height]}
                stroke="#e2e8f0"
                strokeWidth={1}
            />
        );
    }
    for (let j = 0; j < height / gridSize; j++) {
        lines.push(
            <Line
                key={`h-${j}`}
                points={[0, j * gridSize, width, j * gridSize]}
                stroke="#e2e8f0"
                strokeWidth={1}
            />
        );
    }
    return lines;
  };

  /* ... inside the component ... */
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (containerRef.current) {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div 
        className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-hidden relative" 
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        draggable
        ref={stageRef}
        onMouseDown={(e) => {
          // Deselect if clicked on empty stage
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            onSelect(null);
          }
        }}
        onWheel={(e) => {
            e.evt.preventDefault();
            const stage = stageRef.current;
            if (!stage) return;

            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();
            if (!pointer) return;
      
            const mousePointTo = {
              x: (pointer.x - stage.x()) / oldScale,
              y: (pointer.y - stage.y()) / oldScale,
            };
      
            const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
            
            stage.scale({ x: newScale, y: newScale });
      
            const newPos = {
              x: pointer.x - mousePointTo.x * newScale,
              y: pointer.y - mousePointTo.y * newScale,
            };
            stage.position(newPos);
        }}
      >
        <Layer>
            {/* Background for grid */}
             <Rect width={5000} height={5000} fill={showGrid ? "#fff" : "#fff"} /> 
             {renderGrid()}
        </Layer>
        <Layer>
          {items
            .slice()
            .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
            .map((item) => {
            if (item.type === 'text') {
                return (
                    <TextItem
                        key={item.id}
                        item={item}
                        isSelected={item.id === selectedId}
                        onSelect={() => onSelect(item.id)}
                        onChange={(newAttrs) => onUpdateItem(item.id, newAttrs)}
                    />
                );
            }
            return (
            <UrlImage
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              onSelect={() => onSelect(item.id)}
              onChange={(newAttrs) => {
                  // Apply snapping logic here too if needed, but UrlImage transform dragEnd handles some.
                  // We can intercept dragEnd updates here.
                  if (newAttrs.x !== undefined) newAttrs.x = Math.round(newAttrs.x / gridSize) * gridSize;
                  if (newAttrs.y !== undefined) newAttrs.y = Math.round(newAttrs.y / gridSize) * gridSize;
                  onUpdateItem(item.id, newAttrs);
              }}
            />
          );
          })}
        </Layer>
      </Stage>
      
      {/* Zoom Controls Overlay could go here */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 p-2 rounded-lg shadow text-xs">
          Scroll to Zoom, Drag to Pan
      </div>
    </div>
  );
});

export default CanvasArea;
