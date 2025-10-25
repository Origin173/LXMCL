import { invoke } from "@tauri-apps/api/core";
import { InvokeResponse } from "@/models/response";
import { responseHandler } from "@/utils/response";

/**
 * OpenList 整合包信息
 */
export interface ModpackInfo {
  modpackId: string;
  name: string;
  version: string;
  description?: string;
  files: ModpackFile[];
  minecraftVersion?: string;
  modLoader?: string;
  modLoaderVersion?: string;
  jvmArgs?: string[];
}

/**
 * 整合包文件信息
 */
export interface ModpackFile {
  url: string;
  targetPath: string;
  hash: string;
  hashType: string;
  size?: number;
}

/**
 * OpenList 配置
 */
export interface OpenListConfig {
  url: string;
  enabled: boolean;
}

/**
 * Service class for OpenList integration.
 */
export class OpenListService {
  /**
   * 开始下载并安装整合包
   * @param {ModpackInfo} data - 整合包信息
   * @returns {Promise<InvokeResponse<void>>}
   */
  @responseHandler("openlist")
  static async startDownloadAndInstall(
    data: ModpackInfo
  ): Promise<InvokeResponse<void>> {
    return await invoke("openlist_start_download_and_install", { data });
  }

  /**
   * 获取 OpenList 配置
   * @returns {Promise<InvokeResponse<OpenListConfig>>}
   */
  @responseHandler("openlist")
  static async getConfig(): Promise<InvokeResponse<OpenListConfig>> {
    return await invoke("openlist_get_config");
  }
}
