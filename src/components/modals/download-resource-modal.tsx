import {
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconType } from "react-icons";
import { LuEarth, LuHaze, LuPackage, LuSquareLibrary } from "react-icons/lu";
import NavMenu from "@/components/common/nav-menu";
import ResourceDownload from "../resource-download";

export const DownloadResourceModal: React.FC<Omit<ModalProps, "children">> = ({
  ...modalProps
}) => {
  const { t } = useTranslation();

  const [selectedResourceType, setSelectedResourceType] =
    useState<string>("mod");

  const resourceTypeList: { key: string; icon: IconType }[] = [
    { key: "mod", icon: LuSquareLibrary },
    { key: "world", icon: LuEarth },
    { key: "resourcepack", icon: LuPackage },
    { key: "shaderpack", icon: LuHaze },
  ];

  return (
    <Modal
      scrollBehavior="inside"
      size={{ base: "2xl", lg: "3xl", xl: "4xl" }}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("DownloadResourceModal.header.title")}</ModalHeader>
        <ModalCloseButton />
        <Flex h="60vh" flexDir="column">
          <ModalBody>
            <Center>
              <NavMenu
                className="no-scrollbar"
                overflowX="auto"
                selectedKeys={[selectedResourceType]}
                onClick={(value) => setSelectedResourceType(value)}
                direction="row"
                size="xs"
                spacing={2}
                mt={-2}
                mb={2}
                items={resourceTypeList.map((item) => ({
                  value: item.key,
                  label: (
                    <HStack spacing={1.5} fontSize="sm">
                      <Icon as={item.icon} />
                      <Text>
                        {t(
                          `DownloadResourceModal.resourceTypeList.${item.key}`
                        )}
                      </Text>
                    </HStack>
                  ),
                }))}
              />
            </Center>
            <ResourceDownload
              key={selectedResourceType}
              resourceType={selectedResourceType}
            />
          </ModalBody>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default DownloadResourceModal;
