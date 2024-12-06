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
    "strategy1",
    "strategy2",
    "strategy3",
    "strategy4",
    "strategy5",
  ];
  const launcherVisibilityStrategy = ["strategy1", "strategy2", "strategy3"];
  const processPriority = ["low", "middle", "high"];
  const usedMemory = 50;
  const allocatedMemory = 10;
  const totalMemory = 100;

  const globalGameSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("GlobalGameSettingsPage.properties.title"),
      items: [
        {
          title: t(
            "GlobalGameSettingsPage.properties.settings.gameWindowResolution.title"
          ),
          children: (
            <HStack>
              <NumberInput min={1} size="xs" maxW={16}>
                <NumberInputField pr={0} />
              </NumberInput>
              <Text fontSize="xs">*</Text>
              <NumberInput min={1} size="xs" maxW={16}>
                <NumberInputField pr={0} />
              </NumberInput>
              <Switch size="sm" colorScheme={primaryColor} />
              <Text fontSize="xs">
                {t(
                  "GlobalGameSettingsPage.properties.settings.gameWindowResolution.radio"
                )}
              </Text>
            </HStack>
          ),
        },
        {
          title: t(
            "GlobalGameSettingsPage.properties.settings.allocateMemoryAutomatically.title"
          ),
          children: <Switch size="sm" colorScheme={primaryColor} />,
        },
        {
          title: t(
            "GlobalGameSettingsPage.properties.settings.minimunMemoryAllocation.title"
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
            "GlobalGameSettingsPage.properties.settings.memoryUsage.title"
          ),
          description: t(
            "GlobalGameSettingsPage.properties.settings.memoryUsage.description",
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
            "GlobalGameSettingsPage.properties.settings.processPriority.title"
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
                  "GlobalGameSettingsPage.properties.settings.processPriority.low"
                )}
              </MenuButton>
              <MenuList>
                <MenuOptionGroup type="radio">
                  {processPriority.map((type) => (
                    <MenuItemOption value={type} fontSize="xs" key={type}>
                      {t(
                        `GlobalGameSettingsPage.properties.settings.processPriority.${type}`
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
                  "GlobalGameSettingsPage.versionIsolation.settings.isolationStrategy.strategy1"
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
                  "GlobalGameSettingsPage.moreOptions.settings.launcherVisibility.strategy1"
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
