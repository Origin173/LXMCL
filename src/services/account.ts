import { invoke } from "@tauri-apps/api/core";
import { AuthServer, Player } from "@/models/account";
import { ResponseError, ResponseSuccess } from "@/models/response";
import { responseHandler } from "@/utils/response";

const errorToLocaleKey: { [key: string]: string } = {
  DUPLICATE: "duplicate",
  INVALID: "invalid",
  NOT_FOUND: "notFound",
};

/**
 * Service class formanaging accounts, players, and authentication servers.
 */
class AccountService {
  /**
   * Fetches the list of players.
   * @returns {Promise<ResponseSuccess<Player[]> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async getPlayerList(): Promise<ResponseSuccess<Player[]> | ResponseError> {
    return {
      status: "success",
      data: await invoke<Player[]>("get_player_list"),
      message: "",
    };
  }

  /**
   * Adds a new player to the system.
   * @param {string} playerType - The type of the player to be added.
   * @param {string} username - The username of the player to be added.
   * @param {string} password - The password of the player to be added.
   * @param {string} authServerUrl - The authentication server URL for the player.
   * @returns {Promise<ResponseSuccess<void> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async addPlayer(
    playerType: string,
    username: string,
    password: string,
    authServerUrl: string
  ): Promise<ResponseSuccess<void> | ResponseError> {
    return {
      status: "success",
      data: await invoke("add_player", {
        playerType,
        username,
        password,
        authServerUrl,
      }),
      message: "",
    };
  }

  /**
   * Deletes a player by UUID.
   * @param {string} uuid - The UUID of the player to be deleted.
   * @returns {Promise<ResponseSuccess<void> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async deletePlayer(
    uuid: string
  ): Promise<ResponseSuccess<void> | ResponseError> {
    return {
      status: "success",
      data: await invoke("delete_player", { uuid }),
      message: "",
    };
  }

  /**
   * Fetches the selected player by UUID.
   * @returns {Promise<ResponseSuccess<Player> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async getSelectedPlayer(): Promise<ResponseSuccess<Player> | ResponseError> {
    return {
      status: "success",
      data: await invoke<Player>("get_selected_player"),
      message: "",
    };
  }

  /**
   * Posts the selected player by UUID.
   * @param {string} uuid - The UUID of the player to be posted as selected.
   * @returns {Promise<ResponseSuccess<void> | ResponseError>}
   */
  async updateSelectedPlayer(
    uuid: string
  ): Promise<ResponseSuccess<void> | ResponseError> {
    return {
      status: "success",
      data: await invoke("update_selected_player", { uuid }),
      message: "",
    };
  }

  /**
   * Fetches the list of authentication servers.
   * @returns {Promise<ResponseSuccess<AuthServer[]> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async getAuthServerList(): Promise<
    ResponseSuccess<AuthServer[]> | ResponseError
  > {
    return {
      status: "success",
      data: await invoke<AuthServer[]>("get_auth_server_list"),
      message: "",
    };
  }

  /**
   * Gets the information of a new authentication server.
   * @param {string} url - The URL of the authentication server to be added.
   * @returns {Promise<ResponseSuccess<AuthServer> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async getAuthServerInfo(
    url: string
  ): Promise<ResponseSuccess<AuthServer> | ResponseError> {
    return {
      status: "success",
      data: await invoke<AuthServer>("get_auth_server_info", { url }),
      message: "",
    };
  }

  /**
   * Adds the new authentication server to the storage.
   * @param {string} authUrl - The authentication server URL (already formatted by backend).
   * @returns {Promise<ResponseSuccess<void> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async addAuthServer(
    authUrl: string
  ): Promise<ResponseSuccess<void> | ResponseError> {
    return {
      status: "success",
      data: await invoke("add_auth_server", { authUrl }),
      message: "",
    };
  }

  /**
   * Deletes an authentication server by URL.
   * @param {string} url - The URL of the authentication server to be deleted.
   * @returns {Promise<ResponseSuccess<void> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async deleteAuthServer(
    url: string
  ): Promise<ResponseSuccess<void> | ResponseError> {
    return {
      status: "success",
      data: await invoke("delete_auth_server", { url }),
      message: "",
    };
  }
}

const accountService = new AccountService();

export default accountService;
