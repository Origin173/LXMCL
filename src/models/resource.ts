export interface GameResourceInfo {
  id: string;
  type: string;
  releaseTime: string;
  url: string;
}

export const gameTypesToIcon: Record<string, string> = {
  release: "GrassBlock.png",
  snapshot: "CommandBlock.png",
  old_beta: "StoneOldBeta.png",
};

export type ModLoaderType = "none" | "Fabric" | "Forge" | "NeoForge";

export interface ModLoaderResourceInfo {
  type: ModLoaderType;
  version: string;
  description?: string;
  stable: boolean;
}
