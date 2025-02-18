import { HStack } from "@chakra-ui/react";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { open } from "@tauri-apps/plugin-shell";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuEye } from "react-icons/lu";
import { CommonIconButton } from "@/components/common/common-icon-button";
import CountTag from "@/components/common/count-tag";
import Empty from "@/components/common/empty";
import { OptionItem, OptionItemGroup } from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import { SchematicInfo } from "@/models/game-instance";
import { mockSchematics } from "@/models/mock/game-instance";

const InstanceSchematicsPage = () => {
  const [schematics, setSchematics] = useState<SchematicInfo[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    setSchematics(mockSchematics);
  }, []);

  const schemSecMenuOperations = [
    {
      icon: "openFolder",
      onClick: () => {},
    },
    {
      icon: "refresh",
      onClick: () => {},
    },
  ];

  const schemItemMenuOperations = (schematic: SchematicInfo) => [
    {
      label: t("InstanceSchematicsPage.schematicList.preview"),
      icon: LuEye,
      onClick: () => {},
    },
    {
      label: "",
      icon: "copyOrMove",
      onClick: () => {},
    },
    {
      label: "",
      icon: "revealFile",
      onClick: () => revealItemInDir(schematic.filePath),
    },
  ];

  return (
    <Section
      title={t("InstanceSchematicsPage.schematicList.title")}
      titleExtra={<CountTag count={schematics.length} />}
      headExtra={
        <HStack spacing={2}>
          {schemSecMenuOperations.map((btn, index) => (
            <CommonIconButton
              key={index}
              icon={btn.icon}
              onClick={btn.onClick}
              size="xs"
              fontSize="sm"
              h={21}
            />
          ))}
        </HStack>
      }
    >
      {schematics.length > 0 ? (
        <OptionItemGroup
          items={schematics.map((schem) => (
            <OptionItem key={schem.name} title={schem.name}>
              <HStack spacing={0}>
                {schemItemMenuOperations(schem).map((item, index) => (
                  <CommonIconButton
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    onClick={item.onClick}
                    h={18}
                  />
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
