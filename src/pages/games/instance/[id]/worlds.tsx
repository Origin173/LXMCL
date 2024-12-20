import { IconButton, Image, Text, Tooltip, VStack } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuFolderOpen } from "react-icons/lu";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { GameServerInfo, WorldInfo } from "@/models/game-instance";
import { mockGameserver, mockWorlds } from "@/models/mock/game-instance";
import { formatRelativeTime } from "@/utils/datetime";

const InstanceWorldsPage = () => {
  const [worlds, setWorlds] = useState<WorldInfo[]>([]);
  const [gameServers, setGameServers] = useState<GameServerInfo[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    setWorlds(mockWorlds);
    setGameServers(mockGameserver);
  }, []);

  return (
    <VStack spacing={2.5} align="stretch">
      <Text fontWeight="bold" fontSize="sm">
        {t("InstanceWorldsPage.worldList.title")}
      </Text>
      {worlds.length > 0 ? (
        <VStack spacing={4} align="stretch">
          <OptionItemGroup
            items={worlds.map((world) => (
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
                <Tooltip label={t("General.openFolder")}>
                  <IconButton
                    aria-label={"open"}
                    icon={<LuFolderOpen />}
                    variant="ghost"
                    size="sm"
                    onClick={() => open(world.fileDir)}
                  />
                </Tooltip>
              </OptionItem>
            ))}
          />
        </VStack>
      ) : (
        <Empty withIcon={false} size="sm" />
      )}

      <Text fontWeight="bold" fontSize="sm">
        {t("InstanceWorldsPage.serverList.title")}
      </Text>
      {gameServers.length > 0 ? (
        <VStack spacing={2.5} align="stretch">
          <OptionItemGroup
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
        </VStack>
      ) : (
        <Empty withIcon={false} size="sm" />
      )}
    </VStack>
  );
};

export default InstanceWorldsPage;
