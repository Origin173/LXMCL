import {
  Box,
  BoxProps,
  HStack,
  Image,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { OptionItemGroup } from "@/components/common/option-item";
import { WrapCardGroup } from "@/components/common/wrap-card";
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
    cardContent: {
      title: role.name,
      description:
        role.type === "offline"
          ? t("Enums.roleTypes.offline")
          : role.authServer?.name || "",
      image: role.avatarUrl,
      extraContent: (
        <Box position="absolute" top={0.5} right={1}>
          <RoleMenu role={role} />
        </Box>
      ),
    },
    isSelected: selectedRole?.uuid === role.uuid,
    onSelect: () => setSelectedRole(role),
    radioValue: role.uuid,
  }));

  return (
    <RadioGroup value={selectedRole?.uuid}>
      {viewType === "list" ? (
        <OptionItemGroup items={listItems} {...boxProps} />
      ) : (
        <WrapCardGroup items={gridItems} variant="radio" {...boxProps} />
      )}
    </RadioGroup>
  );
};

export default RolesView;
