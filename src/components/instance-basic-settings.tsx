import {
  Box,
  Button,
  HStack,
  IconButton,
  Image,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { t } from "i18next";
import { useRouter } from "next/router";
import { LuArrowRight } from "react-icons/lu";
import Editable from "@/components/common/editable";
import {
  OptionItem,
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
  const router = useRouter();

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
            title: directory.name,
            description: directory.dir,
            children: (
              <Radio
                isChecked={directory.dir === gameDirectory?.dir}
                onChange={() => {
                  setGameDirectory(directory);
                }}
              />
            ),
          })
        ),
        {
          title: t(
            `AddAndImportInstancePage.addAndImportOptions.manageDirs.title`
          ),
          description: t(
            `AddAndImportInstancePage.addAndImportOptions.manageDirs.description`
          ),
          children: (
            <IconButton
              aria-label="manageDirs"
              onClick={() => router.push("/settings/global-game")}
              variant="ghost"
              size="sm"
              icon={<LuArrowRight />}
            />
          ),
        },
      ],
    },
  ];

  return (
    <Box height="100%" overflowY="auto">
      {instanceSpecSettingsGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </Box>
  );
};
