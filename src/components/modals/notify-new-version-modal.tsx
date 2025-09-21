import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useLauncherConfig } from "@/contexts/config";

interface NotifyNewVersionModalProps extends Omit<ModalProps, "children"> {
  newVersion: string;
}

const NotifyNewVersionModal: React.FC<NotifyNewVersionModalProps> = ({
  newVersion,
  ...props
}) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  return (
    <Modal
      scrollBehavior="inside"
      size={{ base: "md", lg: "lg", xl: "xl" }}
      {...props}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("NotifyNewVersionModal.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{newVersion}</ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={props.onClose}>
            {t("General.cancel")}
          </Button>
          <Button variant="solid" colorScheme={primaryColor}>
            {t("General.download")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NotifyNewVersionModal;
