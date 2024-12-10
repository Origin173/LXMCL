import {
  Box,
  BoxProps,
  Card,
  Image,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useTheme,
} from "@chakra-ui/react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useLauncherConfig } from "@/contexts/config";

export interface RadioCardProps extends BoxProps {
  width?: string;
  title: string;
  description: string;
  imageUrl: string;
  isSelected: boolean;
  prefixElement: React.ReactNode;
  children: React.ReactNode;
}

export interface RadioCardGroupProps extends BoxProps {
  title?: string;
  minWidth: number;
  spacing: number;
  items: (RadioCardProps | React.ReactNode)[];
}

export const RadioCard: React.FC<RadioCardProps> = ({
  width = "10.45rem",
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
      w={width}
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
  minWidth,
  spacing,
  items,
  ...boxProps
}) => {
  function isRadioCardProps(item: any): item is RadioCardProps {
    return (
      (item as RadioCardProps)?.title != null &&
      (item as RadioCardProps)?.children != null
    );
  }

  const boxRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const spacingScale = theme.space[1] || "0.25rem";
  const baseFontSize = theme.fontSizes.base || "16px";
  const numberToPx = parseFloat(spacingScale) * parseInt(baseFontSize);
  const [cardWidth, setCardWidth] = useState<string>(
    `${minWidth * numberToPx}px`
  );

  const resizeCard = useCallback(() => {
    if (boxRef.current) {
      const boxWidth = boxRef.current.offsetWidth;
      const cardPerRow = Math.floor(
        (boxWidth + spacing * numberToPx) /
          (minWidth * numberToPx + spacing * numberToPx)
      );
      const cardWidth = `${(boxWidth - spacing * numberToPx * cardPerRow) / cardPerRow}px`;
      setCardWidth(cardWidth);
    }
  }, [boxRef, numberToPx, minWidth, spacing]);

  useLayoutEffect(() => {
    resizeCard();
    window.addEventListener("resize", resizeCard);
    return () => window.removeEventListener("resize", resizeCard);
  }, [resizeCard]);

  return (
    <Box {...boxProps} overflow="hidden" ref={boxRef}>
      {items.length > 0 && (
        <Wrap spacing={spacing} {...boxProps}>
          {items.map((item, index) => (
            <WrapItem key={index}>
              {isRadioCardProps(item) ? (
                <RadioCard
                  width={cardWidth}
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
