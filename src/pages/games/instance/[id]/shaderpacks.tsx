import { HStack, useDisclosure } from "@chakra-ui/react";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CommonIconButton } from "@/components/common/common-icon-button";
import CountTag from "@/components/common/count-tag";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import DownloadResourceModal from "@/components/modals/download-resource-modal";
import { useInstanceSharedData } from "@/contexts/instance";
import { InstanceSubdirType } from "@/enums/instance";
import { ShaderPackInfo } from "@/models/game-instance";

const InstanceShaderPacksPage = () => {
  const { t } = useTranslation();
  const { openSubdir, getShaderPackList } = useInstanceSharedData();
  const [shaderPacks, setShaderPacks] = useState<ShaderPackInfo[]>([]);

  const {
    isOpen: isDownloadModalOpen,
    onOpen: onDownloadModalOpen,
    onClose: onDownloadModalClose,
  } = useDisclosure();

  useEffect(() => {
    setShaderPacks(getShaderPackList() || []);
  }, [getShaderPackList]);

  const shaderSecMenuOperations = [
    {
      icon: "openFolder",
      onClick: () => {
        openSubdir(InstanceSubdirType.ShaderPacks);
      },
    },
    {
      icon: "add",
      onClick: () => {},
    },
    {
      icon: "download",
      onClick: () => {
        onDownloadModalOpen();
      },
    },
    {
      icon: "refresh",
      onClick: () => {
        setShaderPacks(getShaderPackList(true) || []);
      },
    },
  ];

  const shaderItemMenuOperations = (pack: ShaderPackInfo) => [
    {
      label: "",
      icon: "copyOrMove",
      onClick: () => {},
    },
    {
      label: "",
      icon: "revealFile",
      onClick: () => revealItemInDir(pack.filePath),
    },
  ];

  return (
    <Section
      title={t("InstanceShaderPacksPage.shaderPackList.title")}
      titleExtra={<CountTag count={shaderPacks.length} />}
      headExtra={
        <HStack spacing={2}>
          {shaderSecMenuOperations.map((btn, index) => (
            <CommonIconButton
              key={index}
              icon={btn.icon}
              onClick={btn.onClick}
              size="xs"
              fontSize="sm"
              h={21}
            />
          ))}
        </HStack>
      }
    >
      {shaderPacks.length > 0 ? (
        <OptionItemGroup
          items={shaderPacks.map((pack) => (
            <OptionItem key={pack.fileName} title={pack.fileName}>
              <HStack spacing={0}>
                {shaderItemMenuOperations(pack).map((item, index) => (
                  <CommonIconButton
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    onClick={item.onClick}
                    h={18}
                  />
                ))}
              </HStack>
            </OptionItem>
          ))}
        />
      ) : (
        <Empty withIcon={false} size="sm" />
      )}
      <DownloadResourceModal
        initialResourceType="shaderpack"
        isOpen={isDownloadModalOpen}
        onClose={onDownloadModalClose}
      />
    </Section>
  );
};

export default InstanceShaderPacksPage;
