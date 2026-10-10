"use client";

import { GarmentItemsCatalog } from "./garment-items-catalog";
import type { OutfitPatch } from "@/lib/types";

interface AoChamItemsProps {
  onApplyPreset?: () => void;
  onApplyItem?: (patch: OutfitPatch, itemId?: string) => void;
  className?: string;
}

/**
 * AoChamItems now uses the refined web editorial style
 * rather than 2D cartoon game style.
 */
export function AoChamItems({ onApplyPreset, onApplyItem, className }: AoChamItemsProps) {
  return (
    <GarmentItemsCatalog
      currentGarment="ao-cham"
      onApplyPreset={() => {
        if (onApplyPreset) onApplyPreset();
      }}
      onApplyItem={onApplyItem}
      className={className}
    />
  );
}

export default AoChamItems;
