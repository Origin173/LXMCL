import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { LuLayoutGrid, LuLayoutList, LuPlay, LuPlus } from "react-icons/lu";
import SegmentedControl from "@/components/common/segmented";
import GamesView from "@/components/games-view";
import { useLauncherConfig } from "@/contexts/config";
import { useData } from "@/contexts/data";

const AllGames = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { config, update } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const selectedViewType = config.page.games.viewType;

  const { selectedGameInstance, gameInstanceSummaryList } = useData();

  const viewTypeList = [
    {
      key: "grid",
      icon: LuLayoutGrid,
      tooltip: t("GamesPage.viewTypeList.grid"),
    },
    {
      key: "list",
      icon: LuLayoutList,
      tooltip: t("GamesPage.viewTypeList.list"),
    },
  ];
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Flex alignItems="flex-start" flexShrink={0}>
        <VStack spacing={0} align="start">
          <Text fontWeight="bold" fontSize="sm" className="no-select">
            {t("GamesLayout.gamesDomainList.game")}
          </Text>
        </VStack>
        <HStack spacing={2} ml="auto" alignItems="flex-start">
          <SegmentedControl
            selected={selectedViewType}
            onSelectItem={(s) => {
              update("page.games.viewType", s as string);
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
            variant={primaryColor === "gray" ? "subtle" : "outline"}
            onClick={() => {}} // todo
          >
            {t("GamesPage.Button.addAndImport")}
          </Button>
          <Button
            leftIcon={<LuPlay />}
            size="xs"
            colorScheme={primaryColor}
            isDisabled={!selectedGameInstance}
            onClick={() => {}} // todo
          >
            {t("GamesPage.Button.launch")}
          </Button>
        </HStack>
      </Flex>
      <Box overflow="auto" flexGrow={1} mt={2.5}>
        <GamesView
          games={gameInstanceSummaryList}
          viewType={selectedViewType}
        />
      </Box>
    </Box>
  );
};

export default AllGames;
