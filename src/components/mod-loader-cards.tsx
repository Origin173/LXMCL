import {
  BoxProps,
  Card,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { LuChevronRight } from "react-icons/lu";
import { useLauncherConfig } from "@/contexts/config";

interface ModLoaderCardsProps extends BoxProps {
  installedType: "none" | "Fabric" | "Forge" | "NeoForge";
  installedVersion?: string;
}

const ModLoaderCards: React.FC<ModLoaderCardsProps> = ({
  installedType,
  installedVersion,
  ...boxProps
}) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const loaderTypes = ["Fabric", "Forge", "NeoForge"];

  //for un-installed loaders
  const renderCard = (type: string) => (
    <Card key={type} className="content-card" pr={1.5}>
      <Flex justify="space-between" alignItems="center">
        <HStack spacing={2}>
          <Image
            src={`/images/icons/${type}.png`}
            alt={type}
            boxSize="28px"
            style={{ borderRadius: "4px" }}
          />
          <VStack spacing={0} alignItems="start">
            <Text fontSize="xs-sm" className="no-select">
              {type}
            </Text>
            <Text fontSize="xs" className="secondary-text no-select">
              {t("ModLoaderCards.unInstalled")}
            </Text>
          </VStack>
        </HStack>
        <IconButton
          aria-label={type}
          icon={<Icon as={LuChevronRight} boxSize={3.5} />}
          variant="ghost"
          size="xs"
        />
      </Flex>
    </Card>
  );

  return (
    <Grid
      templateColumns={
        installedType === "none" ? "repeat(3, 1fr)" : "1.35fr 1fr 1fr"
      }
      gap={3.5}
      {...boxProps}
    >
      {installedType !== "none" && (
        <Card
          className="content-card"
          pr={1.5}
          variant="outline"
          borderColor={`${primaryColor}.500`}
        >
          <Flex justify="space-between" alignItems="center">
            <HStack spacing={2}>
              <Image
                src={`/images/icons/${installedType}.png`}
                alt={installedType}
                boxSize="28px"
                style={{ borderRadius: "4px" }}
              />
              <VStack spacing={0} alignItems="start">
                <Text
                  fontSize="xs-sm"
                  fontWeight="bold"
                  className="no-select"
                  color={primaryColor}
                  mt={-0.5}
                >
                  {installedType}
                </Text>
                <HStack>
                  <Text fontSize="xs" className="secondary-text no-select">
                    {`${t("ModLoaderCards.installed")} ${installedVersion}`}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
            <IconButton
              aria-label={installedType}
              icon={<Icon as={LuChevronRight} boxSize={3.5} />}
              variant="ghost"
              size="xs"
            />
          </Flex>
        </Card>
      )}

      {loaderTypes
        .filter((type) => type !== installedType)
        .map((type) => renderCard(type))}
    </Grid>
  );
};

export default ModLoaderCards;
