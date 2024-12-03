import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { LuMoreHorizontal, LuSettings, LuTrash } from "react-icons/lu";
import { GameInstanceSummary } from "@/models/game-instance";

interface GameMenuProps {
  game: GameInstanceSummary;
}

const gameMenuOperations = [
  { key: "settings", icon: LuSettings },
  { key: "delete", icon: LuTrash, danger: true },
];

export const GameMenu: React.FC<GameMenuProps> = ({ game }) => {
  const { t } = useTranslation();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        size="xs"
        variant="ghost"
        aria-label="operations"
        icon={<LuMoreHorizontal />}
      />
      <MenuList>
        {gameMenuOperations.map((item) => (
          <MenuItem
            key={item.key}
            fontSize="xs"
            color={item.danger ? "red.500" : "inherit"}
          >
            <HStack>
              <item.icon />
              <Text>{t(`GameMenu.label.${item.key}`)}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export const GameMenuBtnGroup: React.FC<GameMenuProps> = ({ game }) => {
  const { t } = useTranslation();
  return (
    <HStack spacing={0}>
      {gameMenuOperations.map((item) => (
        <Tooltip
          label={t(`GameMenu.label.${item.key}`)}
          fontSize="sm"
          key={item.key}
        >
          <IconButton
            size="sm"
            aria-label={item.key}
            icon={<item.icon />}
            variant="ghost"
            colorScheme={item.danger ? "red" : "gray"}
          />
        </Tooltip>
      ))}
    </HStack>
  );
};

export default GameMenu;
