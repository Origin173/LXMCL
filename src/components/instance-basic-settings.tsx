import { Box, HStack, Image } from "@chakra-ui/react";
import { t } from "i18next";
import Editable from "@/components/common/editable";
import {
  OptionItemGroup,
  OptionItemGroupProps,
} from "@/components/common/option-item";
import { GameIconSelectorPopover } from "@/components/game-icon-selector";

interface InstanceBasicSettingsProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  iconSrc: string;
  setIconSrc: (iconSrc: string) => void;
}

export const InstanceBasicSettings: React.FC<InstanceBasicSettingsProps> = ({
  name,
  setName,
  description,
  setDescription,
  iconSrc,
  setIconSrc,
}) => {
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
  ];

  return (
    <Box height="100%" overflowY="auto">
      {instanceSpecSettingsGroups.map((group, index) => (
        <OptionItemGroup title={group.title} items={group.items} key={index} />
      ))}
    </Box>
  );
};
