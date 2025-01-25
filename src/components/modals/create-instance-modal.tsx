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
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GameVersionSelector from "@/components/game-version-selector";
import { useLauncherConfig } from "@/contexts/config";
import { GameResourceInfo } from "@/models/resource";

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

  const [selectedVersion, setSelectedVersion] = useState<GameResourceInfo>();

  const Step1Content = useMemo(() => {
    return (
      <>
        <ModalBody>
          <GameVersionSelector
            selectedVersion={selectedVersion}
            onVersionSelect={setSelectedVersion}
          />
        </ModalBody>
        <ModalFooter mt={1}>
          <Button variant="ghost" onClick={modalProps.onClose}>
            {t("General.cancel")}
          </Button>
          <Button colorScheme={primaryColor} onClick={() => setActiveStep(1)}>
            {t("General.next")}
          </Button>
        </ModalFooter>
      </>
    );
  }, [modalProps.onClose, primaryColor, selectedVersion, setActiveStep, t]);

  const Step2Content = () => {
    return (
      <>
        <ModalBody>Step2 TBD</ModalBody>
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
  };

  const Step3Content = () => {
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
  };

  const steps = [
    {
      key: "game",
      content: Step1Content,
    },
    {
      key: "loader",
      content: <Step2Content />,
    },
    {
      key: "info",
      content: <Step3Content />,
    },
  ];

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
                <Text fontSize="sm" className="no-select">
                  {t(`CreateInstanceModal.stepper.${step.key}`)}
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
