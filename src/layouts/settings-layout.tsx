import React, { useContext, useEffect } from "react";
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
import { LuPalette, LuInfo } from "react-icons/lu";
import NavMenu from "@/components/common/nav-menu";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const settingsDomainList = [
    { key: "appearance", icon: LuPalette },
    { key: "about", icon: LuInfo }
  ];

  return (
    <Grid templateColumns="2fr 7fr" gap={6} minW="md">
      <GridItem>
        <VStack align="stretch">
          <NavMenu
            spacing={1}
            selectedKeys={[router.asPath]}
            onClick={(value) => {
              router.push(value);
            }}
            items={settingsDomainList.map((item) => ({
              label: 
              <HStack spacing={2} overflow="hidden">
                <Icon as={item.icon}/>
                <Text fontSize="sm">{t(`SettingsLayout.settingsDomainList.${item.key}`)}</Text>
              </HStack>,
              value: `/settings/${item.key}`,
            }))}
          />
        </VStack>
      </GridItem>
      <GridItem>{children}</GridItem>
    </Grid>
  );
};

export default SettingsLayout;
