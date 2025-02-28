import {
  Button,
  Flex,
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
  useDisclosure,
} from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-dialog";
import { platform } from "@tauri-apps/plugin-os";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import GenericConfirmDialog from "@/components/modals/generic-confirm-dialog";
import { useLauncherConfig } from "@/contexts/config";
import { useData } from "@/contexts/data";
import { useToast } from "@/contexts/toast";
import { ConfigService } from "@/services/config";

interface EditGameDirectoryModalProps extends Omit<ModalProps, "children"> {
  add?: boolean;
  currentName?: string;
  currentPath?: string;
}

const EditGameDirectoryModal: React.FC<EditGameDirectoryModalProps> = ({
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
  const { getGameInstanceList } = useData();

  const [dirName, setDirName] = useState<string>("");
  const [dirPath, setDirPath] = useState<string>("");
  const [isDirNameEmpty, setIsDirNameEmpty] = useState<boolean>(false);
  const [isDirNameTooLong, setIsDirNameTooLong] = useState<boolean>(false);
  const [isDirNameExist, setIsDirNameExist] = useState<boolean>(false);
  const [isDirPathExist, setIsDirPathExist] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    isOpen: isAddSubDirDialogOpen,
    onOpen: onAddSubDirDialogOpen,
    onClose: onAddSubDirDialogClose,
  } = useDisclosure();

  const handleBrowseGameDir = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t("EditGameDirectoryModal.dialog.browse.title"),
      });

      if (selected) {
        setDirPath(selected);
        if (
          config.localGameDirectories.map((dir) => dir.dir).includes(selected)
        )
          setIsDirPathExist(true);
        else setIsDirPathExist(false);
      }
    } catch (error) {
      setDirPath("");
      toast({
        title: t("EditGameDirectoryModal.toast.error.title"),
        status: "error",
      });
    }
  };

  const onDirPathBlur = () => {
    setDirPath((prevDirPath) => {
      let tempDirPath = prevDirPath;
      if (
        tempDirPath[tempDirPath.length - 1] === "/" ||
        tempDirPath[tempDirPath.length - 1] === "\\"
      )
        tempDirPath = tempDirPath.slice(0, -1);
      if (platform() === "windows")
        tempDirPath = tempDirPath.replace(/\//g, "\\");
      else tempDirPath = tempDirPath.replace(/\\/g, "/");
      return tempDirPath;
    }); // normalize path
    setIsDirPathExist(
      config.localGameDirectories.map((dir) => dir.dir).includes(dirPath)
    );
  };

  const handleCheckGameDirectory = async (dir: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await ConfigService.checkGameDirectory(dir);
      if (response.status !== "success") {
        toast({
          title: response.message,
          description: response.details,
          status: "error",
        });
        return false;
      } else {
        if (response.data === "") return true;
        setDirPath(response.data);
        onAddSubDirDialogOpen();
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubDir = async () => {
    handleUpdateDir();
    onAddSubDirDialogClose();
  };

  const handleUpdateDir = async () => {
    if (!add && currentPath === dirPath) {
      setDirName("");
      setDirPath("");
      modalProps.onClose();
      return;
    }
    const isValid = await handleCheckGameDirectory(dirPath);
    if (!isValid) return;
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
    getGameInstanceList(true); // refresh frontend state of instance list
    setDirName("");
    setDirPath("");
    modalProps.onClose();
  };

  useEffect(() => {
    setDirName(currentName);
    setDirPath(currentPath);
  }, [currentName, currentPath, modalProps.isOpen]);

  return (
    <Modal
      size={{ base: "md", lg: "lg", xl: "xl" }}
      initialFocusRef={initialRef}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {t(`EditGameDirectoryModal.header.title.${add ? "add" : "edit"}`)}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Stack direction="column" spacing={3.5}>
            <FormControl
              isRequired
              isInvalid={
                isDirNameTooLong || isDirNameEmpty || (isDirNameExist && add)
              }
            >
              <FormLabel>{t("EditGameDirectoryModal.label.dirName")}</FormLabel>
              <Input
                placeholder={t("EditGameDirectoryModal.placeholder.dirName")}
                value={dirName}
                onChange={(e) => setDirName(e.target.value)}
                onBlur={() => {
                  setIsDirNameEmpty(dirName.length === 0);
                  setIsDirNameTooLong(dirName.length > 20);
                  setIsDirNameExist(
                    config.localGameDirectories
                      .map((dir) => dir.name)
                      .includes(dirName)
                  );
                }}
                onFocus={() => {
                  setIsDirNameEmpty(false);
                  setIsDirNameTooLong(false);
                  setIsDirNameExist(false);
                }}
                required
                ref={initialRef}
                focusBorderColor={`${primaryColor}.500`}
              />
              {isDirNameTooLong && (
                <FormErrorMessage>
                  {t("EditGameDirectoryModal.errorMessage.dirName.tooLong")}
                </FormErrorMessage>
              )}
              {isDirNameEmpty && (
                <FormErrorMessage>
                  {t("EditGameDirectoryModal.errorMessage.dirName.empty")}
                </FormErrorMessage>
              )}
              {isDirNameExist && add && (
                <FormErrorMessage>
                  {t("EditGameDirectoryModal.errorMessage.dirName.exist")}
                </FormErrorMessage>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={isDirPathExist && add}>
              <FormLabel>{t("EditGameDirectoryModal.label.dirPath")}</FormLabel>
              <Flex direction="row" align="center">
                <InputGroup size="sm">
                  <Input
                    pr={12}
                    value={dirPath}
                    onChange={(e) => setDirPath(e.target.value)}
                    placeholder={t(
                      "EditGameDirectoryModal.placeholder.dirPath"
                    )}
                    onFocus={() => setIsDirPathExist(false)}
                    onBlur={onDirPathBlur}
                  />
                  <InputRightElement w={16}>
                    <Button
                      h={6}
                      size="sm"
                      onClick={handleBrowseGameDir}
                      colorScheme={primaryColor}
                    >
                      {t("EditGameDirectoryModal.button.browse")}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </Flex>
              {isDirPathExist && add && (
                <FormErrorMessage>
                  {t("EditGameDirectoryModal.errorMessage.dirPath.exist")}
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
              isDirNameEmpty ||
              isDirNameTooLong ||
              (isDirNameExist && add) ||
              (isDirPathExist && add)
            }
            colorScheme={primaryColor}
            onClick={handleUpdateDir}
            isLoading={isLoading}
          >
            {t("General.confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
      <GenericConfirmDialog
        isOpen={isAddSubDirDialogOpen}
        onClose={onAddSubDirDialogClose}
        title={t("EditGameDirectoryModal.dialog.addSubDir.title")}
        body={t("EditGameDirectoryModal.dialog.addSubDir.body")}
        btnCancel={t("General.cancel")}
        btnOK={t("General.confirm")}
        onOKCallback={handleAddSubDir}
      />
    </Modal>
  );
};

export default EditGameDirectoryModal;
