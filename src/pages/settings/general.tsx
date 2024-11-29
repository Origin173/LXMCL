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
import { localeResources, changeLanguage, DEFAULT_LOCALE } from "@/locales";
import { OptionItemGroupProps, OptionItemGroup } from "@/components/common/option-item";


const GeneralSettingsPage = () => {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>(DEFAULT_LOCALE);
  
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    setCurrentLanguage(savedLocale || DEFAULT_LOCALE);
  }, []);

  const LocaleMenu = () => {
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
              changeLanguage(value);
              setCurrentLanguage(value);
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