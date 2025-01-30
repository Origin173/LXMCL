import { Box, HStack, Image, Radio, VStack } from "@chakra-ui/react";
import { t } from "i18next";
import Editable from "@/components/common/editable";
import {
  OptionItemGroup,
  OptionItemGroupProps,
  OptionItemProps,
} from "@/components/common/option-item";
import { GameIconSelectorPopover } from "@/components/game-icon-selector";
import { useLauncherConfig } from "@/contexts/config";
import { GameDirectory } from "@/models/config";

interface InstanceBasicSettingsProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  iconSrc: string;
  setIconSrc: (iconSrc: string) => void;
  gameDirectory: GameDirectory | undefined;
  setGameDirectory: (directory: GameDirectory) => void;
}

export const InstanceBasicSettings: React.FC<InstanceBasicSettingsProps> = ({
  name,
  setName,
  description,
  setDescription,
  iconSrc,
  setIconSrc,
  gameDirectory,
  setGameDirectory,
}) => {
  const { config } = useLauncherConfig();

  const instanceSpecSettingsGroups: OptionItemGroupProps[] = [
    {
      items: [
        {
          title: t("InstanceSettingsPage.name"),
          children: (
            <Editable
              isTextArea={false}
              value={name}
              onEditSubmit={setName}
              textProps={{ className: "secondary-text", fontSize: "xs-sm" }}
              inputProps={{ fontSize: "xs-sm" }}
            />
          ),
        },
        {
          title: t("InstanceSettingsPage.description"),
          children: (
            <Editable
              isTextArea={true}
              value={description}
              onEditSubmit={setDescription}
              textProps={{ className: "secondary-text", fontSize: "xs-sm" }}
              inputProps={{ fontSize: "xs-sm" }}
            />
          ),
        },
        {
          title: t("InstanceSettingsPage.icon"),
          children: (
            <HStack>
              <Image
                src={iconSrc}
                alt={iconSrc}
                boxSize="28px"
                objectFit="cover"
              />
              <GameIconSelectorPopover
                value={iconSrc}
                onIconSelect={setIconSrc}
              />
            </HStack>
          ),
        },
      ],
    },
    {
      title: t("InstanceBasicSettings.selectDirectory"),
      items: [
        ...config.localGameDirectories.map(
          (directory): OptionItemProps => ({
            title:
              directory.name === "CURRENT_DIR"
                ? t(
                    "GlobalGameSettingsPage.directories.settings.directories.currentDir"
                  )
                : directory.name,
            description: directory.dir,
            prefixElement: (
              <Radio
                isChecked={directory.dir === gameDirectory?.dir}
                onChange={() => {
                  setGameDirectory(directory);
                }}
              />
            ),
            children: <></>,
          })
        ),
      ],
    },
  ];

  return (
    <Box h="100%" w="100%" overflowY="auto">
      <VStack w="100%" spacing={4}>
        {instanceSpecSettingsGroups.map((group, index) => (
          <OptionItemGroup
            title={group.title}
            items={group.items}
            key={index}
            w="100%"
          />
        ))}
      </VStack>
    </Box>
  );
};
