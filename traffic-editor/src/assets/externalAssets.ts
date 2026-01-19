import type { Asset } from '../types';

/**
 * Automatically loads any images placed in src/assets/custom folder.
 * This makes them permanent and available across refreshes.
 */

const assetModules = import.meta.glob('../assets/custom/*.{png,svg,jpg,jpeg,webp}', { eager: true });

export const EXTERNAL_ASSETS: Asset[] = Object.entries(assetModules).map(([path, module]) => {
  const fileName = path.split('/').pop() || '';
  const name = fileName.split('.')[0];
  const src = (module as any).default;
  
  return {
    id: `custom-${name}`,
    name: name,
    type: 'custom',
    label: name.replace(/_/g, ' ').replace(/-/g, ' '),
    src: src,
    width: 100, // Default width, will be updated when placed
    height: 100
  };
});
