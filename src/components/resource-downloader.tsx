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
import {
  modTagList,
  resourcePackTagList,
  shaderPackTagList,
  sortByList,
  worldTagList,
} from "@/enums/resource";
import { mockDownloadResourceList } from "@/models/mock/resource";
import { GameResourceInfo, OtherResourceInfo } from "@/models/resource";
import { ResourceService } from "@/services/resource";

interface ResourceDownloaderProps {
  resourceType: string;
}

const ResourceDownloader: React.FC<ResourceDownloaderProps> = ({
  resourceType,
}) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const toast = useToast();

  const [gameVersionList, setGameVersionList] = useState<string[]>([]);

  const [resourceList, setResourceList] = useState<OtherResourceInfo[]>([]);
  const [isLoadingResourceList, setIsLoadingResourceList] =
    useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true); // use for infinite scroll

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [gameVersion, setGameVersion] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Relevancy");
  const [downloadSource, setDownloadSource] = useState<
    "CurseForge" | "Modrinth"
  >("CurseForge");

  const downloadSourceList = [
    "CurseForge",
    ...(resourceType === "world" ? [] : ["Modrinth"]),
  ];

  const tagList =
    resourceType === "mod"
      ? modTagList
      : resourceType === "world"
        ? worldTagList
        : resourceType === "resourcepack"
          ? resourcePackTagList
          : shaderPackTagList;

  const finalTagList = tagList[downloadSource];
  const finalSortByList = sortByList[downloadSource];

  const onDownloadSourceChange = (e: string) => {
    setDownloadSource(e === "CurseForge" ? "CurseForge" : "Modrinth");
    setSelectedTag("All");
    setSortBy(e === "CurseForge" ? "Relevancy" : "Relevance");
  };

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
      setHasMore(true);
      setResourceList(mockDownloadResourceList);
      setIsLoadingResourceList(false);
    }, 500);
  }, []);

  const loadMore = async () => {
    // TBD
    if (!hasMore) return;
    setTimeout(() => {
      setResourceList((prev) => [...prev, ...mockDownloadResourceList]);
      if (resourceList.length >= 24) setHasMore(false);
    }, 500);
  };

  useEffect(() => {
    fetchVersionList();
  }, [fetchVersionList]);

  useEffect(() => {
    fetchResourceList();
  }, [
    searchQuery,
    gameVersion,
    selectedTag,
    sortBy,
    downloadSource,
    fetchResourceList,
  ]);

  return (
    <VStack fontSize="xs" h="100%">
      <HStack gap={3}>
        <ResourceDownloadMenu
          label={t("DownloadResourceModal.label.tag")}
          displayText={t(
            `DownloadResourceModal.${resourceType}TagList.${downloadSource}.${selectedTag}`
          )}
          onChange={setSelectedTag}
          defaultValue={"All"}
          options={finalTagList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="xs">
              {t(
                `DownloadResourceModal.${resourceType}TagList.${downloadSource}.${item}`
              )}
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
          onChange={onDownloadSourceChange}
          defaultValue={"CurseForge"}
          options={downloadSourceList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="xs">
              {item}
            </MenuItemOption>
          ))}
          width={28}
        />

        <ResourceDownloadMenu
          label={t("DownloadResourceModal.label.sortBy")}
          displayText={t(
            `DownloadResourceModal.sortByList.${downloadSource}.${sortBy}`
          )}
          onChange={setSortBy}
          defaultValue={
            downloadSource === "CurseForge" ? "Relevancy" : "Relevance"
          }
          options={finalSortByList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="xs">
              {t(`DownloadResourceModal.sortByList.${downloadSource}.${item}`)}
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

export default ResourceDownloader;
