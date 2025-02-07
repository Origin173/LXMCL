import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Stack,
} from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLauncherConfig } from "@/contexts/config";
import { useToast } from "@/contexts/toast";

interface ChangeDirectoryModalProps extends Omit<ModalProps, "children"> {
  add?: boolean;
  currentName?: string;
  currentPath?: string;
}

const ChangeDirectoryModal: React.FC<ChangeDirectoryModalProps> = ({
  add = false,
  currentName = "",
  currentPath = "",
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { config, update } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const initialRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [dirName, setDirName] = useState<string>("");
  const [dirPath, setDirPath] = useState<string>("");
  const [isDirPathUnique, setIsDirPathUnique] = useState<boolean>(true);
  const [isDirPathValid, setIsDirPathValid] = useState<boolean>(true);

  const isDirNameValid = dirName.length <= 16;

  const handleBrowseGameDir = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t("ChangeDirectoryModal.dialog.title"),
      });

      if (selected) {
        setDirPath(selected);
        if (/^(\/?|\\?)(.+[\/\\])*\.minecraft$/.test(selected))
          setIsDirPathValid(true);
        else setIsDirPathValid(false);
        if (
          config.localGameDirectories.map((dir) => dir.dir).includes(selected)
        )
          setIsDirPathUnique(false);
        else setIsDirPathUnique(true);
      }
    } catch (error) {
      console.error("Error opening directory dialog:", error);
      setDirPath("");
      toast({
        title: t("ChangeDirectoryModal.toast.error.title"),
        status: "error",
      });
    }
  };

  const handleUpdateDir = () => {
    setDirName("");
    setDirPath("");
    if (add) {
      update("localGameDirectories", [
        ...config.localGameDirectories,
        {
          name: dirName,
          dir: dirPath,
        },
      ]);
    } else {
      update(
        "localGameDirectories",
        config.localGameDirectories.map((dir) =>
          dir.dir === currentPath ? { name: dirName, dir: dirPath } : dir
        )
      );
    }
    modalProps.onClose();
  };

  useEffect(() => {
    setDirName(currentName);
    setDirPath(currentPath);
  }, [currentName, currentPath]);

  return (
    <Modal
      size={{ base: "md", lg: "lg", xl: "xl" }}
      initialFocusRef={initialRef}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {t(`ChangeDirectoryModal.header.title.${add ? "add" : "edit"}`)}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Stack direction="column" spacing={3.5}>
            <FormControl isRequired isInvalid={!isDirNameValid}>
              <FormLabel>{t("ChangeDirectoryModal.label.dirName")}</FormLabel>
              <Input
                placeholder={t("ChangeDirectoryModal.placeholder.dirName")}
                value={dirName}
                onChange={(e) => setDirName(e.target.value)}
                required
                ref={initialRef}
                focusBorderColor={`${primaryColor}.500`}
              />
              {!isDirNameValid && (
                <FormErrorMessage>
                  {t("ChangeDirectoryModal.errorMessage.dirName")}
                </FormErrorMessage>
              )}
            </FormControl>

            <FormControl
              isRequired
              isInvalid={!isDirPathValid || !isDirPathUnique}
            >
              <FormLabel>{t("ChangeDirectoryModal.label.dirPath")}</FormLabel>
              <InputGroup>
                <Input
                  placeholder={t("ChangeDirectoryModal.placeholder.dirPath")}
                  value={dirPath}
                  required
                  isReadOnly
                  focusBorderColor={`${primaryColor}.500`}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={handleBrowseGameDir}
                    colorScheme={primaryColor}
                  >
                    {t("ChangeDirectoryModal.button.browse")}
                  </Button>
                </InputRightElement>
              </InputGroup>

              {!isDirPathValid && (
                <FormErrorMessage>
                  {t("ChangeDirectoryModal.errorMessage.dirPath.invalid")}
                </FormErrorMessage>
              )}
              {!isDirPathUnique && (
                <FormErrorMessage>
                  {t("ChangeDirectoryModal.errorMessage.dirPath.exist")}
                </FormErrorMessage>
              )}
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter mt={1}>
          <Button variant="ghost" onClick={modalProps.onClose}>
            {t("General.cancel")}
          </Button>
          <Button
            disabled={
              !dirPath ||
              !dirName ||
              !isDirNameValid ||
              !isDirPathValid ||
              !isDirPathUnique
            }
            colorScheme={primaryColor}
            onClick={handleUpdateDir}
          >
            {t("General.confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChangeDirectoryModal;
