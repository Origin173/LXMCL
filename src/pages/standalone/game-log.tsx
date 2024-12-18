import {
  Box,
  Button,
  Heading,
  Input,
  Select,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const GameLogPage: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<string[]>([
    "16:14:57.388 [INFO] Using default game log configuration client-1.21.2.xml",
    "16:14:59.111 [DEBUG] Datafiner optimization took 292 milliseconds",
    "16:14:52.821 [WARN] Error parsing option value 0 for option Msx framerate",
    "16:14:52.944 [ERROR] Value 0 outside of range [10:260]",
    "16:14:55.628 [INFO] OpensL initialized on device OpensL Soft",
  ]);

  const [filter, setFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const clearLogs = () => setLogs([]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const level = log.match(/\[(DEBUG|INFO|WARN|ERROR)\]/)?.[1] || "UNKNOWN";
      const matchesFilter = filter === "ALL" || level === filter;
      const matchesSearch = log
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [logs, filter, searchTerm]);

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "DEBUG":
        return "gray.500";
      case "INFO":
        return "blue.500";
      case "WARN":
        return "yellow.500";
      case "ERROR":
        return "red.500";
      default:
        return "gray.500";
    }
  };

  return (
    <Box p={6} bg={useColorModeValue("gray.50", "gray.800")} minH="100vh">
      <Heading as="h1" size="lg" mb={6}>
        {t("GameLogPage.title")}
      </Heading>

      <Box display="flex" alignItems="center" mb={4}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          w="200px"
          mr={4}
        >
          <option value="ALL">{t("all")}</option>
          <option value="DEBUG">{t("debug")}</option>
          <option value="INFO">{t("info")}</option>
          <option value="WARN">{t("warn")}</option>
          <option value="ERROR">{t("error")}</option>
        </Select>
        <Input
          type="text"
          placeholder={t("GameLogPage.placeholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          w="300px"
          mr={4}
        />
        <Button
          colorScheme="red"
          onClick={clearLogs}
          isDisabled={logs.length === 0}
        >
          {t("GameLogPage.clearLogs")}
        </Button>
      </Box>

      <Text mb={2} fontWeight="bold" color="gray.600">
        {t("GameLogPage.showingLogs", {
          count: filteredLogs.length,
          total: logs.length,
          plural: filteredLogs.length !== 1 ? "s" : "",
        })}
      </Text>

      <Box
        borderWidth="1px"
        borderRadius="md"
        p={4}
        maxH="400px"
        overflowY="auto"
        bg={useColorModeValue("white", "gray.700")}
      >
        {filteredLogs.length > 0 ? (
          <VStack align="start" spacing={2}>
            {filteredLogs.map((log, index) => {
              const level =
                log.match(/\[(DEBUG|INFO|WARN|ERROR)\]/)?.[1] || "UNKNOWN";
              const color = getLogLevelColor(level);
              return (
                <Text key={index} color={color} fontFamily="monospace">
                  {log}
                </Text>
              );
            })}
          </VStack>
        ) : (
          <Text color="gray.500">{t("GameLogPage.noLogs")}</Text>
        )}
      </Box>
    </Box>
  );
};

export default GameLogPage;
