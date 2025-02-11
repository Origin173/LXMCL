import {
  Box,
  Button,
  Center,
  HStack,
  Input,
  MenuItemOption,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BeatLoader } from "react-spinners";
import ResourceDownloadList from "@/components/resource-download-list";
import ResourceDownloadMenu from "@/components/resourse-download-menu";
import { useLauncherConfig } from "@/contexts/config";
import { useToast } from "@/contexts/toast";
import { mockDownloadResourceList } from "@/models/mock/resource";
import { GameResourceInfo, OtherResourceInfo } from "@/models/resource";
import { ResourceService } from "@/services/resource";

interface ResourceDownloadProps {
  resourceType: string;
}

const ResourceDownload: React.FC<ResourceDownloadProps> = ({
  resourceType,
}) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const toast = useToast();

  const [resourceList, setResourceList] = useState<OtherResourceInfo[]>([]);
  const [isLoadingResourceList, setIsLoadingResourceList] =
    useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true); // use for infinite scroll

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

  const fetchVersionList = useCallback(async () => {
    const response = await ResourceService.retriveGameVersionList();
    if (response.status === "success") {
      const versionData = response.data;
      setGameVersionList(
        versionData
          .filter((version: GameResourceInfo) => version.gameType === "release")
          .map((version: GameResourceInfo) => version.id)
      );
    } else {
      setGameVersionList([]);
      toast({
        title: response.message,
        description: response.details,
        status: "error",
      });
    }
  }, [toast]);

  const fetchResourceList = useCallback(async () => {
    // TBD
    setIsLoadingResourceList(true);
    setTimeout(() => {
      setResourceList(mockDownloadResourceList);
      setIsLoadingResourceList(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchVersionList();
    fetchResourceList();
  }, [fetchVersionList, fetchResourceList]);

  const loadMore = async () => {
    // TBD
    if (!hasMore) return;
    setTimeout(() => {
      setResourceList((prev) => [...prev, ...mockDownloadResourceList]);
      if (resourceList.length >= 24) setHasMore(false);
    }, 500);
  };

  return (
    <VStack fontSize="xs" h="100%">
      <HStack gap={3}>
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
          width={20}
        />

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
          width={28}
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
          width={24}
        />
      </HStack>

      <HStack gap={3}>
        <Text whiteSpace="nowrap">{t("DownloadResourceModal.label.name")}</Text>
        <Input
          placeholder={t("DownloadResourceModal.label.name")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          focusBorderColor={`${primaryColor}.500`}
          size="xs"
          w={72}
        />
        <Button
          colorScheme={primaryColor}
          size="xs"
          onClick={fetchResourceList}
          px={5}
        >
          {t("DownloadResourceModal.button.search")}
        </Button>
      </HStack>

      <Box flexGrow={1} w="100%">
        {isLoadingResourceList ? (
          <Center>
            <BeatLoader size={16} color="gray" />
          </Center>
        ) : (
          <ResourceDownloadList
            list={resourceList}
            hasMore={hasMore}
            loadMore={loadMore}
          />
        )}
      </Box>
    </VStack>
  );
};

export default ResourceDownload;
