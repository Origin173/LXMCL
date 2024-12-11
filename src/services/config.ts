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
