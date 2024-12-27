import {
  Card,
  CardBody,
  CardProps,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-shell";
import { useLauncherConfig } from "@/contexts/config";
import { PostSummary } from "@/models/post";

interface PosterCardProps extends CardProps {
  data: PostSummary;
}

// used in discover page, under masonry container
const PosterCard = ({ data }: PosterCardProps) => {
  const { config } = useLauncherConfig();
  const { title, abstract, imageSrc, link } = data;

  return (
    <Card
      cursor="pointer"
      overflow="hidden" // show the border
      p={0}
      onClick={() => open(link)}
    >
      {imageSrc && <Image objectFit="cover" src={imageSrc} alt={title} />}
      <CardBody className="content-card">
        <VStack spacing={0} alignItems="start" overflow="hidden">
          <Text fontSize="xs-sm" className="no-select">
            {title}
          </Text>
          {abstract && (
            <Text fontSize="xs" className="secondary-text no-select">
              {abstract}
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PosterCard;
