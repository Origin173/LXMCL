import { IconButton, Image, Text, Tooltip, VStack } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuFolderOpen } from "react-icons/lu";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { ResourcePacksInfo } from "@/models/game-instance";
import { mockResourcePacks } from "@/models/mock/game-instance";

const InstanceResourcePacksPage = () => {
  const [resourcePacks, setResourcePacks] = useState<ResourcePacksInfo[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    setResourcePacks(mockResourcePacks);
  }, []);

  const defaultIcon = "/images/icons/DefaultPack.webp";

  return (
    <VStack spacing={2.5} align="stretch">
      <Text fontWeight="bold" fontSize="sm">
        {t("InstanceResourcePacksPage.resourcePackList.title")}
      </Text>
      {resourcePacks.length > 0 ? (
        <VStack spacing={2.5} align="stretch">
          <OptionItemGroup
            items={resourcePacks.map((pack) => (
              <OptionItem
                key={pack.name}
                title={pack.name}
                description={
                  pack.description ||
                  t("InstanceResourcePacksPage.resourcePackList.description")
                }
                prefixElement={
                  <Image
                    src={pack.iconUrl || defaultIcon}
                    alt={pack.name}
                    width={30}
                    height={30}
                    style={{ borderRadius: "4px" }}
                    onError={(e) => {
                      e.currentTarget.src = defaultIcon;
                    }}
                  />
                }
              >
                <Tooltip label={t("General.openFolder")}>
                  <IconButton
                    aria-label={t("General.openFolder")}
                    icon={<LuFolderOpen />}
                    variant="ghost"
                    size="sm"
                    onClick={() => open(pack.fileDir)}
                  />
                </Tooltip>
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

export default InstanceResourcePacksPage;
