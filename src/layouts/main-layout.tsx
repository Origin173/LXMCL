import { Card, Center, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { BeatLoader } from "react-spinners";
import HeadNavBar from "@/components/head-navbar";
import { useLauncherConfig } from "@/contexts/config";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const router = useRouter();
  const { config } = useLauncherConfig();

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
      bgImg={`url('/images/${config.appearance.background.presetChoice}.jpg')`}
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
    </Flex>
  );
};

export default MainLayout;
