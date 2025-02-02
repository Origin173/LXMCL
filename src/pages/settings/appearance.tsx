import {
  Button,
  Card,
  Center,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChevronDown, LuPlus, LuTrash } from "react-icons/lu";
import ChakraColorSelector from "@/components/chakra-color-selector";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";
import { useLauncherConfig } from "@/contexts/config";
import { useToast } from "@/contexts/toast";
import {
  addCustomBackground,
  deleteCustomBackground,
  retriveCustomBackgroundList,
} from "@/services/config";
import { extractFileName } from "@/utils/string";

const AppearanceSettingsPage = () => {
  const { t } = useTranslation();
  const { config, update } = useLauncherConfig();
  const toast = useToast();
  const appearanceConfigs = config.appearance;
  const primaryColor = appearanceConfigs.theme.primaryColor;
  const selectedBgKey = appearanceConfigs.background.choice.replace(
    "%built-in:",
    ""
  );

  const [customBgList, setCustomBgList] = useState<Record<string, string>[]>(
    []
  );

  const handleRetriveCustomBackgroundList = useCallback(() => {
    appDataDir()
      .then((_appDataDir) => {
        retriveCustomBackgroundList()
          .then((list) => {
            const updatedList = list.map((bg) => ({
              fileName: bg,
              fullPath: `${_appDataDir}/UserContent/Backgrounds/${bg}`,
            }));
            setCustomBgList(updatedList);
          })
          .catch((error) => {
            toast({
              title: t("Services.config.retriveCustomBackgroundList.error"),
              status: "error",
            });
            setCustomBgList([]);
          });
      })
      .catch(() => {
        setCustomBgList([]);
      });
  }, [t, toast]);

  useEffect(() => {
    handleRetriveCustomBackgroundList();
  }, [handleRetriveCustomBackgroundList]);

  const handleAddCustomBackground = () => {
    open({
      multiple: false,
      filters: [
        {
          name: t("General.dialog.filterName.image"),
          extensions: ["jpg", "jpeg", "png", "gif", "webp"],
        },
      ],
    })
      .then((selectedPath) => {
        if (!selectedPath) return;
        addCustomBackground(selectedPath)
          .then((fileName) => {
            toast({
              title: t("Services.config.addCustomBackground.success"),
              status: "success",
            });
            handleRetriveCustomBackgroundList();
            // set selected background to the new added one.
            update("appearance.background.choice", fileName);
          })
          .catch(() => {
            toast({
              title: t("Services.config.addCustomBackground.error"),
              status: "error",
            });
          });
      })
      .catch(() => {});
  };

  const handleDeleteCustomBackground = (fileName: string) => {
    deleteCustomBackground(fileName)
      .then(() => {
        toast({
          title: t("Services.config.deleteCustomBackground.success"),
          status: "success",
        });

        // set the next bgKey (custom+1 > custom-1 > default) after delete
        const deletedIndex = customBgList.findIndex(
          (bg) => bg.fileName === fileName
        );

        let newSelectedBgKey;
        if (customBgList.length === 1) {
          newSelectedBgKey = "%built-in:Jokull";
        } else {
          newSelectedBgKey =
            deletedIndex < customBgList.length - 1
              ? customBgList[deletedIndex + 1].fileName
              : customBgList[deletedIndex - 1].fileName;
        }
        update("appearance.background.choice", newSelectedBgKey);

        // refresh custom bg list state
        handleRetriveCustomBackgroundList();
      })
      .catch((error) => {
        toast({
          title: t("Services.config.deleteCustomBackground.error"),
          status: "error",
        });
      });
  };

  const ColorSelectPopover = () => {
    return (
      <Popover>
        <PopoverTrigger>
          <IconButton
            size="xs"
            colorScheme={primaryColor}
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
    );
  };

  const HeadNavStyleMenu = () => {
    const headNavStyleTypes = ["standard", "simplified"];

    return (
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
            `AppearanceSettingsPage.theme.settings.headNavStyle.type.${appearanceConfigs.theme.headNavStyle}`
          )}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup
            value={appearanceConfigs.theme.headNavStyle}
            type="radio"
            onChange={(value) => {
              update("appearance.theme.headNavStyle", value);
            }}
          >
            {headNavStyleTypes.map((type) => (
              <MenuItemOption value={type} fontSize="xs" key={type}>
                {t(
                  `AppearanceSettingsPage.theme.settings.headNavStyle.type.${type}`
                )}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    );
  };

  interface BackgroundCardProps {
    bgAlt: string;
    bgSrc: string;
    selected: boolean;
    onSelect: () => void;
    label: string;
    extra?: React.ReactNode;
    extraOnHover?: React.ReactNode;
  }

  const BackgroundCard: React.FC<BackgroundCardProps> = ({
    bgAlt,
    bgSrc,
    selected,
    onSelect,
    label,
    extra,
    extraOnHover,
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <VStack spacing={1}>
        <Card
          w="6rem"
          h="3.375rem"
          borderWidth={selected ? 2 : 0}
          borderColor={`${primaryColor}.500`}
          variant={selected ? "outline" : "elevated"}
          overflow="hidden"
          cursor="pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            w="100%"
            h="100%"
            src={bgSrc}
            alt={bgAlt}
            objectFit="cover"
            position="absolute"
            borderRadius="sm"
            onClick={onSelect}
          />
          {extra}
          {isHovered && extraOnHover}
        </Card>
        <Text
          maxW="6rem"
          fontSize="xs"
          className={`no-select ${!selected ? "secondary-text" : ""}`}
          mt={selected ? "-1px" : 0} // compensate for the offset caused by selected card's border
          noOfLines={1}
        >
          {label}
        </Text>
      </VStack>
    );
  };

  const PresetBackgroundList = () => {
    const presetBgList = ["Jokull", "SJTU-eastgate"];

    return (
      <Wrap spacing={3.5} justify="right">
        {presetBgList.map((bg) => (
          <WrapItem key={bg}>
            <BackgroundCard
              bgAlt={bg}
              bgSrc={`/images/backgrounds/${bg}.jpg`}
              selected={selectedBgKey === bg}
              onSelect={() =>
                update("appearance.background.choice", `%built-in:${bg}`)
              }
              label={t(
                `AppearanceSettingsPage.background.presetBgList.${bg}.name`
              )}
            />
          </WrapItem>
        ))}
      </Wrap>
    );
  };

  const CustomBackgroundList = () => {
    return (
      <Wrap spacing={3.5} justify="right">
        {customBgList.map((bg) => (
          <WrapItem key={bg.fileName}>
            <BackgroundCard
              bgAlt={bg.fileName}
              bgSrc={convertFileSrc(bg.fullPath)}
              selected={selectedBgKey === bg.fileName}
              onSelect={() =>
                update("appearance.background.choice", bg.fileName)
              }
              label={extractFileName(bg.fileName)}
              extraOnHover={
                <Tooltip label={t("General.delete")} placement="top">
                  <IconButton
                    icon={<Icon as={LuTrash} />}
                    aria-label="delete"
                    size="xs"
                    colorScheme="blackAlpha"
                    position="absolute"
                    top={1}
                    right={1}
                    onClick={() => handleDeleteCustomBackground(bg.fileName)}
                  />
                </Tooltip>
              }
            />
          </WrapItem>
        ))}
        <WrapItem>
          <VStack spacing={1}>
            <Card
              w="6rem"
              h="3.375rem"
              borderWidth={1}
              borderStyle="dashed"
              borderColor="gray.400"
              bgColor="transparent"
              variant="outline"
              overflow="hidden"
              cursor="pointer"
              onClick={handleAddCustomBackground}
            >
              <Center h="100%" color={`${primaryColor}.500`}>
                <LuPlus />
              </Center>
            </Card>
            <Text fontSize="xs" className="secondary-text">
              {t("AppearanceSettingsPage.background.settings.custom.add")}
            </Text>
          </VStack>
        </WrapItem>
      </Wrap>
    );
  };

  const appearanceSettingGroups: OptionItemGroupProps[] = [
    {
      title: t("AppearanceSettingsPage.theme.title"),
      items: [
        {
          title: t("AppearanceSettingsPage.theme.settings.primaryColor.title"),
          children: <ColorSelectPopover />,
        },
        {
          title: t("AppearanceSettingsPage.theme.settings.headNavStyle.title"),
          children: <HeadNavStyleMenu />,
        },
      ],
    },
    {
      title: t("AppearanceSettingsPage.background.title"),
      items: [
        {
          title: t("AppearanceSettingsPage.background.settings.preset.title"),
          children: <PresetBackgroundList />,
        },
        {
          title: t("AppearanceSettingsPage.background.settings.custom.title"),
          children: <CustomBackgroundList />,
        },
      ],
    },
  ];

  return (
    <>
      {appearanceSettingGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </>
  );
};

export default AppearanceSettingsPage;
