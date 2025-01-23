import {
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  MenuProps,
} from "@chakra-ui/react";
import React from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useLauncherConfig } from "@/contexts/config";
import { localeResources } from "@/locales";

const LanguageMenu: React.FC<Omit<MenuProps, "children">> = ({ ...props }) => {
  const { config, update } = useLauncherConfig();
  const currentLanguage = config.general.general.language;

  return (
    <Menu {...props}>
      <MenuButton
        as={Button}
        size="xs"
        w="auto"
        rightIcon={
          props.placement === "top" ? <LuChevronUp /> : <LuChevronDown />
        }
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
            update("general.general.language", value);
          }}
        >
          {Object.keys(localeResources).map((key) => (
            <MenuItemOption key={key} value={key} fontSize="xs">
              {localeResources[key].display_name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};

export default LanguageMenu;
