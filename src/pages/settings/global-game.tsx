import {
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LuFolder,
  LuFolderOpen,
  LuPenLine,
  LuPlus,
  LuTrash,
} from "react-icons/lu";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";
import GameSettingsGroups from "@/components/game-settings-groups";
import EditGameDirectoryModal from "@/components/modals/edit-game-directory-modal";
import GenericConfirmDialog from "@/components/modals/generic-confirm-dialog";
import { useLauncherConfig } from "@/contexts/config";
import { GameDirectory } from "@/models/config";

const GlobalGameSettingsPage = () => {
  const { t } = useTranslation();
  const { config, update } = useLauncherConfig();

  const [selectedDir, setSelectedDir] = useState<GameDirectory>({
    name: "",
    dir: "",
  });

  const {
    isOpen: isDeleteDirDialogOpen,
    onOpen: onDeleteDirDialogOpen,
    onClose: onDeleteDirDialogClose,
  } = useDisclosure();

  const {
    isOpen: isAddDirModalOpen,
    onOpen: onAddDirModalOpen,
    onClose: onAddDirModalClose,
  } = useDisclosure();

  const {
    isOpen: isEditDirModalOpen,
    onOpen: onEditDirModalOpen,
    onClose: onEditDirModalClose,
  } = useDisclosure();

  const handleDeleteDir = () => {
    update(
      "localGameDirectories",
      config.localGameDirectories.filter((dir) => dir.dir !== selectedDir.dir)
    );
    onDeleteDirDialogClose();
  };

  const globalSpecSettingsGroups: OptionItemGroupProps[] = [
    {
      title: t("GlobalGameSettingsPage.directories.title"),
      items: [
        {
          title: t(
            "GlobalGameSettingsPage.directories.settings.directories.title"
          ),
          children: (
            <>
              <Tooltip
                label={t(
                  "GlobalGameSettingsPage.directories.settings.directories.add"
                )}
                placement="top"
              >
                <IconButton
                  aria-label="add"
                  variant="ghost"
                  size="xs"
                  icon={<Icon as={LuPlus} boxSize={3.5} />}
                  h={21}
                  onClick={onAddDirModalOpen}
                />
              </Tooltip>
              <EditGameDirectoryModal
                isOpen={isAddDirModalOpen}
                onClose={onAddDirModalClose}
                add
              />
            </>
          ),
        },
        <VStack key="dir-list" ml={1.5} spacing={0.5}>
          {config.localGameDirectories.map((directory, index) => (
            <Flex key={index} alignItems="center" w="100%">
              <HStack overflow="hidden" mr={2}>
                <LuFolder size={12} />
                <Text fontSize="xs" className="ellipsis-text" flex={1}>
                  <span>
                    {["CURRENT_DIR", "OFFICIAL_DIR"].includes(directory.name)
                      ? t(
                          `GlobalGameSettingsPage.directories.settings.directories.special.${directory.name}`
                        )
                      : directory.name}
                  </span>
                  <span className="secondary-text">&ensp;{directory.dir}</span>
                </Text>
              </HStack>
              <HStack spacing={1} ml="auto">
                <Tooltip label={t("General.openFolder")}>
                  <IconButton
                    aria-label="openFolder"
                    variant="ghost"
                    size="xs"
                    icon={<LuFolderOpen />}
                    h={21}
                    onClick={() => {
                      open(directory.dir);
                    }}
                  />
                </Tooltip>

                {directory.name !== "CURRENT_DIR" && (
                  <Tooltip label={t("General.edit")}>
                    <IconButton
                      aria-label="editDir"
                      variant="ghost"
                      size="xs"
                      icon={<LuPenLine />}
                      h={21}
                      onClick={() => {
                        setSelectedDir(directory);
                        onEditDirModalOpen();
                      }}
                    />
                  </Tooltip>
                )}

                {directory.name !== "CURRENT_DIR" && (
                  <Tooltip label={t("General.delete")}>
                    <IconButton
                      aria-label="deleteDir"
                      variant="ghost"
                      size="xs"
                      icon={<LuTrash />}
                      h={21}
                      colorScheme="red"
                      onClick={() => {
                        setSelectedDir(directory);
                        onDeleteDirDialogOpen();
                      }}
                    />
                  </Tooltip>
                )}
              </HStack>
            </Flex>
          ))}

          <EditGameDirectoryModal
            isOpen={isEditDirModalOpen}
            onClose={onEditDirModalClose}
            currentName={selectedDir.name}
            currentPath={selectedDir.dir}
          />

          <GenericConfirmDialog
            isAlert
            isOpen={isDeleteDirDialogOpen}
            onClose={onDeleteDirDialogClose}
            title={t("GlobalGameSettingsPage.directories.deleteDialog.title")}
            body={t("GlobalGameSettingsPage.directories.deleteDialog.content", {
              dirName:
                selectedDir.name === "OFFICIAL_DIR"
                  ? t(
                      "GlobalGameSettingsPage.directories.settings.directories.special.OFFICIAL_DIR"
                    )
                  : selectedDir.name,
            })}
            btnOK={t("General.delete")}
            btnCancel={t("General.cancel")}
            onOKCallback={handleDeleteDir}
          />
        </VStack>,
      ],
    },
  ];

  return (
    <>
      {globalSpecSettingsGroups.map((group, index) => (
        <OptionItemGroup {...group} key={index} />
      ))}
      <GameSettingsGroups />
    </>
  );
};

export default GlobalGameSettingsPage;
