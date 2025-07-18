import {
  Avatar,
  AvatarBadge,
  Center,
  HStack,
  Highlight,
  Icon,
  Input,
  Tag,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LuCircleCheck,
  LuCircleMinus,
  LuClockArrowUp,
  LuSearch,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu";
import { BeatLoader } from "react-spinners";
import { CommonIconButton } from "@/components/common/common-icon-button";
import CountTag from "@/components/common/count-tag";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import ModLoaderCards from "@/components/mod-loader-cards";
import CheckModUpdateModal from "@/components/modals/check-mod-update-modal";
import { useLauncherConfig } from "@/contexts/config";
import { useInstanceSharedData } from "@/contexts/instance";
import { useSharedModals } from "@/contexts/shared-modal";
import { useToast } from "@/contexts/toast";
import { InstanceSubdirType, ModLoaderType } from "@/enums/instance";
import { OtherResourceType } from "@/enums/resource";
import { InstanceError } from "@/enums/service-error";
import { GetStateFlag } from "@/hooks/get-state";
import { LocalModInfo } from "@/models/instance/misc";
import { ModUpdateRecord, OtherResourceFileInfo } from "@/models/resource";
import { InstanceService } from "@/services/instance";
import { ResourceService } from "@/services/resource";
import { base64ImgSrc } from "@/utils/string";

const InstanceModsPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const {
    summary,
    openInstanceSubdir,
    handleImportResource,
    getLocalModList,
    isLocalModListLoading: isLoading,
  } = useInstanceSharedData();
  const { config, update } = useLauncherConfig();
  const { openSharedModal } = useSharedModals();
  const primaryColor = config.appearance.theme.primaryColor;
  const accordionStates = config.states.instanceModsPage.accordionStates;

  const [localMods, setLocalMods] = useState<LocalModInfo[]>([]);
  const [filteredMods, setFilteredMods] = useState<LocalModInfo[]>([]);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateList, setUpdateList] = useState<ModUpdateRecord[]>([]);
  const [modsToUpdate, setModsToUpdate] = useState<LocalModInfo[]>([]);
  const [checkingUpdateIndex, setCheckingUpdateIndex] = useState<number>(1);

  const {
    isOpen: isCheckUpdateModalOpen,
    onOpen: onCheckUpdateModalOpen,
    onClose,
  } = useDisclosure();

  const onCheckUpdateModalClose = () => {
    setIsCheckingUpdate(false);
    setUpdateList([]);
    setModsToUpdate([]);
    setCheckingUpdateIndex(0);
    onClose();
  };

  const getLocalModListWrapper = useCallback(
    (sync?: boolean) => {
      getLocalModList(sync).then((data) => {
        if (data === GetStateFlag.Cancelled) {
          // this means the user has cancelled the operation.
          return;
        }
        setLocalMods(data || []);
      });
    },
    [getLocalModList]
  );

  useEffect(() => {
    getLocalModListWrapper();
  }, [getLocalModListWrapper]);

  useEffect(() => {
    const keywords = query.trim().toLowerCase().split(/\s+/);
    if (keywords.length === 0 || keywords[0] === "") {
      setFilteredMods(localMods);
    } else {
      const filtered = localMods.filter((mod) => {
        const name = mod.name?.toLowerCase() || "";
        const fileName = mod.fileName?.toLowerCase() || "";
        return keywords.some(
          (kw) => name.includes(kw) || fileName.includes(kw)
        );
      });

      setFilteredMods(filtered);
    }
  }, [query, localMods]);

  useEffect(() => {
    if (isSearching) searchInputRef.current?.focus();
  }, [isSearching]);

  const handleClearSearch = () => {
    setQuery("");
    setIsSearching(false);
  };

  const handleToggleModByExtension = useCallback(
    (filePath: string, enable: boolean) => {
      InstanceService.toggleModByExtension(filePath, enable).then(
        (response) => {
          if (response.status === "success") {
            setLocalMods((prevMods) =>
              prevMods.map((prev) => {
                if (prev.filePath === filePath) {
                  let newFilePath = prev.filePath;
                  if (enable && newFilePath.endsWith(".disabled")) {
                    newFilePath = newFilePath.slice(0, -9);
                  }
                  if (!enable && !newFilePath.endsWith(".disabled")) {
                    newFilePath = newFilePath + ".disabled";
                  }

                  return {
                    ...prev,
                    filePath: newFilePath,
                    enabled: enable,
                  };
                }
                return prev;
              })
            );
          } else {
            toast({
              title: response.message,
              description: response.details,
              status: "error",
            });
            if (response.raw_error === InstanceError.FileNotFoundError) {
              getLocalModListWrapper(true);
            }
          }
        }
      );
    },
    [toast, getLocalModListWrapper]
  );

  const handleFetchLatestMod = useCallback(
    async (
      resourceId: string,
      modLoader: ModLoaderType | "All",
      gameVersions: string[],
      downloadSource: string
    ): Promise<OtherResourceFileInfo | undefined> => {
      try {
        const response = await ResourceService.fetchResourceVersionPacks(
          resourceId,
          modLoader,
          gameVersions,
          downloadSource
        );

        if (response.status === "success") {
          const versionPack = response.data.find(
            (pack) => pack.name === summary?.version
          );

          if (!versionPack) return undefined;

          const candidateFiles = versionPack.items.filter(
            (file) =>
              file.releaseType === "beta" || file.releaseType === "release"
          );

          candidateFiles.sort(
            (a, b) =>
              new Date(b.fileDate).getTime() - new Date(a.fileDate).getTime()
          );

          return candidateFiles[0];
        } else {
          toast({
            title: response.message,
            description: response.details,
            status: "error",
          });
          return undefined;
        }
      } catch (error) {
        console.error("Failed to fetch latest mod:", error);
        return undefined;
      }
    },
    [summary?.version, toast]
  );

  const handleCheckModUpdate = useCallback(async () => {
    setIsCheckingUpdate(true);
    onCheckUpdateModalOpen();

    try {
      const updatePromises = localMods.map(async (mod) => {
        try {
          const [cfRemoteModRes, mdRemoteModRes] = await Promise.all([
            ResourceService.getRemoteResourceByFile("CurseForge", mod.filePath),
            ResourceService.getRemoteResourceByFile("Modrinth", mod.filePath),
          ]);

          let cfRemoteMod,
            mdRemoteMod = undefined;

          if (cfRemoteModRes.status === "success") {
            cfRemoteMod = cfRemoteModRes.data;
          }
          if (mdRemoteModRes.status === "success") {
            mdRemoteMod = mdRemoteModRes.data;
          }

          const updatePromises = [];

          if (cfRemoteMod?.resourceId) {
            updatePromises.push(
              handleFetchLatestMod(
                cfRemoteMod.resourceId,
                mod.loaderType,
                [summary?.majorVersion || "All"],
                "CurseForge"
              )
            );
          } else {
            updatePromises.push(Promise.resolve(undefined));
          }

          if (mdRemoteMod?.resourceId) {
            updatePromises.push(
              handleFetchLatestMod(
                mdRemoteMod.resourceId,
                mod.loaderType,
                [summary?.version || "All"],
                "Modrinth"
              )
            );
          } else {
            updatePromises.push(Promise.resolve(undefined));
          }

          const [cfRemoteFile, mdRemoteFile] =
            await Promise.all(updatePromises);

          let isCurseForgeNewer = cfRemoteMod !== undefined;
          if (cfRemoteFile && mdRemoteFile) {
            isCurseForgeNewer =
              new Date(cfRemoteFile.fileDate).getTime() >
              new Date(mdRemoteFile.fileDate).getTime();
          }

          const latestFile = isCurseForgeNewer ? cfRemoteFile : mdRemoteFile;
          const remoteMod = isCurseForgeNewer ? cfRemoteMod : mdRemoteMod;

          let needUpdate = false;

          if (latestFile && remoteMod) {
            needUpdate =
              new Date(latestFile.fileDate).getTime() -
                new Date(remoteMod.fileDate).getTime() >
              0;
          }

          if (needUpdate && latestFile) {
            return {
              mod,
              updateRecord: {
                name: mod.name,
                curVersion: mod.version,
                newVersion: latestFile.name,
                source: isCurseForgeNewer ? "CurseForge" : "Modrinth",
                downloadUrl: latestFile.downloadUrl,
                sha1: latestFile.sha1,
                fileName: latestFile.fileName,
              },
            };
          }
          return null;
        } catch (error) {
          console.error(`Failed to check update for mod ${mod.name}:`, error);
          return null;
        }
      });

      const results: any[] = [];

      await Promise.allSettled(
        updatePromises.map(async (p) => {
          const res = await p;
          setCheckingUpdateIndex(results.length + 1);
          results.push(res);
        })
      );

      const validUpdates = results.filter(
        (result): result is NonNullable<typeof result> => result !== null
      );

      setModsToUpdate(validUpdates.map((item) => item.mod));
      setUpdateList(validUpdates.map((item) => item.updateRecord));
    } catch (error) {
      console.error("Failed to check mod updates:", error);
    } finally {
      setIsCheckingUpdate(false);
    }
  }, [
    localMods,
    handleFetchLatestMod,
    summary?.version,
    summary?.majorVersion,
    onCheckUpdateModalOpen,
  ]);

  const handleDownloadUpdatedMods = useCallback(
    async (urlShaPairs: { url: string; sha1: string; fileName: string }[]) => {
      if (summary?.id) {
        InstanceService.retrieveInstanceSubdirPath(
          summary.id,
          InstanceSubdirType.Mods
        ).then((response) => {
          if (response.status === "success") {
            const modsDir = response.data;
            for (const pair of urlShaPairs) {
              const { url, sha1, fileName } = pair;
              const filePath = modsDir + "/" + fileName;
              const oldMod = modsToUpdate.find((mod) =>
                updateList.some(
                  (update) =>
                    update.fileName === fileName && update.name === mod.name
                )
              );

              if (oldMod) {
                const oldFilePath = oldMod.filePath;
                ResourceService.updateMod(
                  url,
                  sha1,
                  filePath,
                  oldFilePath
                ).then((response) => {
                  if (response.status !== "success") {
                    toast({
                      title: response.message,
                      description: response.details,
                      status: "error",
                    });
                  }
                });
              }
            }
          } else {
            toast({
              title: response.message,
              description: response.details,
              status: "error",
            });
          }
        });
      }
    },
    [summary?.id, toast, modsToUpdate, updateList]
  );

  const modSecMenuOperations = [
    {
      icon: "openFolder",
      onClick: () => {
        openInstanceSubdir(InstanceSubdirType.Mods);
      },
    },
    {
      icon: "add",
      onClick: () => {
        handleImportResource({
          filterName: t("InstanceDetailsLayout.instanceTabList.mods"),
          filterExt: ["zip", "jar", "disabled"],
          tgtDirType: InstanceSubdirType.Mods,
          decompress: false,
          onSuccessCallback: () => {
            getLocalModListWrapper(true);
          },
        });
      },
    },
    {
      icon: "download",
      onClick: () => {
        openSharedModal("download-resource", {
          initialResourceType: OtherResourceType.Mod,
        });
      },
    },
    {
      icon: LuClockArrowUp,
      label: t("InstanceModsPage.modList.menu.update"),
      onClick: handleCheckModUpdate,
    },
    {
      icon: "refresh",
      onClick: () => {
        getLocalModListWrapper(true);
      },
    },
  ];

  const modItemMenuOperations = (mod: LocalModInfo) => [
    ...(mod.potentialIncompatibility
      ? [
          {
            label: t("InstanceModsPage.modList.menu.alert"),
            icon: LuTriangleAlert,
            danger: true,
            onClick: () => {},
          },
        ]
      : []),
    {
      label: t(mod.enabled ? "General.disable" : "General.enable"),
      icon: mod.enabled ? LuCircleMinus : LuCircleCheck,
      danger: false,
      onClick: () => {
        handleToggleModByExtension(mod.filePath, !mod.enabled);
      },
    },
    {
      label: "",
      icon: "revealFile", // use common-icon-button predefined icon
      danger: false,
      onClick: () => {
        revealItemInDir(mod.filePath);
      },
    },
    {
      label: t("InstanceModsPage.modList.menu.info"),
      icon: "info",
      danger: false,
      onClick: () => {},
    },
  ];

  return (
    <>
      <Section
        title={t("InstanceModsPage.modLoaderList.title")}
        isAccordion
        initialIsOpen={accordionStates[0]}
        onAccordionToggle={(isOpen) => {
          update(
            "states.instanceModsPage.accordionStates",
            accordionStates.toSpliced(0, 1, isOpen)
          );
        }}
      >
        <ModLoaderCards
          currentType={summary?.modLoader.loaderType || ModLoaderType.Unknown}
          currentVersion={summary?.modLoader.version}
          displayMode="entry"
        />
      </Section>
      <Section
        title={t("InstanceModsPage.modList.title")}
        isAccordion
        initialIsOpen={accordionStates[1]}
        titleExtra={
          !isLoading && (
            <CountTag
              count={`${query.trim() ? `${filteredMods.length} / ` : ""}${localMods.length}`}
            />
          )
        }
        onAccordionToggle={(isOpen) => {
          update(
            "states.instanceModsPage.accordionStates",
            accordionStates.toSpliced(1, 1, isOpen)
          );
        }}
        headExtra={
          <HStack spacing={2}>
            {modSecMenuOperations.map((btn, index) => (
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

            {isSearching ? (
              <HStack>
                <Input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  size="xs"
                  w={140}
                  fontSize="sm"
                  placeholder={t("InstanceModsPage.modList.menu.placeholder")}
                  focusBorderColor={`${primaryColor}.500`}
                />
                <CommonIconButton
                  icon={LuX}
                  onClick={handleClearSearch}
                  size="xs"
                  fontSize="sm"
                  label={t("General.cancel")}
                />
              </HStack>
            ) : (
              <CommonIconButton
                icon={LuSearch}
                onClick={() => setIsSearching(true)}
                size="xs"
                fontSize="sm"
                label={t("InstanceModsPage.modList.menu.search")}
              />
            )}
          </HStack>
        }
      >
        {summary?.modLoader.loaderType === ModLoaderType.Unknown &&
          filteredMods.length > 0 && (
            <HStack fontSize="xs" color="red.600" mt={-0.5} ml={1.5} mb={2}>
              <Icon as={LuTriangleAlert} />
              <Text>{t("InstanceModsPage.modList.warning")}</Text>
            </HStack>
          )}
        {isLoading ? (
          <Center mt={8}>
            <BeatLoader size={16} color="gray" />
          </Center>
        ) : filteredMods.length > 0 ? (
          <OptionItemGroup
            items={filteredMods.map((mod) => (
              <OptionItem
                key={mod.fileName} // unique
                childrenOnHover
                title={
                  <Text fontSize="xs-sm">
                    <Highlight
                      query={query.trim().toLowerCase().split(/\s+/)}
                      styles={{ bg: "yello.200" }}
                    >
                      {mod.translatedName
                        ? `${mod.translatedName}｜${mod.name}`
                        : mod.name || mod.fileName}
                    </Highlight>
                  </Text>
                }
                titleExtra={
                  <HStack>
                    {mod.version && (
                      <Text fontSize="xs" className="secondary-text">
                        {mod.version}
                      </Text>
                    )}
                    {mod.loaderType !== ModLoaderType.Unknown && (
                      <Tag colorScheme={primaryColor} className="tag-xs">
                        {mod.loaderType}
                      </Tag>
                    )}
                  </HStack>
                }
                description={
                  <Text
                    fontSize="xs"
                    overflow="hidden"
                    className="secondary-text ellipsis-text" // only show one line
                  >
                    <Highlight
                      query={query.trim().toLowerCase().split(/\s+/)}
                      styles={{ bg: "yellow.200" }}
                    >
                      {mod.fileName}
                    </Highlight>
                    {mod.description ? `: ${mod.description}` : ""}
                  </Text>
                }
                prefixElement={
                  <Avatar
                    src={base64ImgSrc(mod.iconSrc)}
                    name={mod.name || mod.fileName}
                    boxSize="28px"
                    borderRadius="4px"
                    style={{
                      filter: mod.enabled ? "none" : "grayscale(90%)",
                      opacity: mod.enabled ? 1 : 0.5,
                    }}
                  >
                    <AvatarBadge
                      bg={
                        mod.enabled
                          ? mod.potentialIncompatibility
                            ? "orange"
                            : "green"
                          : "black" // black with 0.5 opacity looks like gray.
                      }
                      boxSize="0.75em"
                      borderWidth={2}
                    />
                  </Avatar>
                }
              >
                <HStack spacing={0}>
                  {modItemMenuOperations(mod).map((item, index) => (
                    <CommonIconButton
                      key={index}
                      icon={item.icon}
                      label={item.label}
                      colorScheme={item.danger ? "red" : "gray"}
                      onClick={item.onClick}
                    />
                  ))}
                </HStack>
              </OptionItem>
            ))}
          />
        ) : (
          <Empty withIcon={false} size="sm" />
        )}
      </Section>
      <CheckModUpdateModal
        isOpen={isCheckUpdateModalOpen}
        onClose={onCheckUpdateModalClose}
        isLoading={isCheckingUpdate}
        updateList={updateList}
        checkingUpdateIndex={checkingUpdateIndex}
        totalModNum={localMods.length}
        onDownload={handleDownloadUpdatedMods}
      />
    </>
  );
};

export default InstanceModsPage;
