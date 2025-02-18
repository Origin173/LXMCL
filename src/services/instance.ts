import { invoke } from "@tauri-apps/api/core";
import {
  GameInstanceSummary,
  GameServerInfo,
  Screenshot,
} from "@/models/game-instance";
import { InvokeResponse } from "@/models/response";
import { responseHandler } from "@/utils/response";

const errorToLocaleKey: { [key: string]: string } = {};

/**
 * Service class for managing instances and its local resources.
 */
export class InstanceService {
  /**
   * RETRIVE the list of local instances.
   * @returns {Promise<InvokeResponse<GameInstanceSummary[]>>}
   */
  @responseHandler("instance", errorToLocaleKey)
  static async retriveInstanceList(): Promise<
    InvokeResponse<GameInstanceSummary[]>
  > {
    return await invoke("retrive_instance_list");
  }

  /**
   * RETRIVE the list of game servers.
   * @param {number} instanceId - The instance ID to retrive the game servers for.
   * @param {boolean} queryOnline - A flag to determine whether to query online server status.
   * @returns {Promise<InvokeResponse<GameServerInfo[]>>}
   */
  @responseHandler("instance", errorToLocaleKey)
  static async retriveGameServerList(
    instanceId: number,
    queryOnline: boolean
  ): Promise<InvokeResponse<GameServerInfo[]>> {
    return await invoke("retrive_game_server_list", {
      instanceId,
      queryOnline,
    });
  }

  /**
   * RETRIVE the list of screenshots.
   * @param {number} instanceId - The instance ID to retrive the screenshots for.
   * @returns {Promise<InvokeResponse<Screenshot[]>>}
   */
  @responseHandler("instance", errorToLocaleKey)
  static async retriveScreenshotList(
    instanceId: number
  ): Promise<InvokeResponse<Screenshot[]>> {
    return await invoke("retrive_screenshot_list", {
      instanceId,
    });
  }
}
