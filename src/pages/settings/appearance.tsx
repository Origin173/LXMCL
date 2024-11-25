import React from "react";
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


const AppearanceSettingsPage = () => {
  const { t } = useTranslation();
  const currentLanguage = localStorage.getItem('locale') || DEFAULT_LOCALE;

  const LocaleMenu = () => {
    return (
      <Menu>
        <MenuButton 
          as={Button} size="sm" w="auto"
          rightIcon={<FiChevronDown/>} 
          variant="outline"
          style={{ textAlign: 'left' }}
        >
          {localeResources[currentLanguage]?.display_name}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup
            defaultValue={currentLanguage}
            type="radio"
            onChange={(value) => changeLanguage(value as string)}
          >
            {Object.keys(localeResources).map(key => (
              <MenuItemOption key={key} value={key} fontSize="sm">
                {localeResources[key].display_name}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    )
  }

  const appearanceSettings: OptionItemGroupProps[] = [{
    title: t("AppearanceSettingsPage.appearance.title"),
    items: [
      {
        title: t("AppearanceSettingsPage.appearance.settings.language.title"),
        children: <LocaleMenu />
      }
    ]
  }]
  
  return (
    <>
      {appearanceSettings.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
}

export default AppearanceSettingsPage;