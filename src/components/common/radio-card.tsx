import {
  Box,
  BoxProps,
  Card,
  Image,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useLauncherConfig } from "@/contexts/config";

export interface RadioCardProps extends BoxProps {
  title: string;
  description: string;
  imageUrl: string;
  isSelected: boolean;
  prefixElement: React.ReactNode;
  children: React.ReactNode;
}

export interface RadioCardGroupProps extends BoxProps {
  title?: string;
  items: (RadioCardProps | React.ReactNode)[];
}

export const RadioCard: React.FC<RadioCardProps> = ({
  title,
  description,
  imageUrl,
  isSelected,
  prefixElement,
  children,
  ...boxProps
}) => {
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  return (
    <Card
      className="content-card"
      w="10.55rem"
      borderColor={`${primaryColor}.500`}
      variant={isSelected ? "outline" : "elevated"}
      {...boxProps}
    >
      <Box position="absolute" top={2} left={2}>
        {prefixElement}
      </Box>
      <Box position="absolute" top={0.5} right={1}>
        {children}
      </Box>
      <VStack spacing={0}>
        <Image boxSize="36px" objectFit="cover" src={imageUrl} alt={title} />
        <Text
          fontSize="xs-sm"
          className="no-select"
          fontWeight={isSelected ? "bold" : "normal"}
          mt={2}
        >
          {title}
        </Text>
        <Text fontSize="xs" className="secondary-text no-select ellipsis-text">
          {description}
        </Text>
      </VStack>
    </Card>
  );
};

export const RadioCardGroup: React.FC<RadioCardGroupProps> = ({
  title,
  items,
  ...boxProps
}) => {
  function isRadioCardProps(item: any): item is RadioCardProps {
    return (
      (item as RadioCardProps)?.title != null &&
      (item as RadioCardProps)?.children != null
    );
  }
  return (
    <Box {...boxProps}>
      {items.length > 0 && (
        <Wrap spacing={3.5} {...boxProps}>
          {items.map((item, index) => (
            <WrapItem key={index}>
              {isRadioCardProps(item) ? (
                <RadioCard
                  title={item.title}
                  description={item.description}
                  imageUrl={item.imageUrl}
                  isSelected={item.isSelected}
                  prefixElement={item.prefixElement}
                >
                  {item.children}
                </RadioCard>
              ) : (
                item
              )}
            </WrapItem>
          ))}
        </Wrap>
      )}
    </Box>
  );
};
