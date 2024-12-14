import { Button, useDisclosure } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";
import GenericConfirmDialog from "@/components/modals/generic-confirm-dialog";
import { useLauncherConfig } from "@/contexts/config";
import { useToast } from "@/contexts/toast";

const SyncAndRestoreSettingsPage = () => {
  const { t } = useTranslation();
  const { restoreAll } = useLauncherConfig();

  const {
    isOpen: isConfirmOpen,
    onOpen: onOpenConfirm,
    onClose: onCloseConfirm,
  } = useDisclosure();

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
            "SyncAndRestoreSettingsPage.launcherConfig.settings.restoreAll.title"
          ),
          description: t(
            "SyncAndRestoreSettingsPage.launcherConfig.settings.restoreAll.description"
          ),
          children: (
            <Button
              colorScheme="red"
              variant="subtle"
              size="xs"
              onClick={onOpenConfirm}
            >
              {t(
                "SyncAndRestoreSettingsPage.launcherConfig.settings.restoreAll.restore"
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
        onClose={onCloseConfirm}
        title={t("RestoreConfigConfirmDialog.title")}
        body={t("RestoreConfigConfirmDialog.body")}
        btnOK={t("RestoreConfigConfirmDialog.btnOk")}
        btnCancel={t("GenericConfirmModal.Button.cancel")}
        onOKCallback={() => {
          restoreAll();
          onCloseConfirm();
        }}
        isAlert
      />
    </>
  );
};

export default SyncAndRestoreSettingsPage;
