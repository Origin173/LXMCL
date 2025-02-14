import { Flex, HStack, IconButton, Tag, Text, Tooltip } from "@chakra-ui/react";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuFolderOpen } from "react-icons/lu";
import { CommonIconButton } from "@/components/common/common-icon-button";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import { useLauncherConfig } from "@/contexts/config";
import { JavaInfo } from "@/models/system-info";

const JavaSettingsPage = () => {
  const { t } = useTranslation();
  const { config, getJavaInfos } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const [javaInfos, setJavaInfos] = useState<JavaInfo[]>([]);

  useEffect(() => {
    setJavaInfos(getJavaInfos() || []);
  }, [getJavaInfos]);

  const javaSecMenuOperations = [
    {
      icon: "download",
      label: t("JavaSettingsPage.javaList.download"),
    },
    {
      icon: "refresh",
      onClick: () => getJavaInfos(true),
    },
    {
      icon: "add",
      label: t("JavaSettingsPage.javaList.add"),
    },
  ];

  return (
    <Section
      title={t("JavaSettingsPage.javaList.title")}
      headExtra={
        <HStack spacing={2}>
          {javaSecMenuOperations.map((btn, index) => (
            <CommonIconButton
              key={index}
              icon={btn.icon}
              label={btn.label}
              onClick={btn.onClick}
              size="xs"
              fontSize="sm"
              h={21}
            />
          ))}
        </HStack>
      }
    >
      {javaInfos.length > 0 ? (
        <OptionItemGroup
          items={javaInfos.map((info) => (
            <OptionItem
              key={info.name}
              title={info.name}
              description={
                <Text
                  fontSize="xs"
                  className="secondary-text no-select"
                  wordBreak="break-all"
                >
                  {info.execPath}
                </Text>
              }
              titleExtra={
                <Flex>
                  <HStack spacing={2}>
                    <Tag
                      className="tag-xs"
                      variant="subtle"
                      colorScheme={primaryColor}
                    >
                      {`Java ${info.majorVersion}${info.isLts ? " (LTS)" : ""}`}
                    </Tag>
                    <Text fontSize="xs" color={`${primaryColor}.500`}>
                      {info.vendor}
                    </Text>
                  </HStack>
                </Flex>
              }
            >
              <Tooltip label={t("General.openFolder")}>
                <IconButton
                  aria-label={t("General.openFolder")}
                  icon={<LuFolderOpen />}
                  variant="ghost"
                  size="sm"
                  onClick={async () => await revealItemInDir(info.execPath)}
                />
              </Tooltip>
            </OptionItem>
          ))}
        />
      ) : (
        <Empty withIcon={false} size="sm" />
      )}
    </Section>
  );
};

export default JavaSettingsPage;
