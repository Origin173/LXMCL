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
  version: string;
  lastUpdated: string;
  downloads: number;
  source?: string; // CurseForge, Modrinth, etc.
}
