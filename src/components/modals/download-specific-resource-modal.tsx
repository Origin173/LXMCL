import {
  Avatar,
  Box,
  Card,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Tag,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuDownload, LuUpload } from "react-icons/lu";
import { useLauncherConfig } from "@/contexts/config";
import { ModLoaderEnums, ModLoaderType } from "@/enums/instance";
import { useThemedCSSStyle } from "@/hooks/themed-css";
import { mockResourceVersionPacks } from "@/models/mock/resource";
import { OtherResourceInfo, ResourceVersionPack } from "@/models/resource";
import { ISOToDate } from "@/utils/datetime";
import CountTag from "../common/count-tag";
import LinkIconButton from "../common/link-icon-button";
import NavMenu from "../common/nav-menu";
import { OptionItem, OptionItemGroup } from "../common/option-item";
import { Section } from "../common/section";

interface DownloadSpecificResourceModalProps
  extends Omit<ModalProps, "children"> {
  resource: OtherResourceInfo;
  curInstanceVersion: string | undefined;
  curInstanceModLoader: ModLoaderType | undefined;
}

const DownloadSpecificResourceModal: React.FC<
  DownloadSpecificResourceModalProps
> = ({ resource, curInstanceVersion, curInstanceModLoader, ...modalProps }) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const themedStyles = useThemedCSSStyle();
  const primaryColor = config.appearance.theme.primaryColor;

  const [versionLabels, setVersionLabels] = useState<string[]>([]);
  const [selectedVersionLabel, setSelectedVersionLabel] =
    useState<string>("All");
  const [selectedModLoader, setSelectedModLoader] = useState<
    ModLoaderType | "All"
  >("All");
  const [versionPacks, setVersionPacks] = useState<ResourceVersionPack[]>([]);
  const [selectedVersionPacks, setSelectedVersionPacks] = useState<
    ResourceVersionPack[]
  >([]);

  const filterVersions = useCallback(() => {
    let filteredVersions = [...versionPacks];

    if (selectedVersionLabel !== "All") {
      filteredVersions = filteredVersions.filter(
        (item) => item.versionLabel === selectedVersionLabel
      );
    }

    if (selectedModLoader !== "All") {
      filteredVersions = filteredVersions.filter(
        (item) => item.modLoader === selectedModLoader
      );
    }

    setSelectedVersionPacks(filteredVersions);
  }, [selectedVersionLabel, selectedModLoader, versionPacks]);

  useEffect(() => {
    setSelectedModLoader(curInstanceModLoader || "All");

    if (curInstanceVersion) {
      const releaseVersionPattern = /^(\d+)\.(\d+)(?:\.\d+)?$/;
      const match = curInstanceVersion.match(releaseVersionPattern);
      if (match) {
        setSelectedVersionLabel(`${match[1]}.${match[2]}`);
      } else {
        setSelectedVersionLabel("All");
      }
    } else {
      setSelectedVersionLabel("All");
    }
  }, [curInstanceModLoader, curInstanceVersion]);

  useEffect(() => {
    filterVersions();
  }, [selectedVersionLabel, selectedModLoader, versionPacks, filterVersions]);

  useEffect(() => {
    const _versionLabels: string[] = [
      "1.21",
      "1.20",
      "1.19",
      "1.18",
      "1.17",
      "1.16",
    ];
    setVersionLabels(["All", ..._versionLabels]);
  }, []); // Mock data, TBD

  useEffect(() => {
    const _versionPacks: ResourceVersionPack[] = mockResourceVersionPacks;
    setVersionPacks(_versionPacks);
    filterVersions();
  }, [filterVersions]); // Mock data, TBD

  return (
    <Modal
      scrollBehavior="inside"
      size={{ base: "2xl", lg: "3xl", xl: "4xl" }}
      autoFocus={false}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent h="100%">
        <ModalHeader>
          <Text>
            {t("DownloadSpecificResourceModal.title", {
              name: resource.translatedName
                ? `${resource.translatedName} (${resource.name})`
                : resource.name,
            })}
          </Text>
          <Card className={themedStyles.card["card-front"]} mt={1.5}>
            <OptionItem
              title={
                resource.translatedName
                  ? `${resource.translatedName}｜${resource.name}`
                  : resource.name
              }
              titleExtra={
                <Wrap spacing={1}>
                  {resource.tags.map((tag, index) => (
                    <WrapItem key={index}>
                      <Tag colorScheme={primaryColor} className="tag-xs">
                        {tag}
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              }
              description={
                <VStack
                  fontSize="xs"
                  className="secondary-text no-select"
                  spacing={1}
                  align="flex-start"
                  w="100%"
                >
                  <Text overflow="hidden" className="ellipsis-text">
                    {resource.description}
                  </Text>
                </VStack>
              }
              prefixElement={
                <Avatar
                  src={resource.iconSrc}
                  name={resource.name}
                  boxSize="32px"
                  borderRadius="2px"
                />
              }
            />
            <HStack mt={1.5} spacing={8}>
              <HStack spacing={0}>
                <LinkIconButton
                  url="https://www.curseforge.com/minecraft" //TBD
                  aria-label="curseforge"
                  isExternal
                  withTooltip
                  h={18}
                />
                <Text fontSize="xs">
                  {t("DownloadSpecificResourceModal.goTo.curseforge")}
                </Text>
              </HStack>
              <HStack spacing={0}>
                <LinkIconButton
                  url="https://modrinth.com" //TBD
                  aria-label="curseforge"
                  isExternal
                  withTooltip
                  h={18}
                />
                <Text fontSize="xs">
                  {t("DownloadSpecificResourceModal.goTo.modrinth")}
                </Text>
              </HStack>
              <HStack spacing={0}>
                <LinkIconButton
                  url="https://www.mcmod.cn/" //TBD
                  aria-label="curseforge"
                  isExternal
                  withTooltip
                  h={18}
                />
                <Text fontSize="xs">
                  {t("DownloadSpecificResourceModal.goTo.mcmod")}
                </Text>
              </HStack>
            </HStack>
          </Card>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody h="100%" display="flex" flexDir="column">
          <Box flexShrink={0}>
            <NavMenu
              className="no-scrollbar"
              selectedKeys={[selectedVersionLabel]}
              onClick={setSelectedVersionLabel}
              direction="row"
              size="xs"
              spacing={3}
              flex={1}
              mb={1.5}
              display="flex"
              items={versionLabels.map((item) => ({
                value: item,
                label:
                  item !== "All"
                    ? item === curInstanceVersion
                      ? `${item} (${t("DownloadSpecificResourceModal.label.currentVersion")})`
                      : item
                    : t("DownloadSpecificResourceModal.label.all"),
              }))}
            />
            {resource.type === "mods" && (
              <NavMenu
                className="no-scrollbar"
                selectedKeys={[selectedModLoader]}
                onClick={setSelectedModLoader}
                direction="row"
                size="xs"
                spacing={3}
                flex={1}
                mb={2}
                display="flex"
                items={["All", ...Object.values(ModLoaderEnums)]
                  .filter((item) => item !== "Unknown")
                  .map((item) => ({
                    value: item,
                    label:
                      item !== "All"
                        ? item === curInstanceModLoader
                          ? `${item} (${t("DownloadSpecificResourceModal.label.currentModLoader")})`
                          : item
                        : t("DownloadSpecificResourceModal.label.all"),
                  }))}
              />
            )}
          </Box>
          <Box flex={1} flexDir="column" overflow="auto">
            {selectedVersionPacks.map((pack, index) => (
              <Section
                key={index}
                isAccordion
                title={pack.name}
                initialIsOpen={false}
                titleExtra={<CountTag count={pack.items.length} />}
                mb={2}
              >
                <OptionItemGroup
                  items={pack.items.map((item, index) => (
                    <OptionItem
                      key={index}
                      title={item.name}
                      description={
                        <HStack
                          fontSize="xs"
                          className="secondary-text no-select"
                          spacing={6}
                          align="flex-start"
                          w="100%"
                        >
                          <Text overflow="hidden" className="ellipsis-text">
                            {item.description}
                          </Text>
                          <HStack spacing={1}>
                            <LuUpload />
                            <Text>{ISOToDate(item.lastUpdated)}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <LuDownload />
                            <Text>{item.downloads}</Text>
                          </HStack>
                        </HStack>
                      }
                      prefixElement={
                        <Avatar
                          src={item.iconSrc}
                          name={item.name}
                          boxSize="32px"
                          borderRadius="4px"
                        />
                      }
                      isFullClickZone
                      onClick={() => {
                        console.log("Downloading", resource.name, item.name); // TBD
                      }}
                    />
                  ))}
                />
              </Section>
            ))}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DownloadSpecificResourceModal;
