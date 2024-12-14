import { HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { IconType } from "react-icons";
import { LuHouse } from "react-icons/lu";
import NavMenu from "@/components/common/nav-menu";
import { InstanceContext, InstanceContextProvider } from "@/contexts/instance";

const InstanceLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <InstanceContextProvider>
      <InstanceLayoutContent>{children}</InstanceLayoutContent>
    </InstanceContextProvider>
  );
};

const InstanceLayoutContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentInstanceSummary } = useContext(InstanceContext);
  const router = useRouter();
  const { t } = useTranslation();

  const instanceTabList: { key: string; icon: IconType }[] = [
    { key: "overview", icon: LuHouse },
  ];

  return (
    <VStack align="strench" spacing={2.5}>
      <Text fontWeight="bold" fontSize="sm">
        {currentInstanceSummary?.name}
      </Text>
      <NavMenu
        selectedKeys={[router.asPath]}
        onClick={(value) => router.push(value)}
        direction="row"
        size="xs"
        items={instanceTabList.map((item) => ({
          value: `/games/instance/${router.query.id}/${item.key}`,
          label: (
            <HStack spacing={1.5}>
              <Icon as={item.icon} />
              <Text fontSize="sm">
                {t(`InstanceLayout.instanceTabList.${item.key}`)}
              </Text>
            </HStack>
          ),
        }))}
      />
      {children}
    </VStack>
  );
};

export default InstanceLayout;
