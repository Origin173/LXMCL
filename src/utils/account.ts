import { Player } from "@/models/account";

export function genPlayerId(player: Player) {
  let serverIdentity = player.authServer?.authUrl ?? "";

  if (player.playerType === "offline") {
    serverIdentity = "OFFLINE";
  } else if (player.playerType === "microsoft") {
    serverIdentity = "MICROSOFT";
  }

  return `${player.name}:${serverIdentity}:${player.uuid}`;
}

export function isUuidValid(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    uuid
  );
}

export function isOfflinePlayernameValid(name: string) {
  return /^[a-zA-Z0-9_]{1,16}$/.test(name);
}
