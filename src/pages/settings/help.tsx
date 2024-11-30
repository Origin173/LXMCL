import { useTranslation } from 'react-i18next';
import { OptionItemGroupProps, OptionItemGroup } from "@/components/common/option-item";

const HelpSettingsPage = () => {
  const { t } = useTranslation();

  const helpSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("HelpSettingsPage.help.title"),
      items: []
    }
  ];

  return (
    <>
      {helpSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
}

export default HelpSettingsPage;