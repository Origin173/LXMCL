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
   * RETRIVE the list of players.
   * @returns {Promise<ResponseSuccess<Player[]> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async retrivePlayerList(): Promise<
    ResponseSuccess<Player[]> | ResponseError
  > {
    return {
      status: "success",
      data: await invoke<Player[]>("retrive_player_list"),
      message: "",
    };
  }

  /**
   * ADD a new player to the system.
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
   * DELETE a player by UUID.
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
   * RETRIVE the selected player by UUID.
   * @returns {Promise<ResponseSuccess<Player> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async retriveSelectedPlayer(): Promise<
    ResponseSuccess<Player> | ResponseError
  > {
    return {
      status: "success",
      data: await invoke<Player>("retrive_selected_player"),
      message: "",
    };
  }

  /**
   * UPDATE the selected player by UUID.
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
   * RETRIVE the list of authentication servers.
   * @returns {Promise<ResponseSuccess<AuthServer[]> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async retriveAuthServerList(): Promise<
    ResponseSuccess<AuthServer[]> | ResponseError
  > {
    return {
      status: "success",
      data: await invoke<AuthServer[]>("retrive_auth_server_list"),
      message: "",
    };
  }

  /**
   * RETRIVE the information of a new authentication server.
   * @param {string} url - The URL of the authentication server to be added.
   * @returns {Promise<ResponseSuccess<AuthServer> | ResponseError>}
   */
  @responseHandler("account", errorToLocaleKey)
  async retriveAuthServerInfo(
    url: string
  ): Promise<ResponseSuccess<AuthServer> | ResponseError> {
    return {
      status: "success",
      data: await invoke<AuthServer>("retrive_auth_server_info", { url }),
      message: "",
    };
  }

  /**
   * ADD the new authentication server to the storage.
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
   * DELETE the authentication server by URL.
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
