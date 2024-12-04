import {
  Box,
  Button,
  Card,
  HStack,
  IconButton,
  IconButtonProps,
  Image,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { LuArrowLeftRight } from "react-icons/lu";
import { mockRoleList } from "@/models/account";
import styles from "./launch.module.css";

interface SwitchButtonProps extends IconButtonProps {
  tooltip: string;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({ tooltip, ...props }) => {
  return (
    <Tooltip label={tooltip} placement="top-end" fontSize="sm">
      <IconButton
        size="xs"
        position="absolute"
        top={1}
        right={1}
        icon={<LuArrowLeftRight />}
        {...props}
      />
    </Tooltip>
  );
};

const LaunchPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const role = mockRoleList[0]; // only for mock

  return (
    <HStack position="absolute" bottom={7} right={7} spacing={4}>
      <Card className={styles["selected-user-card"]}>
        <SwitchButton
          tooltip={t("LaunchPage.SwitchButton.tooltip.switchRole")}
          aria-label="switch-role"
          variant="subtle"
          onClick={() => router.push("/accounts")}
        />
        <HStack spacing={2.5} h="100%" w="100%">
          <Image
            boxSize="32px"
            objectFit="cover"
            src={role.avatarUrl}
            alt={role.name}
          />
          <VStack spacing={0} align="left" mt={-2}>
            <Text fontSize="sm" className="no-select" fontWeight="bold" mt={2}>
              {role.name}
            </Text>
            <Text fontSize="2xs" className="secondary-text no-select">
              {t(
                `Enums.roleTypes.${role.type === "3rdparty" ? "3rdpartyShort" : role.type}`
              )}
            </Text>
            <Text fontSize="2xs" className="secondary-text no-select">
              {role.type === "3rdparty" && role.authServer?.name}
            </Text>
          </VStack>
        </HStack>
      </Card>
      <Box position="relative">
        <Button colorScheme="blackAlpha" className={styles["launch-button"]}>
          <VStack spacing={1.5}>
            <Text fontSize="lg" fontWeight="bold">
              {t("LaunchPage.Button.launch")}
            </Text>
            <Text fontSize="sm">尚未选择游戏实例</Text>{" "}
            {/* TODO: use locales text after finish instance select logic */}
          </VStack>
        </Button>

        <SwitchButton
          tooltip={t("LaunchPage.SwitchButton.tooltip.switchGame")}
          aria-label="switch-game"
          colorScheme="blackAlpha"
          onClick={() => router.push("/games")}
        />
      </Box>
    </HStack>
  );
};

export default LaunchPage;
