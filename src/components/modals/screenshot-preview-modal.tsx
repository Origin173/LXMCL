import {
  Flex,
  HStack,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  ModalProps,
  Text,
} from "@chakra-ui/react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import React from "react";
import { LuCalendarDays } from "react-icons/lu";
import { CommonIconButton } from "@/components/common/common-icon-button";
import { ScreenshotInfo } from "@/models/game-instance";
import { UNIXToDatetime } from "@/utils/datetime";
import { extractFileName } from "@/utils/string";

interface ScreenshotPreviewModalProps extends Omit<ModalProps, "children"> {
  screenshot: ScreenshotInfo;
}

const ScreenshotPreviewModal: React.FC<ScreenshotPreviewModalProps> = ({
  screenshot,
  ...props
}) => {
  return (
    <Modal size={{ base: "lg", lg: "2xl", xl: "4xl" }} {...props}>
      <ModalOverlay />
      <ModalContent>
        <Image
          src={convertFileSrc(screenshot.filePath)}
          alt={screenshot.fileName}
          borderRadius="md"
          objectFit="cover"
        />
        <ModalCloseButton />
        <ModalBody>
          <Flex justify="space-between" align="center" mt={-1}>
            <Text fontSize="sm" fontWeight="bold">
              {extractFileName(screenshot.fileName)}
            </Text>
            <HStack spacing={2}>
              <Icon as={LuCalendarDays} color="gray.500" />
              <Text fontSize="xs" className="secondary-text">
                {UNIXToDatetime(screenshot.time)}
              </Text>
              <CommonIconButton
                icon="revealFile"
                tooltipPlacement="top"
                variant="ghost"
                onClick={() => {
                  revealItemInDir(screenshot.filePath);
                }}
              />
            </HStack>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ScreenshotPreviewModal;
