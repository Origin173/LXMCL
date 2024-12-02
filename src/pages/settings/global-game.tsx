import { useTranslation } from "react-i18next";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";

const GlobalGameSettingsPage = () => {
  const { t } = useTranslation();

  const globalGameSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("GlobalGameSettingsPage.game.title"),
      items: [],
    },
  ];

  return (
    <>
      {globalGameSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
};

export default GlobalGameSettingsPage;
