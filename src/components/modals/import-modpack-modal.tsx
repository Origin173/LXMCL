import {
  Button,
  Center,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Radio,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import Editable from "@/components/common/editable";
import {
  OptionItemGroup,
  OptionItemGroupProps,
  OptionItemProps,
} from "@/components/common/option-item";
import { InstanceIconSelectorPopover } from "@/components/instance-icon-selector";
import { modLoaderTypesToIcon } from "@/components/modals/create-instance-modal";
import { useLauncherConfig } from "@/contexts/config";
import { useToast } from "@/contexts/toast";
import { ModpackResourceInfo } from "@/models/resource";
import { InstanceService } from "@/services/instance";
import { getGameDirName } from "@/utils/instance";
import { isFileNameSanitized } from "@/utils/string";

interface ImportModpackModalProps extends Omit<ModalProps, "children"> {
  path: string;
}

const ImportModpackModal: React.FC<ImportModpackModalProps> = ({
  path,
  ...modalProps
}) => {
  const { config } = useLauncherConfig();
  const router = useRouter();
  const toast = useToast();
  const primaryColor = config.appearance.theme.primaryColor;
  const [modpack, setModpack] = useState<ModpackResourceInfo>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconSrc, setIconSrc] = useState("");
  const [gameDirectory, setGameDirectory] = useState(
    config.localGameDirectories[0]
  );
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const checkDirNameError = (value: string): number => {
    if (value.trim() === "") return 1;
    if (!isFileNameSanitized(value)) return 2;
    if (value.length > 255) return 3;
    return 0;
  };

  const modpackInfoGroup: OptionItemGroupProps[] = modpack
    ? [
        {
          title: t("ImportModpackModal.label.instanceSettings"),
          items: [
            {
              title: t("InstanceSettingsPage.name"),
              children: (
                <Editable
                  isTextArea={false}
                  value={name}
                  onEditSubmit={setName}
                  textProps={{ className: "secondary-text", fontSize: "xs-sm" }}
                  inputProps={{ fontSize: "xs-sm" }}
                  formErrMsgProps={{ fontSize: "xs-sm" }}
                  checkError={checkDirNameError}
                  localeKey="InstanceSettingsPage.errorMessage"
                />
              ),
            },
            {
              title: t("InstanceSettingsPage.description"),
              children: (
                <Editable
                  isTextArea={true}
                  value={description}
                  onEditSubmit={setDescription}
                  textProps={{ className: "secondary-text", fontSize: "xs-sm" }}
                  inputProps={{ fontSize: "xs-sm" }}
                />
              ),
            },
            {
              title: t("InstanceSettingsPage.icon"),
              children: (
                <HStack>
                  <Image
                    src={iconSrc}
                    alt={iconSrc}
                    boxSize="28px"
                    objectFit="cover"
                  />
                  <InstanceIconSelectorPopover
                    value={iconSrc}
                    onIconSelect={setIconSrc}
                  />
                </HStack>
              ),
            },
          ],
        },
        {
          title: t("InstanceBasicSettings.selectDirectory"),
          items: [
            ...config.localGameDirectories.map(
              (directory): OptionItemProps => ({
                title: getGameDirName(directory),
                description: directory.dir,
                prefixElement: (
                  <Radio
                    isChecked={directory.dir === gameDirectory?.dir}
                    onChange={() => {
                      setGameDirectory(directory);
                    }}
                  />
                ),
                children: <></>,
              })
            ),
          ],
        },
        {
          title: t("ImportModpackModal.label.modpackInfo"),
          items: [
            {
              title: t("ImportModpackModal.label.modpackName"),
              children: modpack.name,
            },
            {
              title: t("ImportModpackModal.label.modpackVersion"),
              children: modpack.version,
            },
            {
              title: t("ImportModpackModal.label.author"),
              children: modpack.author || "-",
            },
            {
              title: t("ImportModpackModal.label.modLoader"),
              children: `${modpack.modLoaderInfo.loaderType} ${modpack.modLoaderInfo.version}`,
            },
            {
              title: t("ImportModpackModal.label.gameVersion"),
              children: modpack.gameInfo.id,
            },
          ],
        },
      ]
    : [];

  const handleCreateInstance = async () => {
    if (!modpack || checkDirNameError(name) !== 0 || !gameDirectory) return;
    try {
      setIsLoading(true);
      let resp = await InstanceService.createInstance(
        gameDirectory,
        name,
        description,
        iconSrc,
        modpack.gameInfo,
        modpack.modLoaderInfo,
        path
      );
      if (resp.status === "success") {
        modalProps.onClose?.();
        router.push("/downloads");
      } else {
        toast({
          title: resp.message,
          description: resp.details,
          status: "error",
        });
      }
    } catch (error) {
      console.error("Error creating instance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsPageLoading(true);
    InstanceService.getModpackResourceInfo(path)
      .then((response) => {
        if (response.status === "success") {
          setModpack(response.data);
          setName(response.data.name);
          setDescription(response.data.description || "");
          setIconSrc(
            modLoaderTypesToIcon[response.data.modLoaderInfo.loaderType] || ""
          );
        } else {
          toast({
            title: response.message,
            description: response.details,
            status: "error",
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching modpack info:", error);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [path, toast]);

  return (
    <Modal
      scrollBehavior="inside"
      size={{ base: "2xl", lg: "3xl", xl: "4xl" }}
      autoFocus={false}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent h="100%">
        <ModalHeader>{t("ImportModpackModal.header.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody h="100%">
          {isPageLoading ? (
            <Center h="100%">
              <BeatLoader size={16} color="gray" />
            </Center>
          ) : (
            <VStack w="100%" spacing={4}>
              {modpackInfoGroup.map((group, index) => (
                <OptionItemGroup
                  title={group.title}
                  items={group.items}
                  key={index}
                  w="100%"
                />
              ))}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme={primaryColor}
            onClick={() => handleCreateInstance()}
            isLoading={isLoading || isPageLoading}
          >
            {t("ImportModpackModal.button.import")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImportModpackModal;
