import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { LuEllipsis, LuTrash } from "react-icons/lu";
import { TbHanger } from "react-icons/tb";
import GenericConfirmDialog from "@/components/modals/generic-confirm-dialog";
import { Player } from "@/models/account";

interface PlayerMenuProps {
  player: Player;
  variant?: "dropdown" | "buttonGroup";
}

export const PlayerMenu: React.FC<PlayerMenuProps> = ({
  player,
  variant = "dropdown",
}) => {
  const { t } = useTranslation();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const handleDelete = () => {
    console.log(`Deleting player with id: ${player.id}`);
    onDeleteClose();
  };

  const playerMenuOperations = [
    {
      key: "skin",
      icon: TbHanger,
      onClick: () => {
        console.log("Skin operation clicked");
      },
    },
    {
      key: "delete",
      icon: LuTrash,
      danger: true,
      onClick: () => {
        onDeleteOpen();
      },
    },
  ];

  return (
    <>
      {variant === "dropdown" ? (
        <Menu>
          <MenuButton
            as={IconButton}
            size="xs"
            variant="ghost"
            aria-label="operations"
            icon={<LuEllipsis />}
          />
          <MenuList>
            {playerMenuOperations.map((item) => (
              <MenuItem
                key={item.key}
                fontSize="xs"
                color={item.danger ? "red.500" : "inherit"}
                onClick={item.onClick}
              >
                <HStack>
                  <item.icon />
                  <Text>{t(`PlayerMenu.label.${item.key}`)}</Text>
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      ) : (
        <HStack spacing={0}>
          {playerMenuOperations.map((item) => (
            <Tooltip
              label={t(`PlayerMenu.label.${item.key}`)}
              fontSize="sm"
              key={item.key}
            >
              <IconButton
                size="sm"
                aria-label={item.key}
                icon={<item.icon />}
                variant="ghost"
                colorScheme={item.danger ? "red" : "gray"}
                onClick={item.onClick}
              />
            </Tooltip>
          ))}
        </HStack>
      )}

      <GenericConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title={t("DeletePlayerAlertDialog.dialog.title")}
        body={t("DeletePlayerAlertDialog.dialog.content", {
          name: player.name,
        })}
        btnOK={t("GenericConfirmModal.Button.delete")}
        btnCancel={t("GenericConfirmModal.Button.cancel")}
        onOKCallback={() => {
          handleDelete();
        }}
        isAlert
      />
    </>
  );
};

export default PlayerMenu;
