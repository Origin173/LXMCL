import {
  Box,
  BoxProps,
  HStack,
  Image,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { OptionItemGroup } from "@/components/common/option-item";
import { WrapCardGroup } from "@/components/common/wrap-card";
import GameMenu from "@/components/game-menu";
import { useLauncherConfig } from "@/contexts/config";
import { useData, useDataDispatch } from "@/contexts/data";
import { GameInstanceSummary } from "@/models/game-instance";

interface GamesViewProps extends BoxProps {
  games: GameInstanceSummary[];
  viewType: string;
}

const GamesView: React.FC<GamesViewProps> = ({
  games,
  viewType,
  ...boxProps
}) => {
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const { selectedGameInstance, gameInstanceSummaryList } = useData();
  const { setSelectedGameInstance, setGameInstanceSummaryList } =
    useDataDispatch();

  const listItems = games.map((game) => ({
    title: game.name,
    description: game.description,
    prefixElement: (
      <HStack spacing={2.5}>
        <Radio
          value={game.uuid}
          onClick={() => setSelectedGameInstance(game)}
          colorScheme={primaryColor}
        />
        <Image
          boxSize="32px"
          objectFit="cover"
          src={game.iconUrl}
          alt={game.name}
        />
      </HStack>
    ),
    children: <GameMenu game={game} variant="buttonGroup" />,
  }));

  const gridItems = games.map((game) => ({
    cardContent: {
      title: game.name,
      description: game.description,
      image: game.iconUrl,
      extraContent: (
        <Box position="absolute" top={0.5} right={1}>
          <GameMenu game={game} />
        </Box>
      ),
    },
    isSelected: selectedGameInstance?.uuid === game.uuid,
    radioValue: game.uuid,
    onSelect: () => setSelectedGameInstance(game),
  }));

  return (
    <RadioGroup value={selectedGameInstance?.uuid}>
      {viewType === "list" ? (
        <OptionItemGroup items={listItems} {...boxProps} />
      ) : (
        <WrapCardGroup items={gridItems} variant="radio" {...boxProps} />
      )}
    </RadioGroup>
  );
};

export default GamesView;
