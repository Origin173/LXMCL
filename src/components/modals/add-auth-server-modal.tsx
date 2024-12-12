import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLauncherConfig } from "@/contexts/config";
import { useData, useDataDispatch } from "@/contexts/data";
import { useToast as useCustomToast } from "@/contexts/toast";
import { AuthServer } from "@/models/account";

interface AddAuthServerModalProps extends Omit<ModalProps, "children"> {}

const AddAuthServerModal: React.FC<AddAuthServerModalProps> = ({
  isOpen,
  onClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { authServerList } = useData();
  const { setAuthServerList } = useDataDispatch();
  const toast = useCustomToast();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const [serverUrl, setServerUrl] = useState<string>("");
  const [serverName] = useState<string>("XXXXXXXX");
  const [isNextStep, setIsNextStep] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isServerUrlTouched, setIsServerUrlTouched] = useState(false);
  const isServerUrlInvalid = isServerUrlTouched && !serverUrl;

  useEffect(() => {
    if (isOpen) {
      setIsNextStep(false);
      setServerUrl("");
      setIsServerUrlTouched(false);
    }
  }, [isOpen]);

  const handleNextStep = () => {
    if (!serverUrl) {
      toast({
        title: t("AddAuthServerModal.toast.invalidServerUrl"),
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const isDuplicate = authServerList.some(
      (server) => server.authUrl === serverUrl
    );
    if (isDuplicate) {
      toast({
        title: t("AddAuthServerModal.toast.duplicateServer"),
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsNextStep(true);
  };

  const handleFinish = () => {
    if (!serverUrl) {
      toast({
        title: t("AddAuthServerModal.toast.fillServer"),
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const newServer: AuthServer = { name: serverName, authUrl: serverUrl };

    setIsLoading(true);
    setAuthServerList([...authServerList, newServer]);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: t("AddAuthServerModal.toast.success"),
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose?.();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...modalProps}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("AddAuthServerModal.header.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          {!isNextStep ? (
            <FormControl isInvalid={isServerUrlInvalid}>
              <FormLabel htmlFor="serverUrl">
                {t("AddAuthServerModal.page1.serverUrl")}{" "}
                <Text as="span" color="red.500">
                  *
                </Text>
              </FormLabel>
              <Input
                id="serverUrl"
                type="url"
                placeholder={t("AddAuthServerModal.page1.inputServerUrl")}
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                onBlur={() => setIsServerUrlTouched(true)}
              />
              {isServerUrlInvalid && (
                <FormErrorMessage>
                  {t("AddAuthServerModal.page1.serverUrlRequired")}
                </FormErrorMessage>
              )}
            </FormControl>
          ) : (
            <VStack spacing={4} align="flex-start">
              <HStack spacing={2}>
                <Text>{t("AddAuthServerModal.page2.name")}</Text>
                <Text fontWeight="bold">{serverName}</Text>
              </HStack>
              <HStack spacing={2}>
                <Text>{t("AddAuthServerModal.page2.serverUrl")}</Text>
                <Text fontWeight="bold">{serverUrl}</Text>
              </HStack>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3.5} ml="auto">
            <Button variant="ghost" onClick={onClose}>
              {t("AddAuthServerModal.button.cancel")}
            </Button>
            {isNextStep ? (
              <>
                <Button variant="ghost" onClick={() => setIsNextStep(false)}>
                  {t("AddAuthServerModal.button.previous")}
                </Button>
                <Button
                  colorScheme={primaryColor}
                  onClick={handleFinish}
                  isLoading={isLoading}
                >
                  {t("AddAuthServerModal.button.finish")}
                </Button>
              </>
            ) : (
              <Button
                colorScheme={primaryColor}
                onClick={handleNextStep}
                isDisabled={!serverUrl}
              >
                {t("AddAuthServerModal.button.next")}
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddAuthServerModal;
