import {
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
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  Stepper,
  Text,
  useSteps,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GameVersionSelector from "@/components/game-version-selector";
import { useLauncherConfig } from "@/contexts/config";
import { GameResourceInfo, ModLoaderResourceInfo } from "@/models/resource";
import { ModLoaderSelector } from "../mod-loader-selector";

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
  const [stepTitles, setStepTitles] = useState<string[]>(["", "", ""]);
  const [instanceName, setInstanceName] = useState("");
  const [selectedModLoaderVersion, setSelectedModLoaderVersion] =
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
              selectedGameVersion &&
                setStepTitles((prev) => [
                  `${selectedGameVersion.id} ${t(`GameVersionSelector.${selectedGameVersion.type}`)}`,
                  prev[1],
                  prev[2],
                ]);
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
              selectedModLoaderVersion={selectedModLoaderVersion}
              onSelectModLoaderVersion={setSelectedModLoaderVersion}
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
          <Button colorScheme={primaryColor} onClick={() => setActiveStep(2)}>
            {t("General.next")}
          </Button>
        </ModalFooter>
      </>
    );
  }, [
    modalProps.onClose,
    primaryColor,
    selectedGameVersion,
    selectedModLoaderVersion,
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
      },
      {
        key: "loader",
        content: Step2Content,
      },
      {
        key: "info",
        content: Step3Content,
      },
    ],
    [Step1Content, Step2Content, Step3Content]
  );

  useEffect(() => {
    setStepTitles(
      ["game", "loader", "info"].map((step) =>
        t(`CreateInstanceModal.stepper.${step}`)
      )
    );
  }, [t]);

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
            {steps.map((_, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>
                <Text fontSize="sm" className="no-select">
                  {stepTitles[index]}
                </Text>
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
