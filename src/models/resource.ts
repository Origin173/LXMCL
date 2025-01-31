export interface GameResourceInfo {
  id: string;
  type: string;
  releaseTime: string;
  url: string;
}

export interface OtherResourceInfo {
  type: "mods" | "worlds" | "resourcepacks" | "shaderpacks";
  name: string;
  translatedName?: string;
  description: string;
  iconSrc: string;
  tags: string[];
  lastUpdated: string;
  downloads: number;
  source?: string; // CurseForge, Modrinth, etc.
}
export type ModLoaderType = "none" | "Fabric" | "Forge" | "NeoForge";

export interface ModLoaderResourceInfo {
  type: ModLoaderType;
  version: string;
  description?: string;
  stable: boolean;
}

export const defaultModLoaderResourceInfo: ModLoaderResourceInfo = {
  type: "none",
  version: "",
  stable: true,
};
