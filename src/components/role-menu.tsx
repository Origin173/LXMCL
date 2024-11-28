import {
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  IconButton,
  HStack,
  Text,
  Tooltip
} from "@chakra-ui/react";
import { 
  LuTrash,
  LuMoreHorizontal
} from "react-icons/lu";
import { TbHanger } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import { Role } from "@/models/account";

interface RoleMenuProps {
  role: Role,
}

const roleMenuOperations = [
  { key: "skin", icon: TbHanger },
  { key: "delete", icon: LuTrash, danger: true }
]

export const RoleMenu: React.FC<RoleMenuProps> = ({ role }) => {
  const { t } = useTranslation();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        size="xs" variant="ghost"
        aria-label="operations"
        icon={<LuMoreHorizontal />}
      />
      <MenuList>
        {roleMenuOperations.map(item => (
          <MenuItem key={item.key} fontSize="xs" color={item.danger ? "red.500" : "inherit"}>
            <HStack>
              <item.icon/>
              <Text>{t(`RoleMenu.label.${item.key}`)}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export const RoleMenuBtnGroup: React.FC<RoleMenuProps> = ({ role }) => {
  const { t } = useTranslation();
  return (
    <HStack spacing={0}>
      {roleMenuOperations.map(item => (
        <Tooltip label={t(`RoleMenu.label.${item.key}`)} fontSize="sm">
          <IconButton 
            key={item.key}
            size="sm"
            aria-label={item.key}
            icon={<item.icon />}
            variant="ghost"
            colorScheme={item.danger ? "red" : "gray"}
          />
        </Tooltip>
      ))}
    </HStack>
  )
}

export default RoleMenu;