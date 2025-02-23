import {
  Button,
  Checkbox,
  Flex,
  HStack,
  Icon,
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
  RadioGroup,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCopy, LuScissors } from "react-icons/lu";
import { OptionItemGroup } from "@/components/common/option-item";
import SegmentedControl from "@/components/common/segmented";
import { useLauncherConfig } from "@/contexts/config";
import { useData } from "@/contexts/data";
import { useToast } from "@/contexts/toast";
import { InstanceSubdirEnums } from "@/enums/instance";
import { GameInstanceSummary } from "@/models/game-instance";
import { InstanceService } from "@/services/instance";

interface CopyOrMoveModalProps extends Omit<ModalProps, "children"> {
  dirType: InstanceSubdirEnums;
  resourceName: string;
  filePath: string;
  srcInstanceId: number;
}

const CopyOrMoveModal: React.FC<CopyOrMoveModalProps> = ({
  dirType,
  resourceName,
  filePath,
  srcInstanceId,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { getGameInstanceList } = useData();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;
  const toast = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [operation, setOperation] = useState<"copy" | "move">("copy");
  const [gameInstanceList, setGameInstanceList] = useState<
    GameInstanceSummary[]
  >([]);
  const [selectedGameInstances, setSelectedGameInstances] = useState<
    GameInstanceSummary[]
  >([]);

  const operationList = [
    {
      key: "copy",
      icon: LuCopy,
      label: t("CopyOrMoveModal.operation.copy"),
    },
    {
      key: "move",
      icon: LuScissors,
      label: t("CopyOrMoveModal.operation.move"),
    },
  ];

  const handleCopyAcrossInstances = useCallback(
    (
      filePath: string,
      targetInstId: number[],
      dirType: InstanceSubdirEnums
    ) => {
      if (filePath !== undefined && targetInstId !== undefined) {
        InstanceService.copyAcrossInstances(
          filePath,
          targetInstId,
          dirType
        ).then((response) => {
          if (response.status !== "success")
            toast({
              title: response.message,
              description: response.details,
              status: "error",
            });
        });
      }
    },
    [toast]
  );

  const handleMoveAcrossInstances = useCallback(
    (filePath: string, targetInstId: number, dirType: InstanceSubdirEnums) => {
      if (filePath !== undefined && targetInstId !== undefined) {
        InstanceService.moveAcrossInstances(
          filePath,
          targetInstId,
          dirType
        ).then((response) => {
          if (response.status !== "success")
            toast({
              title: response.message,
              description: response.details,
              status: "error",
            });
        });
      }
    },
    [toast]
  );

  const handleCopyOrMove = async () => {
    setIsLoading(true);
    if (operation === "copy") {
      handleCopyAcrossInstances(
        filePath,
        selectedGameInstances.map((instance) => instance.id),
        dirType
      );
    } else {
      handleMoveAcrossInstances(filePath, selectedGameInstances[0].id, dirType);
    }
    modalProps.onClose();
    setIsLoading(false);
  };

  const generateDesc = (game: GameInstanceSummary) => {
    if (game.modLoader.loaderType === "Unknown") {
      return game.version;
    }
    return `${game.version}, ${game.modLoader.loaderType} ${game.modLoader.version}`;
  };

  const buildOptionItems = (instance: GameInstanceSummary) => ({
    title: instance.name,
    titleExtra: instance.id === srcInstanceId && (
      <Tag colorScheme={primaryColor} className="tag-xs">
        {t("CopyOrMoveModal.tag.source")}
      </Tag>
    ),
    description:
      generateDesc(instance) +
      (instance.description ? `, ${instance.description}` : ""),
    prefixElement: (
      <HStack spacing={2.5}>
        {operation === "move" ? (
          <Radio
            value={instance.id.toString()}
            colorScheme={primaryColor}
            isDisabled={instance.id === srcInstanceId}
            onClick={() => {
              if (instance.id === srcInstanceId) return;
              setSelectedGameInstances([instance]);
            }}
          />
        ) : (
          <Checkbox
            key={instance.id.toString()}
            isChecked={selectedGameInstances.some(
              (selected) => selected.id === instance.id
            )}
            colorScheme={primaryColor}
            isDisabled={instance.id === srcInstanceId}
            borderColor="gray.400"
            onChange={() => {
              if (instance.id === srcInstanceId) return;
              setSelectedGameInstances((prevSelected) => {
                if (prevSelected.includes(instance)) {
                  return prevSelected.filter(
                    (selected) => selected.id !== instance.id
                  );
                }
                return [...prevSelected, instance];
              });
            }}
          />
        )}
        <Image
          src={instance.iconSrc}
          alt={instance.name}
          boxSize="32px"
          objectFit="cover"
        />
      </HStack>
    ),
    children: <></>,
  });

  useEffect(() => {
    setGameInstanceList(getGameInstanceList() || []);
  }, [getGameInstanceList]);

  useEffect(() => {
    setSelectedGameInstances([]);
  }, [operation]);

  return (
    <Modal
      size={{ base: "md", lg: "lg", xl: "xl" }}
      scrollBehavior="inside"
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent h="100%">
        <ModalHeader>{t("CopyOrMoveModal.modal.header")}</ModalHeader>
        <ModalCloseButton />

        <Flex flexGrow="1" flexDir="column" h="100%" overflow="auto">
          <ModalBody>
            <Flex flexDirection="column" overflow="hidden" h="100%">
              <VStack>
                <Text flexWrap="wrap">
                  <SegmentedControl
                    selected={operation}
                    onSelectItem={(s) => setOperation(s as "copy" | "move")}
                    size="xs"
                    mr={5}
                    items={operationList.map((item) => ({
                      value: item.key,
                      label: (
                        <Flex align="center">
                          <Icon as={item.icon} mr={2} />
                          {item.label}
                        </Flex>
                      ),
                    }))}
                    withTooltip={false}
                  />
                  {t(`CopyOrMoveModal.resourceType.${dirType}`)}
                  <Text as="span" fontWeight="bold">
                    {` ${resourceName} `}
                  </Text>
                  <Text as="span">{t("CopyOrMoveModal.body")}</Text>
                </Text>
              </VStack>
              <RadioGroup
                value={selectedGameInstances[0]?.id.toString()}
                flexGrow="1"
                h="100%"
                overflow="auto"
                mt={2}
              >
                <OptionItemGroup
                  items={gameInstanceList.map(buildOptionItems)}
                />
              </RadioGroup>
            </Flex>
          </ModalBody>
        </Flex>

        <ModalFooter w="100%">
          <HStack spacing={3} ml="auto">
            <Button variant="ghost" onClick={modalProps.onClose}>
              {t("General.cancel")}
            </Button>
            <Button
              colorScheme={primaryColor}
              onClick={handleCopyOrMove}
              isLoading={isLoading}
              isDisabled={!selectedGameInstances.length}
            >
              {t("General.confirm")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CopyOrMoveModal;
