import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";
import GenericConfirmDialog from "@/components/modals/generic-confirm-dialog";
import { useToast } from "@/contexts/toast";
import { restoreLauncherConfig } from "@/services/config";

const SyncAndRestoreSettingsPage = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isResetting, setResetting] = useState(false);

  const handleOpenConfirm = () => setConfirmOpen(true);
  const handleCloseConfirm = () => setConfirmOpen(false);

  const handleRestoreConfig = async () => {
    setResetting(true);
    try {
      await restoreLauncherConfig();
      toast({
        title: t("RestoreConfigConfirmDialog.success"),
        status: "success",
      });
    } catch (error) {
      console.error("Error restoring launcher config:", error);
      toast({
        title: t("RestoreConfigConfirmDialog.failure"),
        status: "error",
      });
    } finally {
      setResetting(false);
      handleCloseConfirm();
    }
  };

  const syncAndRestoreSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("SyncAndRestoreSettingsPage.launcherConfig.title"),
      items: [
        {
          title: t(
            "SyncAndRestoreSettingsPage.launcherConfig.settings.internetSync.title"
          ),
          children: (
            <Button variant="subtle" size="xs">
              {t(
                "SyncAndRestoreSettingsPage.launcherConfig.settings.internetSync.begin"
              )}
            </Button>
          ),
        },
        {
          title: t(
            "SyncAndRestoreSettingsPage.launcherConfig.settings.resetAllSettings.title"
          ),
          description: t(
            "SyncAndRestoreSettingsPage.launcherConfig.settings.resetAllSettings.description"
          ),
          children: (
            <Button
              colorScheme="red"
              variant="subtle"
              size="xs"
              onClick={handleOpenConfirm}
              isLoading={isResetting}
            >
              {t(
                "SyncAndRestoreSettingsPage.launcherConfig.settings.resetAllSettings.reset"
              )}
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <>
      {syncAndRestoreSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}

      <GenericConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        title={t("RestoreConfigConfirmDialog.title")}
        body={t("RestoreConfigConfirmDialog.body")}
        btnOK={t("RestoreConfigConfirmDialog.ok")}
        btnCancel={t("GenericConfirmModal.Button.cancel")}
        onOKCallback={handleRestoreConfig}
        isAlert
      />
    </>
  );
};

export default SyncAndRestoreSettingsPage;
