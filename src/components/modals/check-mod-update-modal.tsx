import {
  Box,
  Button,
  Checkbox,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Progress,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLauncherConfig } from "@/contexts/config";
import { ModUpdateRecord } from "@/models/resource";

interface CheckModUpdateModalProps extends Omit<ModalProps, "children"> {
  isLoading: boolean;
  updateList: ModUpdateRecord[];
  checkingUpdateIndex: number;
  totalModNum: number;
  onDownload: (
    pairs: { url: string; sha1: string; fileName: string }[]
  ) => void;
}

const CheckModUpdateModal: React.FC<CheckModUpdateModalProps> = ({
  isLoading,
  updateList,
  checkingUpdateIndex,
  totalModNum,
  onDownload,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const [selectedMods, setSelectedMods] = useState<ModUpdateRecord[]>([]);

  const headerBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const handleSelectAll = () => {
    if (selectedMods.length === updateList.length) {
      setSelectedMods([]);
    } else {
      setSelectedMods([...updateList]);
    }
  };

  const handleModToggle = (mod: ModUpdateRecord) => {
    setSelectedMods((prev) => {
      const isSelected = prev.some((m) => m.name === mod.name);
      if (isSelected) {
        return prev.filter((m) => m.name !== mod.name);
      } else {
        return [...prev, mod];
      }
    });
  };

  return (
    <Modal
      scrollBehavior="inside"
      size={{ base: "2xl", lg: "3xl", xl: "4xl" }}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent h="100%" pb={4}>
        <ModalHeader>
          <HStack w="100%" justify="flex-start" align="center">
            <Text>{t("CheckModUpdateModal.header.title")}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody
          flex="1"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {isLoading ? (
            <VStack mt={8} spacing={4}>
              <Text fontSize="md" color="gray.700">
                {t("CheckModUpdateModal.label.loading", {
                  x: checkingUpdateIndex,
                  y: totalModNum,
                })}
              </Text>
              <Progress
                value={
                  totalModNum > 0
                    ? (checkingUpdateIndex / totalModNum) * 100
                    : 0
                }
                size="md"
                colorScheme={primaryColor}
                w="80%"
                borderRadius="md"
              />
            </VStack>
          ) : updateList.length === 0 ? (
            <VStack mt={8}>
              <Text color="gray.500">
                {t("CheckModUpdateModal.label.noUpdate")}
              </Text>
            </VStack>
          ) : (
            <VStack spacing={0} align="stretch" flex="1" overflow="hidden">
              <HStack
                py={3}
                px={4}
                bg={headerBg}
                borderRadius="md"
                borderBottomRadius="none"
                border="1px"
                borderColor={borderColor}
                fontSize="sm"
                flexShrink={0}
              >
                <Checkbox
                  isChecked={
                    selectedMods.length === updateList.length &&
                    updateList.length > 0
                  }
                  isIndeterminate={
                    selectedMods.length > 0 &&
                    selectedMods.length < updateList.length
                  }
                  onChange={handleSelectAll}
                  colorScheme={primaryColor}
                />
                <Box flex="2" minW="0">
                  <Text textAlign="center">
                    {t("CheckModUpdateModal.updateList.mod")}
                  </Text>
                </Box>
                <Box flex="2" minW="0">
                  <Text textAlign="center">
                    {t("CheckModUpdateModal.updateList.currentVersion")}
                  </Text>
                </Box>
                <Box flex="3" minW="0">
                  <Text textAlign="center">
                    {t("CheckModUpdateModal.updateList.latestVersion")}
                  </Text>
                </Box>
                <Box flex="1" minW="0">
                  <Text textAlign="center">
                    {t("CheckModUpdateModal.updateList.source")}
                  </Text>
                </Box>
              </HStack>

              <Box
                flex="1"
                overflowY="auto"
                border="1px"
                borderColor={borderColor}
                borderTop="none"
                borderRadius="md"
                borderTopRadius="none"
              >
                <VStack spacing={0} align="stretch">
                  {updateList.map((mod, index) => (
                    <HStack
                      key={mod.name}
                      py={3}
                      px={4}
                      borderBottom={
                        index === updateList.length - 1 ? "none" : "1px"
                      }
                      borderColor={borderColor}
                      _hover={{ bg: hoverBg }}
                      cursor="pointer"
                      onClick={() => handleModToggle(mod)}
                    >
                      <Checkbox
                        isChecked={selectedMods.some(
                          (m) => m.name === mod.name
                        )}
                        onChange={() => handleModToggle(mod)}
                        colorScheme={primaryColor}
                      />
                      <Box flex="2" minW="0">
                        <Text
                          fontSize="xs"
                          noOfLines={1}
                          title={mod.name}
                          textAlign="center"
                        >
                          {mod.name}
                        </Text>
                      </Box>
                      <Box flex="2" minW="0">
                        <Text
                          fontSize="xs"
                          color="gray.600"
                          noOfLines={1}
                          title={mod.curVersion}
                          textAlign="center"
                        >
                          {mod.curVersion}
                        </Text>
                      </Box>
                      <Box flex="3" minW="0">
                        <Text
                          fontSize="xs"
                          color="green.500"
                          noOfLines={1}
                          title={mod.newVersion}
                          textAlign="center"
                        >
                          {mod.newVersion}
                        </Text>
                      </Box>
                      <Box flex="1" minW="0">
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          noOfLines={1}
                          title={mod.source}
                          textAlign="center"
                        >
                          {mod.source}
                        </Text>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          )}
        </ModalBody>

        {!isLoading && updateList.length > 0 && (
          <ModalFooter flexShrink={0}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={modalProps.onClose}>
                {t("CheckModUpdateModal.button.cancel")}
              </Button>
              <Button
                colorScheme={primaryColor}
                onClick={() => {
                  onDownload(
                    selectedMods.map((mod) => ({
                      url: mod.downloadUrl,
                      sha1: mod.sha1,
                      fileName: mod.fileName,
                    }))
                  );
                  modalProps.onClose?.();
                }}
                isDisabled={selectedMods.length === 0}
              >
                {t("CheckModUpdateModal.button.update")}
              </Button>
            </HStack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CheckModUpdateModal;
