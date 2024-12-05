import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LuCirclePlus,
  LuLayoutGrid,
  LuLayoutList,
  LuLink2Off,
  LuPlus,
  LuServer,
  LuUsersRound,
} from "react-icons/lu";
import NavMenu from "@/components/common/nav-menu";
import SegmentedControl from "@/components/common/segmented";
import SelectableButton from "@/components/common/selectable-button";
import RolesGridView from "@/components/roles-grid-view";
import RolesListView from "@/components/roles-list-view";
import { useLauncherConfig } from "@/contexts/config";
import {
  AuthServer,
  Role,
  mockAuthServerList,
  mockRoleList,
} from "@/models/account";

const AccountsPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const [authServerList, setAuthServerList] = useState<AuthServer[]>([]);
  const [selectedRoleType, setSelectedRoleType] = useState<string>("all");
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [selectedView, setSelectedView] = useState<string>("grid");

  useEffect(() => {
    // TBD: only use mock data now
    setAuthServerList(mockAuthServerList);
    setRoleList(mockRoleList);
  }, []);

  const roleTypeList = [
    {
      key: "all",
      icon: LuUsersRound,
      label: t("AccountsPage.roleTypeList.all"),
    },
    { key: "offline", icon: LuLink2Off, label: t("Enums.roleTypes.offline") },
    ...authServerList.map((server) => ({
      key: server.authUrl,
      icon: LuServer,
      label: server.name,
    })),
  ];

  const viewTypeList = [
    {
      key: "grid",
      icon: LuLayoutGrid,
      tooltip: t("AccountsPage.viewTypeList.grid"),
    },
    {
      key: "list",
      icon: LuLayoutList,
      tooltip: t("AccountsPage.viewTypeList.list"),
    },
  ];

  const filterRolesByType = (type: string) => {
    if (type === "all") {
      return roleList;
    } else if (type === "offline") {
      return roleList.filter((role) => role.type === "offline");
    } else {
      return roleList.filter(
        (role) =>
          role.type === "3rdparty" &&
          authServerList.find((server) => server.authUrl === type)?.authUrl ===
            role.authServer?.authUrl
      );
    }
  };

  return (
    <Grid templateColumns="1fr 3fr" gap={4} h="100%">
      <GridItem className="content-full-y">
        <VStack align="stretch" h="100%">
          <Box flex="1" overflowY="auto">
            <NavMenu
              selectedKeys={[selectedRoleType]}
              onClick={(value) => {
                setSelectedRoleType(value);
              }}
              items={roleTypeList.map((item) => ({
                label: (
                  <HStack spacing={2} overflow="hidden">
                    <Icon as={item.icon} />
                    <Text fontSize="sm">{item.label}</Text>
                  </HStack>
                ),
                value: item.key,
              }))}
            />
          </Box>
          <SelectableButton mt="auto" size="sm">
            <HStack spacing={2}>
              <Icon as={LuCirclePlus} />
              <Text fontSize="sm">
                {t("AccountsPage.Button.add3rdPartySource")}
              </Text>
            </HStack>
          </SelectableButton>
        </VStack>
      </GridItem>
      <GridItem className="content-full-y">
        <Box display="flex" flexDirection="column" height="100%">
          <Flex alignItems="flex-start" flexShrink={0}>
            <VStack spacing={0} align="start">
              <Text fontWeight="bold" fontSize="sm" className="no-select">
                {
                  roleTypeList.find((item) => item.key === selectedRoleType)
                    ?.label
                }
              </Text>
              {!["all", "offline"].includes(selectedRoleType) && (
                <Text fontSize="xs" className="secondary-text no-select">
                  {selectedRoleType}
                </Text>
              )}
            </VStack>
            <HStack spacing={2} ml="auto" alignItems="flex-start">
              <SegmentedControl
                selected={selectedView}
                onSelectItem={(s) => {
                  setSelectedView(s);
                }}
                size="2xs"
                items={viewTypeList.map((item) => ({
                  ...item,
                  label: item.key,
                  value: <Icon as={item.icon} />,
                }))}
                withTooltip={true}
              />
              <Button
                leftIcon={<LuPlus />}
                size="xs"
                colorScheme={primaryColor}
                onClick={() => {}} // todo
              >
                {t("AccountsPage.Button.addRole")}
              </Button>
            </HStack>
          </Flex>
          <Box overflow="auto" flexGrow={1} mt={2.5}>
            {selectedView === "grid" && (
              <RolesGridView roles={filterRolesByType(selectedRoleType)} />
            )}
            {selectedView === "list" && (
              <RolesListView roles={filterRolesByType(selectedRoleType)} />
            )}
          </Box>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default AccountsPage;
