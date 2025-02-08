import { HStack, IconButton, Tooltip } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuEye, LuFolderOpen } from "react-icons/lu";
import CountTag from "@/components/common/count-tag";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import { SchematicsInfo } from "@/models/game-instance";
import { mockSchematics } from "@/models/mock/game-instance";

const InstanceSchematicsPage = () => {
  const [schematics, setSchematics] = useState<SchematicsInfo[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    setSchematics(mockSchematics);
  }, []);

  const schemMenuOperations = (schematic: SchematicsInfo) => [
    {
      key: "preview",
      localesKey: "InstanceSchematicsPage.schematicList.preview",
      icon: LuEye,
      danger: false,
      onClick: () => {},
    },
    {
      key: "openFolder",
      localesKey: "General.openFolder",
      icon: LuFolderOpen,
      danger: false,
      onClick: () => open(schematic.filePath),
    },
  ];

  return (
    <Section
      title={t("InstanceSchematicsPage.schematicList.title")}
      titleExtra={<CountTag count={schematics.length} />}
    >
      {schematics.length > 0 ? (
        <OptionItemGroup
          items={schematics.map((pack) => (
            <OptionItem key={pack.name} title={pack.name}>
              <HStack spacing={0}>
                {schemMenuOperations(pack).map((item) => (
                  <Tooltip label={t(item.localesKey)} key={item.key}>
                    <IconButton
                      aria-label={t(item.localesKey)}
                      icon={<item.icon />}
                      variant="ghost"
                      size="sm"
                      h={18}
                      colorScheme={item.danger ? "red" : "gray"}
                      onClick={item.onClick}
                    />
                  </Tooltip>
                ))}
              </HStack>
            </OptionItem>
          ))}
        />
      ) : (
        <Empty withIcon={false} size="sm" />
      )}
    </Section>
  );
};

export default InstanceSchematicsPage;
