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
      items: [],
    },
  ];

  return (
    <>
      {syncAndRestoreSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
      <ComingSoonSign />
    </>
  );
};

export default SyncAndRestoreSettingsPage;
