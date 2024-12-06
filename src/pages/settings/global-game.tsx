import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  NumberInput,
  NumberInputField,
  Progress,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { LuChevronDown } from "react-icons/lu";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";
import { useLauncherConfig } from "@/contexts/config";

const GlobalGameSettingsPage = () => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();

  const primaryColor = config.appearance.theme.primaryColor;
  const isolationStrategy = [
    "off",
    "full",
    "modable",
    "informal",
    "modable-and-informal",
  ];
  const launcherVisibilityStrategy = [
    "start-close",
    "running-hidden",
    "always",
  ];
  const processPriority = ["low", "middle", "high"];
  const usedMemory = 50;
  const allocatedMemory = 10;
  const totalMemory = 100;

  const globalGameSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("GlobalGameSettingsPage.performance.title"),
      items: [
        {
          title: t(
            "GlobalGameSettingsPage.performance.settings.gameWindowResolution.title"
          ),
          children: (
            <HStack>
              <NumberInput min={1} size="xs" maxW={16}>
                <NumberInputField pr={0} />
              </NumberInput>
              <Text fontSize="xs">×</Text>
              <NumberInput min={1} size="xs" maxW={16}>
                <NumberInputField pr={0} />
              </NumberInput>
              <Switch size="sm" colorScheme={primaryColor} />
              <Text fontSize="xs">
                {t(
                  "GlobalGameSettingsPage.performance.settings.gameWindowResolution.switch"
                )}
              </Text>
            </HStack>
          ),
        },
        {
          title: t(
            "GlobalGameSettingsPage.performance.settings.autoMenAllocation.title"
          ),
          children: <Switch size="sm" colorScheme={primaryColor} />,
        },
        {
          title: t(
            "GlobalGameSettingsPage.performance.settings.minMenAllocation.title"
          ),
          children: (
            <HStack spacing={4}>
              <Slider
                min={2048}
                max={8192}
                step={16}
                w={32}
                colorScheme={primaryColor}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <NumberInput min={2048} max={8192} size="xs" maxW={20}>
                <NumberInputField />
              </NumberInput>
              <Text fontSize="xs">MB</Text>
            </HStack>
          ),
        },
        {
          title: t(
            "GlobalGameSettingsPage.performance.settings.memoryUsage.title"
          ),
          description: t(
            "GlobalGameSettingsPage.performance.settings.memoryUsage.description",
            {
              usedMemory,
              allocatedMemory,
              totalMemory,
            }
          ),
          children: (
            <Progress
              value={((usedMemory + allocatedMemory) / totalMemory) * 100}
              max={100}
              size="sm"
              colorScheme="teal"
              width="100%"
              mt={2}
            />
          ),
        },
        {
          title: t(
            "GlobalGameSettingsPage.performance.settings.processPriority.title"
          ),
          children: (
            <Menu>
              <MenuButton
                as={Button}
                size="xs"
                w="auto"
                rightIcon={<LuChevronDown />}
                variant="outline"
                textAlign="left"
              >
                {t(
                  "GlobalGameSettingsPage.performance.settings.processPriority.low"
                )}
              </MenuButton>
              <MenuList>
                <MenuOptionGroup type="radio">
                  {processPriority.map((type) => (
                    <MenuItemOption value={type} fontSize="xs" key={type}>
                      {t(
                        `GlobalGameSettingsPage.performance.settings.processPriority.${type}`
                      )}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          ),
        },
      ],
    },
    {
      title: t("GlobalGameSettingsPage.versionIsolation.title"),
      items: [
        {
          title: t(
            "GlobalGameSettingsPage.versionIsolation.settings.enableVersionIsolation.title"
          ),
          children: <Switch size="sm" colorScheme={primaryColor} />,
        },
        {
          title: t(
            "GlobalGameSettingsPage.versionIsolation.settings.isolationStrategy.title"
          ),
          children: (
            <Menu>
              <MenuButton
                as={Button}
                size="xs"
                w="auto"
                rightIcon={<LuChevronDown />}
                variant="outline"
                textAlign="left"
              >
                {t(
                  "GlobalGameSettingsPage.versionIsolation.settings.isolationStrategy.full"
                )}
              </MenuButton>
              <MenuList>
                <MenuOptionGroup type="radio">
                  {isolationStrategy.map((type) => (
                    <MenuItemOption value={type} fontSize="xs" key={type}>
                      {t(
                        `GlobalGameSettingsPage.versionIsolation.settings.isolationStrategy.${type}`
                      )}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          ),
        },
      ],
    },
    {
      title: t("GlobalGameSettingsPage.moreOptions.title"),
      items: [
        {
          title: t(
            "GlobalGameSettingsPage.moreOptions.settings.launcherVisibility.title"
          ),
          children: (
            <Menu>
              <MenuButton
                as={Button}
                size="xs"
                w="auto"
                rightIcon={<LuChevronDown />}
                variant="outline"
                textAlign="left"
              >
                {t(
                  "GlobalGameSettingsPage.moreOptions.settings.launcherVisibility.always"
                )}
              </MenuButton>
              <MenuList>
                <MenuOptionGroup type="radio">
                  {launcherVisibilityStrategy.map((type) => (
                    <MenuItemOption value={type} fontSize="xs" key={type}>
                      {t(
                        `GlobalGameSettingsPage.moreOptions.settings.launcherVisibility.${type}`
                      )}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          ),
        },
        {
          title: t(
            "GlobalGameSettingsPage.moreOptions.settings.displayGameLog.title"
          ),
          children: <Switch size="sm" colorScheme={primaryColor} />,
        },
        {
          title: t(
            "GlobalGameSettingsPage.moreOptions.settings.enableAdvancedOptions.title"
          ),
          children: <Switch size="sm" colorScheme={primaryColor} />,
        },
      ],
    },
  ];

  return (
    <>
      {globalGameSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
};

export default GlobalGameSettingsPage;
