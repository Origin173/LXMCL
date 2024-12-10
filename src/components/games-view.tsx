import { BoxProps, HStack, Image, Radio, RadioGroup } from "@chakra-ui/react";
import { LuSettings, LuTrash } from "react-icons/lu";
import { OptionItemGroup } from "@/components/common/option-item";
import { RadioCardGroup } from "@/components/common/radio-card";
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
    title: game.name,
    description: game.description,
    imageUrl: game.iconUrl,
    isSelected: selectedGameInstance?.uuid === game.uuid,
    prefixElement: (
      <Radio
        value={game.uuid}
        onClick={() => {
          setSelectedGameInstance(game);
        }}
        colorScheme={primaryColor}
      />
    ),
    children: <GameMenu game={game} />,
  }));

  return (
    <RadioGroup value={selectedGameInstance?.uuid}>
      {viewType === "list" ? (
        <OptionItemGroup items={listItems} {...boxProps} />
      ) : (
        <RadioCardGroup items={gridItems} {...boxProps} />
      )}
    </RadioGroup>
  );
};

export default GamesView;
