import { invoke } from "@tauri-apps/api/core";
import { Player } from "@/models/account";

export const getPlayerList = async (): Promise<Player[]> => {
  try {
    return await invoke<Player[]>("get_accounts");
  } catch (error) {
    console.error("Error in get_accounts:", error);
    throw error;
  }
}

export const addPlayer = async (player: Player): Promise<void> => {
  try {
    await invoke("add_account", { player });
  } catch (error) {
    console.error("Error in add_account:", error);
    throw error;
  }
}