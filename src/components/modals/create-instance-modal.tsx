import {
  Box,
  Button,
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GameVersionSelector from "@/components/game-version-selector";
import { ModLoaderSelector } from "@/components/mod-loader-selector";
import { useLauncherConfig } from "@/contexts/config";
import { GameResourceInfo, ModLoaderResourceInfo } from "@/models/resource";

export const CreateInstanceModal: React.FC<Omit<ModalProps, "children">> = ({
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: 3,
  });

  const [selectedGameVersion, setSelectedGameVersion] =
    useState<GameResourceInfo>();
  const [selectedModLoader, setSelectedModLoader] =
    useState<ModLoaderResourceInfo>({
      type: "none",
      version: "",
      stable: false,
    });

  const Step1Content = useMemo(() => {
    return (
      <>
        <ModalBody>
          <GameVersionSelector
            selectedVersion={selectedGameVersion}
            onVersionSelect={setSelectedGameVersion}
          />
        </ModalBody>
        <ModalFooter mt={1}>
          <Button variant="ghost" onClick={modalProps.onClose}>
            {t("General.cancel")}
          </Button>
          <Button
            disabled={!selectedGameVersion}
            colorScheme={primaryColor}
            onClick={() => {
              setActiveStep(1);
            }}
          >
            {t("General.next")}
          </Button>
        </ModalFooter>
      </>
    );
  }, [modalProps.onClose, primaryColor, selectedGameVersion, setActiveStep, t]);

  const Step2Content = useMemo(() => {
    return (
      <>
        <ModalBody>
          {selectedGameVersion && (
            <ModLoaderSelector
              selectedGameVersion={selectedGameVersion}
              selectedModLoader={selectedModLoader}
              onSelectModLoader={setSelectedModLoader}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={modalProps.onClose}>
            {t("General.cancel")}
          </Button>
          <Button variant="ghost" onClick={() => setActiveStep(0)}>
            {t("General.previous")}
          </Button>
          <Button
            colorScheme={primaryColor}
            onClick={() => {
              if (!selectedModLoader.version) {
                setSelectedModLoader({
                  type: "none",
                  version: "",
                  stable: false,
                });
              }
              setActiveStep(2);
            }}
          >
            {t("General.next")}
          </Button>
        </ModalFooter>
      </>
    );
  }, [
    modalProps.onClose,
    primaryColor,
    selectedGameVersion,
    selectedModLoader,
    setActiveStep,
    t,
  ]);

  const Step3Content = useMemo(() => {
    return (
      <>
        <ModalBody>Step3 TBD</ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={modalProps.onClose}>
            {t("General.cancel")}
          </Button>
          <Button variant="ghost" onClick={() => setActiveStep(1)}>
            {t("General.previous")}
          </Button>
          <Button colorScheme={primaryColor} onClick={modalProps.onClose}>
            {t("General.finish")}
          </Button>
        </ModalFooter>
      </>
    );
  }, [modalProps.onClose, primaryColor, setActiveStep, t]);

  const steps = useMemo(
    () => [
      {
        key: "game",
        content: Step1Content,
        description:
          selectedGameVersion &&
          `${selectedGameVersion.id} ${t(`GameVersionSelector.${selectedGameVersion.type}`)}`,
      },
      {
        key: "loader",
        content: Step2Content,
        description: `${selectedModLoader.type} ${selectedModLoader.version}`,
      },
      {
        key: "info",
        content: Step3Content,
        description: "",
      },
    ],
    [
      Step1Content,
      Step2Content,
      Step3Content,
      selectedGameVersion,
      selectedModLoader.type,
      selectedModLoader.version,
      t,
    ]
  );

  return (
    <Modal
      scrollBehavior="inside"
      size={{ base: "2xl", lg: "3xl", xl: "4xl" }}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("CreateInstanceModal.header.title")}</ModalHeader>
        <ModalCloseButton />
        <Center>
          <Stepper
            colorScheme={primaryColor}
            index={activeStep}
            w="80%"
            my={1.5}
          >
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>
                <Box flexShrink="0">
                  <StepTitle fontSize="sm">
                    {t(`CreateInstanceModal.stepper.${step.key}`)}
                  </StepTitle>
                  <StepDescription fontSize="xs">
                    {index < activeStep && step.description}
                  </StepDescription>
                </Box>
                <StepSeparator />
              </Step>
            ))}
          </Stepper>
        </Center>
        <Flex h="60vh" flexDir="column">
          {steps[activeStep].content}
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export const gameTypesToIcon: Record<string, string> = {
  release: "GrassBlock.png",
  snapshot: "CommandBlock.png",
  old_beta: "StoneOldBeta.png",
};
