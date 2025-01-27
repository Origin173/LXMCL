import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChevronDown } from "react-icons/lu";
import { useLauncherConfig } from "@/contexts/config";
import { GameResourceInfo, OtherResourceInfo } from "@/models/resource";

interface ResourceMenuProps {
  displayText: string;
  onChange: (value: string) => void;
  defaultValue: string;
  options: React.ReactNode;
}

const ResourceMenu: React.FC<ResourceMenuProps> = ({
  displayText,
  onChange,
  defaultValue,
  options,
}) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        size="sm"
        w="auto"
        variant="outline"
        textAlign="left"
        rightIcon={<LuChevronDown />}
      >
        {displayText}
      </MenuButton>
      <MenuList maxH="40vh" overflow="auto">
        <MenuOptionGroup
          defaultValue={defaultValue}
          type="radio"
          onChange={(value) => {
            onChange(value as string);
          }}
        >
          {options}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};

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
  const sortedByList = ["downloads", "updated", "created", "name"];
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
    <VStack mt={2}>
      <HStack>
        <Text>{t("DownloadResourceModal.label.type")}</Text>
        <ResourceMenu
          displayText={t(
            `DownloadResourceModal.${resourceType}TypeList.${selectedType}`
          )}
          onChange={setSelectedType}
          defaultValue={"all"}
          options={typeList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="sm">
              {t(`DownloadResourceModal.${resourceType}TypeList.${item}`)}
            </MenuItemOption>
          ))}
        />

        <Text>{t("DownloadResourceModal.label.version")}</Text>
        <ResourceMenu
          displayText={gameVersion}
          onChange={setGameVersion}
          defaultValue={""}
          options={gameVersionList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="sm">
              {item}
            </MenuItemOption>
          ))}
        />
      </HStack>

      <HStack>
        <Text>{t("DownloadResourceModal.label.source")}</Text>
        <ResourceMenu
          displayText={downloadSource}
          onChange={setDownloadSource}
          defaultValue={"Curseforge"}
          options={downloadSourceList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="sm">
              {item}
            </MenuItemOption>
          ))}
        />

        <Text>{t("DownloadResourceModal.label.sortedBy")}</Text>
        <ResourceMenu
          displayText={t(`DownloadResourceModal.sortedByList.${sortedBy}`)}
          onChange={setSortedBy}
          defaultValue={"downloads"}
          options={sortedByList.map((item, key) => (
            <MenuItemOption key={key} value={item} fontSize="sm">
              {t(`DownloadResourceModal.sortedByList.${item}`)}
            </MenuItemOption>
          ))}
        />
      </HStack>

      <HStack>
        <VStack>
          <Text w={8}>{t("DownloadResourceModal.label.name")}</Text>
        </VStack>
        <Input
          placeholder={t("DownloadResourceModal.label.name")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          focusBorderColor={`${primaryColor}.500`}
        />
        <Button
          colorScheme={primaryColor}
          size="sm"
          onClick={() => {
            // TBD
          }}
        >
          {t("DownloadResourceModal.button.search")}
        </Button>
      </HStack>
    </VStack>
  );
};

export default ResourceDownload;
