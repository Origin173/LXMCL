// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Button
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import { localeResources } from "@/locales";
import { OptionItemGroupProps, OptionItemGroup } from "@/components/common/option-item";
import { useLauncherConfig } from "@/contexts/config";


const GeneralSettingsPage = () => {
  const { t } = useTranslation();
  const { config, update } = useLauncherConfig();
  const generalConfigs = config.general;

  const LocaleMenu = () => {
    const currentLanguage = generalConfigs.general.language;

    return (
      <Menu>
        <MenuButton 
          as={Button} size="xs" w="auto"
          rightIcon={<FiChevronDown/>} 
          variant="outline"
          textAlign="left"
        >
          {localeResources[currentLanguage]?.display_name}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup
            defaultValue={currentLanguage}
            type="radio"
            onChange={(value) => { 
              update("general.general.language", value as string);
            }}
          >
            {Object.keys(localeResources).map(key => (
              <MenuItemOption key={key} value={key} fontSize="xs">
                {localeResources[key].display_name}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    )
  }

  const generalSettings: OptionItemGroupProps[] = [{
    title: t("GeneralSettingsPage.general.title"),
    items: [
      {
        title: t("GeneralSettingsPage.general.settings.language.title"),
        children: <LocaleMenu />
      }
    ]
  }]
  
  return (
    <>
      {generalSettings.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
}

export default GeneralSettingsPage;