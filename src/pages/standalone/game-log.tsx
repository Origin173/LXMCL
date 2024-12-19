import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Spacer,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuFileInput, LuTrash } from "react-icons/lu";
import styles from "../../styles/game-log.module.css";

const GameLogPage: React.FC = () => {
  const { t } = useTranslation();

  const [logs, setLogs] = useState<string[]>([
    "16:14:57.388 [INFO] Using default game log configuration client-1.21.2.xml",
    "16:14:59.111 [DEBUG] Datafiner optimization took 292 milliseconds",
    "16:14:52.821 [WARN] Error parsing option value 0 for option Msx framerate",
    "16:14:52.944 [ERROR] Value 0 outside of range [10:260]",
    "16:14:55.628 [INFO] OpensL initialized on device OpensL Soft",
    "16:14:55.628 [INFO] Another info log",
    "16:14:55.628 [DEBUG] Debugging log",
    "16:14:55.628 [WARN] Warning log",
    "16:14:55.628 [ERROR] Error log",
    "16:14:55.628 [FATAL] Fatal error occurred",
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStates, setFilterStates] = useState<{ [key: string]: boolean }>({
    FATAL: true,
    ERROR: true,
    WARN: true,
    INFO: true,
    DEBUG: true,
  });

  const clearLogs = () => setLogs([]);

  const filteredLogs = logs.filter((log) => {
    const level = log.split(" ")[1].slice(1, -1);
    return (
      filterStates[level] &&
      log.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case "FATAL":
        return `${styles.logText} ${styles.fatal}`;
      case "ERROR":
        return `${styles.logText} ${styles.error}`;
      case "WARN":
        return `${styles.logText} ${styles.warn}`;
      case "INFO":
        return `${styles.logText} ${styles.info}`;
      case "DEBUG":
        return `${styles.logText} ${styles.debug}`;
      default:
        return styles.logText;
    }
  };

  const toggleFilter = (level: string) =>
    setFilterStates({ ...filterStates, [level]: !filterStates[level] });

  const logCounts = logs.reduce<{ [key: string]: number }>((acc, log) => {
    const level = log.split(" ")[1].slice(1, -1);
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box
      p={4}
      bg={useColorModeValue("gray.50", "gray.800")}
      minH="100vh"
      display="flex"
      flexDirection="column"
    >
      <Flex alignItems="center" mb={4}>
        <Input
          type="text"
          placeholder={t("GameLogPage.placeholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          w="200px"
          mr={4}
        />
        <Spacer />
        {["FATAL", "ERROR", "WARN", "INFO", "DEBUG"].map((level) => (
          <Button
            key={level}
            size="xs"
            variant={filterStates[level] ? "solid" : "subtle"}
            onClick={() => toggleFilter(level)}
            mr={2}
            colorScheme={
              level === "FATAL"
                ? "red"
                : level === "ERROR"
                  ? "orange"
                  : level === "WARN"
                    ? "yellow"
                    : "gray"
            }
          >
            {level} ({logCounts[level] || 0})
          </Button>
        ))}
        <Tooltip label={t("GameLogPage.exportLogs")} placement="bottom">
          <IconButton
            icon={<LuFileInput />}
            aria-label={t("GameLogPage.exportLogs")}
            variant="ghost"
            size="sm"
            colorScheme="gray"
            isDisabled
          />
        </Tooltip>
        <Tooltip label={t("GameLogPage.clearLogs")} placement="bottom">
          <IconButton
            icon={<LuTrash />}
            aria-label={t("GameLogPage.clearLogs")}
            variant="ghost"
            size="sm"
            colorScheme="gray"
            onClick={clearLogs}
          />
        </Tooltip>
      </Flex>

      <Box
        borderWidth="1px"
        borderRadius="md"
        p={4}
        flex="1"
        overflowY="auto"
        bg={useColorModeValue("white", "gray.700")}
      >
        {filteredLogs.length > 0 ? (
          <VStack align="start" spacing={1}>
            {filteredLogs.map((log, index) => {
              const level = log.split(" ")[1].slice(1, -1);
              return (
                <Text key={index} className={getLogLevelClass(level)}>
                  {log}
                </Text>
              );
            })}
          </VStack>
        ) : (
          <Text color="gray.500" fontSize="xs">
            {t("GameLogPage.noLogs")}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default GameLogPage;
