import { BoxProps, HStack, Image, Radio, RadioGroup } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { LuTrash } from "react-icons/lu";
import { TbHanger } from "react-icons/tb";
import { OptionItemGroup } from "@/components/common/option-item";
import { RadioCardGroup } from "@/components/common/radio-card";
import RoleMenu from "@/components/role-menu";
import { useLauncherConfig } from "@/contexts/config";
import { useData, useDataDispatch } from "@/contexts/data";
import { Role } from "@/models/account";

interface RolesViewProps extends BoxProps {
  roles: Role[];
  viewType: string;
}

const RolesView: React.FC<RolesViewProps> = ({
  roles,
  viewType,
  ...boxProps
}) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const { selectedRole } = useData();
  const { setSelectedRole } = useDataDispatch();

  const menuOperations = [
    { key: "skin", icon: TbHanger, onClick: () => {} },
    { key: "delete", icon: LuTrash, danger: true, onClick: () => {} },
  ];

  const listItems = roles.map((role) => ({
    title: role.name,
    description:
      role.type === "offline"
        ? t("Enums.roleTypes.offline")
        : `${t("Enums.roleTypes.3rdparty")} - ${role.authServer?.name} (${role.authAccount})`,
    prefixElement: (
      <HStack spacing={2.5}>
        <Radio
          value={role.uuid}
          onClick={() => setSelectedRole(role)}
          colorScheme={primaryColor}
        />
        <Image
          boxSize="32px"
          objectFit="cover"
          src={role.avatarUrl}
          alt={role.name}
        />
      </HStack>
    ),
    children: <RoleMenu role={role} variant="buttonGroup" />,
  }));

  const gridItems = roles.map((role) => ({
    title: role.name,
    description:
      role.type === "offline"
        ? t("Enums.roleTypes.offline")
        : role.authServer?.name || "",
    imageUrl: role.avatarUrl,
    isSelected: selectedRole?.uuid === role.uuid,
    prefixElement: (
      <Radio
        value={role.uuid}
        onClick={() => {
          setSelectedRole(role);
        }}
        colorScheme={primaryColor}
      />
    ),
    children: <RoleMenu role={role} />,
  }));

  return (
    <RadioGroup value={selectedRole?.uuid}>
      {viewType === "list" ? (
        <OptionItemGroup items={listItems} {...boxProps} />
      ) : (
        <RadioCardGroup items={gridItems} {...boxProps} />
      )}
    </RadioGroup>
  );
};

export default RolesView;
