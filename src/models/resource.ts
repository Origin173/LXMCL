import { ModLoaderType } from "@/enums/instance";

export interface GameResourceInfo {
  id: string;
  gameType: string;
  releaseTime: string;
  url: string;
}

export interface OtherResourceInfo {
  type: "mod" | "world" | "resourcepack" | "shader" | "modpack" | "datapack";
  name: string;
  translatedName?: string;
  description: string;
  iconSrc: string;
  tags: string[];
  lastUpdated: string;
  downloads: number;
  source?: string; // CurseForge, Modrinth, etc.
}

export interface OtherResourceSearchRes {
  list: OtherResourceInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ModLoaderResourceInfo {
  loaderType: ModLoaderType;
  version: string;
  description?: string;
  stable: boolean;
}

export interface ResourceVersionPack {
  name: string;
  items: OtherResourceInfo[];
  versionLabel: string;
  modLoader?: ModLoaderType;
}

export const defaultModLoaderResourceInfo: ModLoaderResourceInfo = {
  loaderType: "Unknown",
  version: "",
  stable: true,
};
