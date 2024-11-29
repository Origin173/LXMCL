import { useTranslation } from 'react-i18next';
import { OptionItemGroupProps, OptionItemGroup } from "@/components/common/option-item";

const DownloadSettingsPage = () => {
  const { t } = useTranslation();

  const downloadSettings: OptionItemGroupProps[] = [
    {
      title: t("DownloadSettingsPage.download.title"),
      items: []
    }
  ];

  return (
    <>
      {downloadSettings.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
}

export default DownloadSettingsPage;