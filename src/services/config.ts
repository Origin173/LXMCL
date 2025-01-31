import { invoke } from "@tauri-apps/api/core";
import { LauncherConfig } from "@/models/config";

/**
 * Fetches the launcher configs.
 * @returns {Promise<LauncherConfig>} Launcher config
 * @throws {Error} If the backend call fails.
 */
export const getLauncherConfig = async (): Promise<LauncherConfig> => {
  try {
    return await invoke<LauncherConfig>("get_launcher_config");
  } catch (error) {
    console.error("Error in get_launcher_config:", error);
    throw error;
  }
};

/**
 * Updates the launcher configs.
 * @param {string} keyPath The key path to update.
 * @param {any} value The new value.
 * @returns {Promise<void>}
 * @throws {Error} If the backend call fails.
 */
export const updateLauncherConfig = async (
  keyPath: string,
  value: any
): Promise<void> => {
  try {
    await invoke("update_launcher_config", {
      keyPath,
      value: JSON.stringify(value),
    });
  } catch (error) {
    console.error("Error in update_launcher_config:", error);
    throw error;
  }
};

/**
 * Restores the launcher configs to their default state and returns the new configuration.
 * @returns {Promise<LauncherConfig>} The restored configuration.
 * @throws {Error} If the backend call fails.
 */
export const restoreLauncherConfig = async (): Promise<LauncherConfig> => {
  try {
    return await invoke<LauncherConfig>("restore_launcher_config");
  } catch (error) {
    console.error("Error in restore_launcher_config:", error);
    throw error;
  }
};

/**
 * Retrieves the list of custom background files.
 * @returns {Promise<string[]>} A list of background file names.
 * @throws {Error} If the backend call fails.
 */
export const retriveCustomBackgroundList = async (): Promise<string[]> => {
  try {
    return await invoke<string[]>("retrive_custom_background_list");
  } catch (error) {
    console.error("Error in retrive_custom_background_list:", error);
    throw error;
  }
};

/**
 * Adds a custom background image.
 * @param {string} sourceSrc The file path of the background image.
 * @returns {Promise<string>} The saved background file name.
 * @throws {Error} If the backend call fails.
 */
export const addCustomBackground = async (
  sourceSrc: string
): Promise<string> => {
  try {
    return await invoke<string>("add_custom_background", { sourceSrc });
  } catch (error) {
    console.error("Error in add_custom_background:", error);
    throw error;
  }
};

/**
 * Deletes a custom background image.
 * @param {string} fileName The name of the background image to delete.
 * @returns {Promise<void>} True if deleted successfully, false if the file was not found.
 * @throws {Error} If the backend call fails.
 */
export const deleteCustomBackground = async (
  fileName: string
): Promise<void> => {
  try {
    return await invoke("delete_custom_background", { fileName });
  } catch (error) {
    console.error("Error in delete_custom_background:", error);
    throw error;
  }
};
