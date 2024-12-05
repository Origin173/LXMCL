import {
  Box,
  Grid,
  GridItem,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";
import { IconType } from "react-icons";
import { LuBoxes, LuCirclePlus, LuSettings } from "react-icons/lu";
import NavMenu from "@/components/common/nav-menu";
import SelectableButton from "@/components/common/selectable-button";

interface GamesLayoutProps {
  children: React.ReactNode;
}

const GamesLayout: React.FC<GamesLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const gameInstanceTypeList: { key: string; icon: IconType }[][] = [
    [{ key: "all", icon: LuBoxes }],
  ];

  return (
    <Grid templateColumns="1fr 3fr" gap={4} h="100%">
      <GridItem className="content-full-y">
        <VStack align="stretch" h="100%" spacing={4}>
          <Box flex="1" overflowY="auto">
            {gameInstanceTypeList.map((group, index) => (
              <NavMenu
                key={index}
                selectedKeys={[router.asPath]}
                onClick={(value) => {
                  router.push(value);
                }}
                items={group.map((item) => ({
                  label: (
                    <HStack spacing={2} overflow="hidden">
                      <Icon as={item.icon} />
                      <Text fontSize="sm">
                        {t(`GamesLayout.gamesDomainList.${item.key}`)}
                      </Text>
                    </HStack>
                  ),
                  value: item.key === "all" ? "/games" : `/games/${item.key}`,
                }))}
              />
            ))}
          </Box>
          <VStack mt="auto" align="strench" spacing={0.5}>
            <SelectableButton size="sm">
              <HStack spacing={2}>
                <Icon as={LuCirclePlus} />
                <Text fontSize="sm">{t("GamesPage.Button.addAndImport")}</Text>
              </HStack>
            </SelectableButton>
            <SelectableButton
              size="sm"
              onClick={() => {
                router.push("/settings/global-game");
              }}
            >
              <HStack spacing={2}>
                <Icon as={LuSettings} />
                <Text fontSize="sm">
                  {t("GamesPage.Button.globalSettings")}
                </Text>
              </HStack>
            </SelectableButton>
          </VStack>
        </VStack>
      </GridItem>
      <GridItem className="content-full-y">{children}</GridItem>
    </Grid>
  );
};

export default GamesLayout;
