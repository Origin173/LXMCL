import { useTranslation } from 'react-i18next';
import { OptionItemGroupProps, OptionItemGroup } from "@/components/common/option-item";

const GlobalGameSettingsPage = () => {
  const { t } = useTranslation();

  const globalGameSettings: OptionItemGroupProps[] = [
    {
      title: t("GlobalGameSettingsPage.java.title"),
      items: []
    }
  ];

  return (
    <>
      {globalGameSettings.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
}

export default GlobalGameSettingsPage;