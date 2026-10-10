export type GarmentId = "ao-dai" | "ngu-than" | "tu-than" | "nhat-binh" | "ba-ba" | "ao-cham";
export type AvatarId = "female" | "male";
export type AccessorySlot = "head" | "hand" | "shoes";
export interface OutfitConfig {
  version: 1;
  avatar: AvatarId;
  skinTone: "light" | "medium" | "deep";
  garment: GarmentId;
  primaryColor: string;
  accentColor: string;
  bottom: "trousers" | "skirt";
  accessories: Record<AccessorySlot, string>;
  jewelry?: {
    kieng?: boolean;
    xatich?: boolean;
    bangles?: boolean;
  };
  heritageAccessories?: string[];
  event: string;
  weather: string;
  style: string;
}
export type OutfitPatch = Omit<Partial<OutfitConfig>, "accessories"> & {
  accessories?: Partial<Record<AccessorySlot, string>>;
};
export interface SavedLook {
  id: string;
  name: string;
  config: OutfitConfig;
  revision: number;
  createdAt: string;
  updatedAt: string;
  shareToken?: string | null;
}
export interface Lookbook {
  id: string;
  name: string;
  description: string;
  coverLookId: string | null;
  createdAt: string;
  updatedAt: string;
  looks: SavedLook[];
  shareToken?: string | null;
}
export interface PublicShare {
  kind: "look" | "lookbook";
  name: string;
  description: string;
  author: string;
  looks: SavedLook[];
}
