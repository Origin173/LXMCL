import { Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import ComingSoonSign from "@/components/common/coming-soon";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";

const SyncAndRestoreSettingsPage = () => {
  const { t } = useTranslation();

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
            <Button colorScheme="red" variant="subtle" size="xs">
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
    </>
  );
};

export default SyncAndRestoreSettingsPage;
