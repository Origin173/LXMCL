import { Box, IconButton, Image, Text } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import React from "react";
import { useTranslation } from "react-i18next";
import { LuFolderOpen } from "react-icons/lu";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { GameServer, World } from "@/models/game-instance";
import { mockGameserver, mockWorlds } from "@/models/mock/game-instance";
import { formatRelativeTime } from "@/utils/datetime";

const InstanceWorldsPage = () => {
  const localWorlds: World[] = mockWorlds;
  const gameServers: GameServer[] = mockGameserver;
  const { t } = useTranslation();

  return (
    <>
      {localWorlds.length > 0 ? (
        <OptionItemGroup
          title={t("InstanceWorldsPage.worldList.title")}
          items={localWorlds.map((world) => (
            <OptionItem
              key={world.name}
              title={world.name}
              description={`${t("InstanceWorldsPage.worldList.lastPlayedAt")} ${formatRelativeTime(world.lastPlayedAt, t)}`}
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
                aria-label={"null"}
                icon={<LuFolderOpen />}
                variant="ghost"
                size="sm"
                onClick={() => {
                  open(world.fileDir);
                }}
              />
            </OptionItem>
          ))}
        />
      ) : (
        <Box>
          <Text fontWeight="bold" fontSize="sm">
            {t("InstanceWorldsPage.worldList.title")}
          </Text>
          <Empty withIcon={false} size="sm" />
        </Box>
      )}

      {gameServers.length > 0 ? (
        <OptionItemGroup
          title={t("InstanceWorldsPage.serverList.title")}
          items={gameServers.map((server) => (
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
          ))}
        />
      ) : (
        <Box>
          <Text fontWeight="bold" fontSize="sm">
            {t("InstanceWorldsPage.serverList.title")}
          </Text>
          <Empty withIcon={false} size="sm" />
        </Box>
      )}
    </>
  );
};

export default InstanceWorldsPage;
