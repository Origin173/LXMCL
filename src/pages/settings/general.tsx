import { Switch } from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";
import LanguageMenu from "@/components/language-menu";
import { useLauncherConfig } from "@/contexts/config";

const GeneralSettingsPage = () => {
  const { t } = useTranslation();
  const { config, update } = useLauncherConfig();
  const generalConfigs = config.general;
  const primaryColor = config.appearance.theme.primaryColor;

  const generalSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("GeneralSettingsPage.general.title"),
      items: [
        {
          title: t("GeneralSettingsPage.general.settings.language.title"),
          children: <LanguageMenu />,
        },
      ],
    },
    {
      title: t("GeneralSettingsPage.functions.title"),
      items: [
        {
          title: t("GeneralSettingsPage.functions.settings.discover.title"),
          children: (
            <Switch
              colorScheme={primaryColor}
              isChecked={generalConfigs.optionalFunctions.discover}
              onChange={(e) => {
                update("general.optionalFunctions.discover", e.target.checked);
              }}
            />
          ),
        },
      ],
    },
  ];

  return (
    <>
      {generalSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
};

export default GeneralSettingsPage;
