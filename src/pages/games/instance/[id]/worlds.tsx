import { IconButton, Image } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import React from "react";
import { useTranslation } from "react-i18next";
import { LuFolderOpen } from "react-icons/lu";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { mockGameserver, mockWorlds } from "@/models/mock/game-instance";
import { formatRelativeTime } from "@/utils/datetime";

interface World {
  name: string;
  lastPlayedAt: string;
  iconUrl: string;
  fileDir: string;
}

interface GameServer {
  icon: string;
  ip: string;
  name: string;
}

const InstanceWorldsPage = () => {
  const localWorlds: World[] = mockWorlds;
  const gameServers: GameServer[] = mockGameserver;
  const { t } = useTranslation();

  return (
    <>
      <OptionItemGroup
        title={t("WorldsPage.worldList.title")}
        items={
          localWorlds.length > 0
            ? localWorlds.map((world) => (
                <OptionItem
                  key={world.name}
                  title={world.name}
                  description={`${t("WorldsPage.worldList.lastPlayedAt")}: ${formatRelativeTime(world.lastPlayedAt, t)}`}
                  prefixElement={
                    <Image
                      src={world.iconUrl}
                      alt={world.name}
                      width={30}
                      height={30}
                      style={{ borderRadius: "4px" }}
                    />
                  }
                >
                  <IconButton
                    aria-label={t("WorldsPage.worldList.openFolder")}
                    icon={<LuFolderOpen />}
                    variant="subtle"
                    size="sm"
                    onClick={() => {
                      open(world.fileDir);
                    }}
                  />
                </OptionItem>
              ))
            : [
                <Empty
                  key="no-worlds"
                  description={t("WorldsPage.worldList.null")}
                  withIcon={false}
                />,
              ]
        }
      />
      <OptionItemGroup
        title={t("WorldsPage.serverList.title")}
        items={
          gameServers.length > 0
            ? gameServers.map((server) => (
                <OptionItem
                  key={server.name}
                  title={server.name}
                  description={server.ip}
                  prefixElement={
                    <Image
                      src={server.icon}
                      alt={server.name}
                      width={30}
                      height={30}
                      style={{ borderRadius: "4px" }}
                    />
                  }
                >
                  <></>
                </OptionItem>
              ))
            : [
                <Empty
                  key="no-servers"
                  description={t("WorldsPage.serverList.null")}
                  withIcon={false}
                />,
              ]
        }
      />
    </>
  );
};

export default InstanceWorldsPage;
