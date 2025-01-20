import { useTranslation } from "react-i18next";
import ComingSoonSign from "@/components/coming-soon";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";

const JavaSettingsPage = () => {
  const { t } = useTranslation();

  const javaSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("JavaSettingsPage.java.title"),
      items: [],
    },
  ];

  return (
    <>
      {javaSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
      <ComingSoonSign />
    </>
  );
};

export default JavaSettingsPage;
