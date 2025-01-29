import {
  Button,
  Flex,
  HStack,
  Input,
  MenuItemOption,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ResourceDownloadMenu from "@/components/resourse-download-menu";
import { useLauncherConfig } from "@/contexts/config";
import { GameResourceInfo, OtherResourceInfo } from "@/models/resource";

interface ResourceDownloadProps {
  resourceType: string;
}

const ResourceDownload: React.FC<ResourceDownloadProps> = ({
  resourceType,
}) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const [resourceList, setResourceList] = useState<OtherResourceInfo[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [downloadSource, setDownloadSource] = useState<string>("Curseforge");
  const [sortedBy, setSortedBy] = useState<string>("downloads");
  const [gameVersion, setGameVersion] = useState<string>("");

  const downloadSourceList = ["Curseforge", "Modrinth"];
  const sortedByList = ["downloads", "update", "creation", "name"];
  const [gameVersionList, setGameVersionList] = useState<string[]>([]);

  const modTypeList = [
    "all",
    "world",
    "technology",
    "magic",
    "adventure",
    "utility",
    "storage",
    "creatures",
    "equipment",
    "food",
    "building",
    "redstone",
    "decoration",
    "support",
    "other",
  ];

  const worldTypeList = [
    "all",
    "survival",
    "architecture",
    "parkour",
    "puzzle",
    "minigame",
    "pvp",
    "other",
  ];

  const resourcePackTypeList = [
    "all",
    "realistic",
    "cartoon",
    "simple",
    "medieval",
    "modern",
    "fantasy",
    "other",
  ];

  const shaderPackTypeList = ["all", "realistic", "fantasy"];

  const typeList =
    resourceType === "mod"
      ? modTypeList
      : resourceType === "world"
        ? worldTypeList
        : resourceType === "resourcepack"
          ? resourcePackTypeList
          : shaderPackTypeList;

  // @TODO: move this logic to backend and get data by invoke
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        "https://launchermeta.mojang.com/mc/game/version_manifest.json"
      );
      const data = await response.json();

      const versionData = data.versions as GameResourceInfo[];

      setGameVersionList(
        versionData
          .filter((version: GameResourceInfo) => version.type === "release")
          .map((version: GameResourceInfo) => version.id)
      );
    } catch (error) {
      console.error("Error fetching versions:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <VStack mt={1} fontSize="xs">
      <Flex align="center" gap={6}>
        <ResourceDownloadMenu
          label={t("DownloadResourceModal.label.type")}
          displayText={t(
            `DownloadResourceModal.${resourceType}TypeList.${selectedType}`
          )}
          onChange={setSelectedType}
          defaultValue={"all"}
          options={typeList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="xs">
              {t(`DownloadResourceModal.${resourceType}TypeList.${item}`)}
            </MenuItemOption>
          ))}
        />

        <ResourceDownloadMenu
          label={t("DownloadResourceModal.label.gameVer")}
          displayText={gameVersion}
          onChange={setGameVersion}
          defaultValue={""}
          options={gameVersionList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="xs">
              {item}
            </MenuItemOption>
          ))}
        />
      </Flex>

      <Flex align="center" gap={6}>
        <ResourceDownloadMenu
          label={t("DownloadResourceModal.label.source")}
          displayText={downloadSource}
          onChange={setDownloadSource}
          defaultValue={"Curseforge"}
          options={downloadSourceList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="xs">
              {item}
            </MenuItemOption>
          ))}
        />

        <ResourceDownloadMenu
          label={t("DownloadResourceModal.label.sort")}
          displayText={t(`DownloadResourceModal.sortedByList.${sortedBy}`)}
          onChange={setSortedBy}
          defaultValue={"downloads"}
          options={sortedByList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="xs">
              {t(`DownloadResourceModal.sortedByList.${item}`)}
            </MenuItemOption>
          ))}
        />
      </Flex>

      <HStack gap={3}>
        <Text whiteSpace="nowrap" w={8} textAlign="right">
          {t("DownloadResourceModal.label.name")}
        </Text>
        <Input
          placeholder={t("DownloadResourceModal.label.name")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          focusBorderColor={`${primaryColor}.500`}
          size="xs"
        />
        <Button
          colorScheme={primaryColor}
          size="xs"
          onClick={() => {
            // TBD
          }}
          px={5}
        >
          {t("DownloadResourceModal.button.search")}
        </Button>
      </HStack>
    </VStack>
  );
};

export default ResourceDownload;
