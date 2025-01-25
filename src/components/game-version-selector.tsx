import {
  Box,
  BoxProps,
  Center,
  Checkbox,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Radio,
  RadioGroup,
  Tag,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { LuEarth, LuRefreshCcw } from "react-icons/lu";
import { BeatLoader } from "react-spinners";
import CountTag from "@/components/common/count-tag";
import Empty from "@/components/common/empty";
import {
  OptionItemGroup,
  OptionItemProps,
} from "@/components/common/option-item";
import { Section } from "@/components/common/section";
import { useLauncherConfig } from "@/contexts/config";
import { GameResourceInfo } from "@/models/resource";
import { ISOToDatetime } from "@/utils/datetime";

interface GameVersionSelectorProps extends BoxProps {
  selectedVersion: GameResourceInfo | undefined;
  onVersionSelect: (version: GameResourceInfo) => void;
}

const GameVersionSelector: React.FC<GameVersionSelectorProps> = ({
  selectedVersion,
  onVersionSelect,
  ...props
}) => {
  const { t } = useTranslation();
  const { config, update } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const gameTypes: Record<string, string> = useMemo(() => {
    return {
      release: "GrassBlock.webp",
      snapshot: "CommandBlock.webp",
      old_beta: "StoneOldBeta.webp",
    };
  }, []);

  const [versions, setVersions] = useState<GameResourceInfo[]>([]);
  const [counts, setCounts] = useState<Map<string, number>>();
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(config.states.gameVersionSelector.gameTypes)
  );

  const defferedVersions = useDeferredValue(versions);
  const defferedCounts = useDeferredValue(counts);

  const loading = versions !== defferedVersions;

  // @TODO: move this logic to backend and get data by invoke
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        "https://launchermeta.mojang.com/mc/game/version_manifest.json"
      );
      const data = await response.json();

      const versionData = data.versions as GameResourceInfo[];

      const newCounts = new Map<string, number>();
      versionData.forEach((version: GameResourceInfo) => {
        let oldCount = newCounts.get(version.type) || 0;
        newCounts.set(version.type, oldCount + 1);
      });
      setCounts(newCounts);

      setVersions(
        versionData.filter((version: GameResourceInfo) =>
          selectedTypes.has(version.type)
        )
      );
    } catch (error) {
      console.error("Error fetching versions:", error);
    }
  }, [selectedTypes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTypeToggle = useCallback(
    (type: string) => {
      setSelectedTypes((prevSelectedTypes) => {
        const newSelectedTypes = new Set(prevSelectedTypes);
        if (newSelectedTypes.has(type)) {
          newSelectedTypes.delete(type);
        } else {
          newSelectedTypes.add(type);
        }
        update(
          "states.gameVersionSelector.gameTypes",
          Array.from(newSelectedTypes)
        );
        return newSelectedTypes;
      });
    },
    [update]
  );

  const buildOptionItems = (version: GameResourceInfo): OptionItemProps => ({
    title: version.id,
    description: ISOToDatetime(version.releaseTime),
    prefixElement: (
      <HStack spacing={2.5}>
        <Radio value={version.id} colorScheme={primaryColor} />
        <Image
          src={`/images/icons/${gameTypes[version.type]}`}
          alt={version.type}
          boxSize="28px"
          borderRadius="4px"
        />
      </HStack>
    ),
    titleExtra: (
      <Tag colorScheme={primaryColor} className="tag-xs">
        {t(`GameVersionSelector.${version.type}`)}
      </Tag>
    ),
    children: (
      <Tooltip label={t("GameVersionSelector.viewOnWiki")}>
        <IconButton
          size="sm"
          aria-label="viewOnWiki"
          icon={<LuEarth />}
          variant="ghost"
          onClick={() => open(`https://zh.minecraft.wiki/w/${version.id}`)}
        />
      </Tooltip>
    ),
  });

  const typeTogglers = useMemo(() => {
    return (
      <HStack spacing={4}>
        {Object.keys(gameTypes).map((type) => (
          <Checkbox
            key={type}
            isChecked={selectedTypes.has(type)}
            onChange={() => handleTypeToggle(type)}
            colorScheme={primaryColor}
            borderColor="gray.400"
          >
            <HStack spacing={2} alignItems="center">
              <Text fontWeight="bold" fontSize="sm" className="no-select">
                {t(`GameVersionSelector.${type}`)}
              </Text>
              <CountTag
                count={defferedCounts ? defferedCounts.get(type) || 0 : 0}
              />
            </HStack>
          </Checkbox>
        ))}
      </HStack>
    );
  }, [
    defferedCounts,
    gameTypes,
    handleTypeToggle,
    primaryColor,
    selectedTypes,
    t,
  ]);

  const onVersionIdSelect = useCallback(
    (versionId: string) => {
      let versions = defferedVersions.filter((v) => v.id === versionId);
      if (versions.length > 0) onVersionSelect(versions[0]);
    },
    [defferedVersions, onVersionSelect]
  );

  return (
    <Box {...props} overflow="hidden" width="100%" height="100%">
      <Flex justifyContent="space-between" flexShrink={0} padding={1}>
        {typeTogglers}
        <IconButton
          aria-label="refresh"
          icon={<Icon as={LuRefreshCcw} boxSize={3.5} />}
          onClick={fetchData}
          size="sm"
          h={21}
          variant="ghost"
          colorScheme="gray"
        />
      </Flex>
      <Section overflow="auto" flexGrow={1} height="100%">
        {loading ? (
          <Center>
            <BeatLoader size={16} color="gray" />
          </Center>
        ) : selectedTypes.size === 0 ? (
          <Empty withIcon={false} size="sm" />
        ) : (
          <RadioGroup
            value={selectedVersion?.id || ""}
            onChange={onVersionIdSelect}
          >
            <OptionItemGroup items={defferedVersions.map(buildOptionItems)} />
          </RadioGroup>
        )}
      </Section>
    </Box>
  );
};

export default GameVersionSelector;
