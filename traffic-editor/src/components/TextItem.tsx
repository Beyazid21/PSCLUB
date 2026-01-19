import React, { useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';
import type { SceneItem } from '../types';
import Konva from 'konva';

interface TextItemProps {
  item: SceneItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<SceneItem>) => void;
}

const TextItem: React.FC<TextItemProps> = ({ item, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDblClick = () => {
    const newText = prompt("Edit text:", item.textContent || "Text");
    if (newText !== null) {
        onChange({ textContent: newText });
    }
  };

  return (
    <>
      <Text
        text={item.textContent || "Text"}
        id={item.id}
        x={item.x}
        y={item.y}
        fontSize={item.fontSize || 20}
        fill={item.color || '#000000'}
        rotation={item.rotation}
        scaleX={item.scaleX}
        scaleY={item.scaleY}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDblClick={handleDblClick}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          onChange({
            x: node.x(),
            y: node.y(),
            scaleX: scaleX,
            scaleY: scaleY,
            rotation: node.rotation(),
          });
        }}
        ref={shapeRef}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default TextItem;
