import React from "react";
import { 
  Grid, 
  GridItem, 
  VStack, 
  Icon, 
  HStack,
  Text
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { 
  LuGamepad2,
  LuSettings,
  LuPalette,
  LuDownloadCloud,
  LuHelpCircle,
  LuInfo,
  LuFlaskConical
} from "react-icons/lu";
import NavMenu from "@/components/common/nav-menu";
import { isDev } from "@/utils/env";
import { IconType } from "react-icons";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const settingsDomainList: { key: string; icon: IconType }[][] = [
    [{ key: "global-game", icon: LuGamepad2 }],
    [
      { key: "general", icon: LuSettings },
      { key: "appearance", icon: LuPalette },
      { key: "download", icon: LuDownloadCloud },
      { key: "help", icon: LuHelpCircle },
      { key: "about", icon: LuInfo },
    ],
    ...(isDev ? [[{ key: "dev-test", icon: LuFlaskConical }]] : [])
  ];

  return (
    <Grid templateColumns="1fr 3fr" gap={4} h="100%">
      <GridItem className="content-full-y">
        <VStack align="stretch" spacing={3.5}>
          {settingsDomainList.map((group, index) => (
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
                      {t(`SettingsLayout.settingsDomainList.${item.key}`)}
                    </Text>
                  </HStack>
                ),
                value: `/settings/${item.key}`,
              }))}
            />
          ))}
        </VStack>
      </GridItem>
      <GridItem className="content-full-y">{children}</GridItem>
    </Grid>
  );
};

export default SettingsLayout;
