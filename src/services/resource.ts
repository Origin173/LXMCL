import { invoke } from "@tauri-apps/api/core";
import { ModLoaderType } from "@/enums/instance";
import {
  GameResourceInfo,
  ModLoaderResourceInfo,
  OtherResourceSearchRes,
} from "@/models/resource";
import { InvokeResponse } from "@/models/response";
import { responseHandler } from "@/utils/response";

/**
 * Service class for managing game & mod loader resources.
 */
export class ResourceService {
  /**
   * FETCH the list of game versions.
   * @returns {Promise<InvokeResponse<GameResourceInfo[]>>}
   */
  @responseHandler("resource")
  static async fetchGameVersionList(): Promise<
    InvokeResponse<GameResourceInfo[]>
  > {
    return await invoke("fetch_game_version_list");
  }

  /**
   * FETCH the list of mode loader versions.
   * @returns {Promise<InvokeResponse<ModLoaderResourceInfo[]>>}
   */
  @responseHandler("resource")
  static async fetchModLoaderVersionList(
    gameVersion: string,
    modLoaderType: ModLoaderType
  ): Promise<InvokeResponse<ModLoaderResourceInfo[]>> {
    return await invoke("fetch_mod_loader_version_list", {
      gameVersion,
      modLoaderType,
    });
  }

  /**
   * FETCH the list of resources according to the given parameters.
   * @returns {Promise<InvokeResponse<OtherResourceInfo[]>>}
   */
  @responseHandler("resource")
  static async fetchResourceListByName(
    resourceType: string,
    searchQuery: string,
    gameVersion: string,
    selectedTag: string,
    sortBy: string,
    downloadSource: string,
    page: number,
    pageSize: number
  ): Promise<InvokeResponse<OtherResourceSearchRes>> {
    return await invoke("fetch_resource_list_by_name", {
      resourceType,
      searchQuery,
      gameVersion,
      selectedTag,
      sortBy,
      downloadSource,
      page,
      pageSize,
    });
  }
}
