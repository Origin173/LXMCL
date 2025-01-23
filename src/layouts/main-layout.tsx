import { Card, Center, Flex, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { BeatLoader } from "react-spinners";
import HeadNavBar from "@/components/head-navbar";
import StarUsModal from "@/components/modals/star-us-modal";
import WelcomeAndTermsModal from "@/components/modals/welcome-and-terms-modal";
import { useLauncherConfig } from "@/contexts/config";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const router = useRouter();
  const { config, update } = useLauncherConfig();

  const isCheckedRunCount = useRef(false);
  const isStandAlone = router.pathname.startsWith("/standalone");

  const {
    isOpen: isWelcomeAndTermsModalOpen,
    onOpen: onWelcomeAndTermsModalOpen,
    onClose: onWelcomeAndTermsModalClose,
  } = useDisclosure();

  const {
    isOpen: isStarUsModalOpen,
    onOpen: onStarUsModalOpen,
    onClose: onStarUsModalClose,
  } = useDisclosure();

  useEffect(() => {
    if (!config.mocked && !isCheckedRunCount.current && !isStandAlone) {
      if (!config.runCount) {
        setTimeout(() => {
          onWelcomeAndTermsModalOpen();
        }, 300); // some delay to avoid sudden popup
      } else {
        let newCount = config.runCount + 1;
        if (newCount === 10) {
          setTimeout(() => {
            onStarUsModalOpen();
          }, 300);
        }
        update("runCount", newCount);
      }
      isCheckedRunCount.current = true;
    }
  }, [
    config.mocked,
    config.runCount,
    isStandAlone,
    onWelcomeAndTermsModalOpen,
    onStarUsModalOpen,
    update,
  ]);

  if (isStandAlone) return children;

  if (config.mocked)
    return (
      <Center h="100%">
        <BeatLoader size={16} color="gray" />
      </Center>
    );

  return (
    <Flex
      direction="column"
      h="100vh"
      bgImg={`url('/images/backgrounds/${config.appearance.background.presetChoice}.jpg')`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
    >
      <HeadNavBar />
      {router.pathname === "/launch" ? (
        <>{children}</>
      ) : (
        <Card
          className="content-blur-bg"
          h="100%"
          overflow="auto"
          mt={1}
          mb={4}
          mx={4}
        >
          {children}
        </Card>
      )}
      <WelcomeAndTermsModal
        isOpen={isWelcomeAndTermsModalOpen}
        onClose={onWelcomeAndTermsModalClose}
      />
      <StarUsModal isOpen={isStarUsModalOpen} onClose={onStarUsModalClose} />
    </Flex>
  );
};

export default MainLayout;
