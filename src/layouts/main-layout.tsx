import { 
  Card,
  Flex
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import HeadNavBar from "@/components/head-navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const router = useRouter();

  return (
    <Flex
      direction="column"
      h="100vh"
      bgImg="url('/images/Jǫkull-3.png')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
    >
      <HeadNavBar />
      {
        router.pathname === '/launch'
          ? <>{children}</>
          : <Card 
              className="content-blur-bg"
              h="100%"
              overflow="auto"
              mt={1} mb={4} mx={4} p={3.5}
            >
              {children}
            </Card>
      }
    </Flex>
  );
};

export default MainLayout;
