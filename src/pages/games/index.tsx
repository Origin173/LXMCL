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
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuLayoutGrid, LuLayoutList, LuPlay, LuPlus } from "react-icons/lu";
import SegmentedControl from "@/components/common/segmented";
import GamesGridView from "@/components/games-grid-view";
import GamesListView from "@/components/games-list-view";
import { useLauncherConfig } from "@/contexts/config";
import {
  GameInstanceSummary,
  mockGameInstanceSummaryList,
} from "@/models/game-instance";

const AllGames = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const viewRef = useRef<HTMLDivElement | null>(null);

  const [selectedView, setSelectedView] = useState<string>("list");
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [viewHeight, setViewHeight] = useState<string>("70vh");
  const [gameInstanceList, setGameInstanceList] = useState<
    GameInstanceSummary[]
  >([]);

  useEffect(() => {
    const updateListHeight = () => {
      if (viewRef.current) {
        const topOffset = viewRef.current.getBoundingClientRect().top;
        const newHeight = `calc(100vh - ${topOffset}px - 30px)`;
        setViewHeight(newHeight);
      }
    };

    setTimeout(() => {
      updateListHeight();
    }, 200);

    const resizeObserver = new ResizeObserver(() => {
      updateListHeight();
    });
    if (viewRef.current) {
      resizeObserver.observe(document.body);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    // TBD: only use mock data now
    setGameInstanceList(mockGameInstanceSummaryList);
  }, []);

  const viewTypeList = [
    {
      key: "list",
      icon: LuLayoutList,
      tooltip: t("GamesPage.viewTypeList.list"),
    },
    {
      key: "grid",
      icon: LuLayoutGrid,
      tooltip: t("GamesPage.viewTypeList.grid"),
    },
  ];
  return (
    <>
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
            variant={primaryColor === "gray" ? "subtle" : "outline"}
            onClick={() => {}} // todo
          >
            {t("GamesPage.Button.addAndImport")}
          </Button>
          <Button
            leftIcon={<LuPlay />}
            size="xs"
            colorScheme={primaryColor}
            isDisabled={selectedGame === ""}
            onClick={() => {}} // todo
          >
            {t("GamesPage.Button.launch")}
          </Button>
        </HStack>
      </Flex>
      <Box ref={viewRef} overflow="auto" height={viewHeight} mt="0.6rem">
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
      </Box>
    </>
  );
};

export default AllGames;
