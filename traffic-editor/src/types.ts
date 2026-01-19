export type AssetType = 'road' | 'vehicle' | 'sign' | 'custom' | 'annotation' | 'text';

export interface Asset {
  id: string;
  type: AssetType;
  name: string; // Unique system name (e.g. 'red_car')
  src: string; // URL or Data URI
  label: string; // Display label
  // Default dimensions if needed
  width?: number;
  height?: number;
  // For text presets
  textContent?: string;
}

export interface SceneItem {
  id: string;
  assetId: string; // Ref back to original asset type if needed, or just keep src
  name: string; // Copied from asset.name for easier JSON readability
  label: string; // Copied from asset.label for human-readable description
  type: AssetType;
  src: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  width?: number;
  height?: number;
  zIndex: number;
  // Text specific
  textContent?: string;
  fontSize?: number;
  color?: string;
}

export interface DragItem {
  type: 'ASSET';
  asset: Asset;
}
