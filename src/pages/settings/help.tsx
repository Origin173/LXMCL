import { useTranslation } from 'react-i18next';
import { OptionItemGroupProps, OptionItemGroup } from "@/components/common/option-item";

const HelpSettingsPage = () => {
  const { t } = useTranslation();

  const helpSettings: OptionItemGroupProps[] = [
    {
      title: t("HelpSettingsPage.help.title"),
      items: []
    }
  ];

  return (
    <>
      {helpSettings.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
}

export default HelpSettingsPage;