import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  IconButton,
  Box,
  Text,
  Card,
  VStack,
  Wrap,
  WrapItem
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
  const primaryColor = appearanceConfigs.theme.primaryColor;

  const ColorSelectPopover = () => {
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

  const PresetBackgroundList = () => {
    const presetBgList = [ "Jǫkull", "SJTU-eastgate" ]
    const presetChoice = appearanceConfigs.background.presetChoice;

    return (
      <Wrap spacing={3.5}>
        {presetBgList.map((bg) => (
          <WrapItem key={bg}>
            <VStack spacing={1}>
              <Card 
                w="6rem" h="3.375rem" 
                borderWidth={presetChoice === bg ? 2 : 0}
                borderColor={`${primaryColor}.500`}
                variant={presetChoice === bg ? "outline" : "elevated"}
                overflow="hidden"
              >
                <Box
                  w="100%" h="100%"
                  bgImage={`url('/images/${bg}.jpg')`}
                  bgSize="cover"
                  bgPosition="center"
                  bgRepeat="no-repeat"
                  onClick={() => {
                    update("appearance.background.presetChoice", bg);
                  }}
                />
              </Card>
              <Text 
                fontSize="xs" 
                className={`no-select ${presetChoice !== bg ? "secondary-text" : ""}`}
                mt={presetChoice === bg ? '-1px' : 0}   // compensate for the offset caused by selected card's border
              >
                {t(`AppearanceSettingsPage.background.presetBgList.${bg}.name`)}
              </Text>
            </VStack>
          </WrapItem>
        ))}
      </Wrap>
    )
  }

  const appearanceSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("AppearanceSettingsPage.theme.title"),
      items: [
        {
          title: t("AppearanceSettingsPage.theme.settings.primaryColor.title"),
          children: <ColorSelectPopover />
        }
      ]
    },
    {
      title: t("AppearanceSettingsPage.background.title"),
      items: [
        {
          title: t("AppearanceSettingsPage.background.settings.preset.title"),
          children: <PresetBackgroundList />
        }
      ]
    }
  ];

  return (
    <>
      {appearanceSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
}

export default AppearanceSettingsPage;