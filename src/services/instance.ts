import { invoke } from "@tauri-apps/api/core";
import { GameServerInfo } from "@/models/game-instance";
import { InvokeResponse } from "@/models/response";
import { responseHandler } from "@/utils/response";

const errorToLocaleKey: { [key: string]: string } = {};

/**
 * Service class for managing instances and its local resources.
 */
export class InstanceService {
  /**
   * RETRIVE the list of game servers.
   * @param {number} instanceId - The instance ID to fetch the game servers for.
   * @param {boolean} queryOnline - A flag to determine whether to query online server status.
   * @returns {Promise<InvokeResponse<GameServerInfo[]>>} A promise that resolves to an array of GameServerInfo objects.
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
}
