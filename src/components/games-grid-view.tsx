import {
  Box,
  BoxProps,
  Card,
  Image,
  Radio,
  RadioGroup,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useLauncherConfig } from "@/contexts/config";
import { GameInstanceSummary } from "@/models/game-instance-summary";
import GameMenu from "./game-menu";

interface GameCardProps {
  game: GameInstanceSummary;
  isSelected: boolean;
}

interface GamesGridProps extends BoxProps {
  games: GameInstanceSummary[];
  selectedGame: string;
  setSelectedGame: (gameId: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, isSelected }) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  return (
    <Card
      className="content-card"
      w="10.55rem"
      borderColor={`${primaryColor}.500`}
      variant={isSelected ? "outline" : "elevated"}
    >
      <Box position="absolute" top={2} left={2}>
        <Radio value={game.uuid} colorScheme={primaryColor} />
      </Box>
      <Box position="absolute" top={0.5} right={1}>
        <GameMenu game={game} />
      </Box>
      <VStack spacing={0}>
        <Image
          boxSize="36px"
          objectFit="cover"
          src={game.iconUrl}
          alt={game.name}
        />
        <Text
          fontSize="xs-sm"
          className="no-select"
          fontWeight={isSelected ? "bold" : "normal"}
          mt={2}
        >
          {game.name}
        </Text>
        <Text fontSize="xs" className="secondary-text no-select ellipsis-text">
          {game.description}
        </Text>
      </VStack>
    </Card>
  );
};

const GamesGridView: React.FC<GamesGridProps> = ({
  games,
  selectedGame,
  setSelectedGame,
  ...boxProps
}) => {
  return (
    <RadioGroup onChange={setSelectedGame} value={selectedGame}>
      <Wrap spacing={3.5} {...boxProps}>
        {games.map((game, index) => (
          <WrapItem key={game.id}>
            <GameCard game={game} isSelected={selectedGame === game.uuid} />
            {/* TBD: only mock */}
          </WrapItem>
        ))}
      </Wrap>
    </RadioGroup>
  );
};

export default GamesGridView;
