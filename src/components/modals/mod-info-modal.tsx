import {
  Avatar,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Tag,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuExternalLink } from "react-icons/lu";
import { OptionItem } from "@/components/common/option-item";
import { useLauncherConfig } from "@/contexts/config";
import { useToast } from "@/contexts/toast";
import { ModLoaderType } from "@/enums/instance";
import { OtherResourceType } from "@/enums/resource";
import { LocalModInfo } from "@/models/instance/misc";
import { ResourceService } from "@/services/resource";
import { base64ImgSrc } from "@/utils/string";
import DownloadSpecificResourceModal from "./download-specific-resource-modal";

interface ModInfoModalProps extends Omit<ModalProps, "children"> {
  mod: LocalModInfo;
}

const ModInfoModal: React.FC<ModInfoModalProps> = ({ mod, ...modalProps }) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const toast = useToast();
  const primaryColor = config.appearance.theme.primaryColor;

  const [cfRemoteModId, setCfRemoteModId] = useState<string | null>(null);
  const [mrRemoteModId, setMrRemoteModId] = useState<string | null>(null);

  const {
    onOpen: onCfDownloadModalOpen,
    isOpen: isCfDownloadModalOpen,
    onClose: onCfDownloadModalClose,
  } = useDisclosure();

  const {
    onOpen: onMrDownloadModalOpen,
    isOpen: isMrDownloadModalOpen,
    onClose: onMrDownloadModalClose,
  } = useDisclosure();

  const handleCloseModal = () => {
    modalProps.onClose();
    setCfRemoteModId(null);
    setMrRemoteModId(null);
  };

  const handleCurseForgeInfo = useCallback(async () => {
    ResourceService.getRemoteResourceByFile("CurseForge", mod.filePath).then(
      (response) => {
        if (response.status === "success") {
          const modId = response.data.resourceId;
          setCfRemoteModId(modId);
        } else {
          toast({
            title: response.message,
            description: response.details,
            status: "error",
          });
        }
      }
    );
  }, [mod.filePath, toast, setCfRemoteModId]);

  const handleModrinthInfo = useCallback(async () => {
    ResourceService.getRemoteResourceByFile("Modrinth", mod.filePath).then(
      (response) => {
        if (response.status === "success") {
          const modId = response.data.resourceId;
          setMrRemoteModId(modId);
        } else {
          toast({
            title: response.message,
            description: response.details,
            status: "error",
          });
        }
      }
    );
  }, [mod.filePath, toast, setMrRemoteModId]);

  useEffect(() => {
    handleCurseForgeInfo();
    handleModrinthInfo();
  }, [handleCurseForgeInfo, handleModrinthInfo]);

  return (
    <Modal size={{ base: "lg", lg: "xl", xl: "2xl" }} {...modalProps}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader></ModalHeader>

        <ModalBody>
          <OptionItem
            title={
              <Text fontWeight="bold" fontSize="lg">
                {mod.translatedName
                  ? `${mod.translatedName} | ${mod.name}`
                  : mod.name || mod.fileName}
              </Text>
            }
            titleExtra={
              <HStack>
                {mod.version && (
                  <Text className="secondary-text">{mod.version}</Text>
                )}
                {mod.loaderType !== ModLoaderType.Unknown && (
                  <Tag colorScheme={primaryColor} className="tag-sm">
                    {mod.loaderType}
                  </Tag>
                )}
              </HStack>
            }
            description={
              <Text fontSize="xs-sm" className="secondary-text">
                {mod.fileName}
              </Text>
            }
            prefixElement={
              <Avatar
                src={base64ImgSrc(mod.iconSrc)}
                name={mod.name || mod.fileName}
                boxSize="48px"
                borderRadius="4px"
                style={{
                  filter: mod.enabled ? "none" : "grayscale(90%)",
                  opacity: mod.enabled ? 1 : 0.5,
                }}
              ></Avatar>
            }
          ></OptionItem>
          <Text fontSize="xs-sm" mt={4}>
            {mod.description}
          </Text>
        </ModalBody>

        <ModalFooter mt={1}>
          <HStack spacing={1}>
            <LuExternalLink />
            <Button
              colorScheme={primaryColor}
              onClick={() => {
                onCfDownloadModalOpen();
              }}
              fontSize="sm"
              variant="link"
              disabled={!cfRemoteModId}
            >
              CurseForge
            </Button>
          </HStack>
          <HStack spacing={1}>
            <LuExternalLink />
            <Button
              colorScheme={primaryColor}
              onClick={() => {
                onMrDownloadModalOpen();
              }}
              fontSize="sm"
              variant="link"
              disabled={!mrRemoteModId}
            >
              Modrinth
            </Button>
          </HStack>
          <Button
            colorScheme={primaryColor}
            onClick={handleCloseModal}
            fontSize="sm"
            variant="ghost"
          >
            {t("General.confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
      {cfRemoteModId && (
        <DownloadSpecificResourceModal
          isOpen={isCfDownloadModalOpen}
          onClose={onCfDownloadModalClose}
          resource={{
            id: cfRemoteModId,
            websiteUrl: "",
            type: OtherResourceType.Mod,
            name: mod.name,
            translatedName: mod.translatedName,
            description: mod.description || "",
            iconSrc: base64ImgSrc(mod.iconSrc),
            tags: [],
            lastUpdated: "",
            downloads: 0,
            source: "CurseForge",
          }}
          curInstanceMajorVersion={undefined}
          curInstanceModLoader={mod.loaderType}
        />
      )}
      {mrRemoteModId && (
        <DownloadSpecificResourceModal
          isOpen={isMrDownloadModalOpen}
          onClose={onMrDownloadModalClose}
          resource={{
            id: mrRemoteModId,
            websiteUrl: "",
            type: OtherResourceType.Mod,
            name: mod.name,
            translatedName: mod.translatedName,
            description: mod.description || "",
            iconSrc: base64ImgSrc(mod.iconSrc),
            tags: [],
            lastUpdated: "",
            downloads: 0,
            source: "Modrinth",
          }}
          curInstanceMajorVersion={undefined}
          curInstanceModLoader={mod.loaderType}
        />
      )}
    </Modal>
  );
};

export default ModInfoModal;
