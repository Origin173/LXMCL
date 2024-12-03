import {
  Button,
  Flex,
  GridItem,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuLayoutGrid, LuLayoutList, LuPlus } from "react-icons/lu";
import SegmentedControl from "@/components/common/segmented";
import GamesGridView from "@/components/games-grid-view";
import GamesListView from "@/components/games-list-view";
import { useLauncherConfig } from "@/contexts/config";
import {
  GameInstanceSummary,
  mockGameInstanceSummaryList,
} from "@/models/game-instance-summary";

const AllGames = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const [selectedView, setSelectedView] = useState<string>("grid");
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [gameInstanceList, setGameInstanceList] = useState<
    GameInstanceSummary[]
  >([]);

  useEffect(() => {
    // TBD: only use mock data now
    setGameInstanceList(mockGameInstanceSummaryList);
  }, []);

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
    <GridItem className="content-full-y">
      <Flex alignItems="flex-start">
        <VStack spacing={0} align="start">
          <Text fontWeight="bold" fontSize="sm" className="no-select">
            {t("GamesLayout.gamesDomainList.all")}
          </Text>
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
            variant={primaryColor === "gray" ? "darkGray" : "solid"}
            onClick={() => {}} // todo
          >
            {t("GamesPage.Button.addAndImport")}
          </Button>
          <Button
            size="xs"
            colorScheme={primaryColor}
            variant={primaryColor === "gray" ? "darkGray" : "solid"}
            isDisabled={selectedGame === ""}
            onClick={() => {}} // todo
          >
            {t("GamesPage.Button.launch")}
          </Button>
        </HStack>
      </Flex>
      {selectedView === "grid" && (
        <GamesGridView
          games={gameInstanceList}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          mt={2.5}
        />
      )}
      {selectedView === "list" && (
        <GamesListView
          games={gameInstanceList}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          mt={2.5}
        />
      )}
    </GridItem>
  );
};

export default AllGames;
