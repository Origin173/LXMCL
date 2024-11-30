import { useLayoutEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  IconButton
} from "@chakra-ui/react";
import { useTranslation } from 'react-i18next';
import { LuChevronDown } from "react-icons/lu";
import { OptionItemGroupProps, OptionItemGroup } from "@/components/common/option-item";
import ChakraColorSelector from "@/components/common/chakra-color-selector";
import { useLauncherConfig } from "@/contexts/config";


const AppearanceSettingsPage = () => {
  const { t } = useTranslation();
  const { config, update } = useLauncherConfig();
  const appearanceConfigs = config.appearance;

  const ColorSelectPopover = () => {
    const primaryColor = appearanceConfigs.theme.primaryColor;

    return (
      <Popover>
        <PopoverTrigger>
          <IconButton 
            size="xs" 
            colorScheme={primaryColor}
            variant={primaryColor === "gray" ? "darkGray" : "solid"}
            aria-label="color"
            icon={<LuChevronDown />}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverBody>
            <ChakraColorSelector 
              current={primaryColor} 
              onColorSelect={(color) => {
                update("appearance.theme.primaryColor", color);
              }}
              size="xs"
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    )
  }

  const appearanceSettings: OptionItemGroupProps[] = [
    {
      title: t("AppearanceSettingsPage.theme.title"),
      items: [
        {
          title: t("AppearanceSettingsPage.theme.settings.primaryColor.title"),
          children: <ColorSelectPopover />
        }
      ]
    }
  ];

  return (
    <>
      {appearanceSettings.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
}

export default AppearanceSettingsPage;