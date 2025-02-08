import { invoke } from "@tauri-apps/api/core";
import {
  GameResourceInfo,
  ModLoaderResourceInfo,
  ModLoaderType,
} from "@/models/resource";
import { InvokeResponse } from "@/models/response";
import { responseHandler } from "@/utils/response";

const errorToLocaleKey: { [key: string]: string } = {
  PARSE_ERROR: "parseError",
  NO_DOWNLOAD_API: "noDownloadApi",
};

/**
 * Service class for managing game & mod loader resources.
 */
export class ResourceService {
  /**
   * RETRIVE the list of game versions.
   * @returns {Promise<InvokeResponse<GameResourceInfo[]>>}
   */
  @responseHandler("resource", errorToLocaleKey)
  static async retriveGameVersionList(): Promise<
    InvokeResponse<GameResourceInfo[]>
  > {
    return await invoke("retrive_game_version_list");
  }

  /**
   * RETRIVE the list of mode loader versions.
   * @returns {Promise<InvokeResponse<ModLoaderResourceInfo[]>>}
   */
  @responseHandler("resource", errorToLocaleKey)
  static async retriveModLoaderVersionList(
    gameVersion: string,
    modLoaderType: ModLoaderType
  ): Promise<InvokeResponse<ModLoaderResourceInfo[]>> {
    return await invoke("retrive_mod_loader_version_list", {
      gameVersion,
      modLoaderType,
    });
  }
}
