import {
  Box,
  Card,
  CardProps,
  Image,
  Radio,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useTheme,
} from "@chakra-ui/react";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Section, SectionProps } from "@/components/common/section";
import { useLauncherConfig } from "@/contexts/config";

type WrapCardContentObject = {
  title: string;
  description: string;
  image?: string | React.ReactNode;
  extraContent?: React.ReactNode;
};

export interface WrapCardProps extends CardProps {
  width?: string;
  cardContent?: React.ReactNode | WrapCardContentObject;
  variant?: "normal" | "radio";
  radioValue?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

export interface WrapCardGroupProps extends SectionProps {
  cardMinWidth?: number;
  spacing?: number;
  items: WrapCardProps[];
  variant?: "normal" | "radio";
  widthMode?: "fixed" | "dynamic";
  cardAspectRatio?: number; // if not 0, calc height from width and aspect ratio
}

export const WrapCard: React.FC<WrapCardProps> = ({
  width = "10.45rem",
  variant = "normal",
  radioValue = "",
  isSelected = false,
  onSelect = () => {},
  cardContent,
  ...cardProps
}) => {
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  const renderContent = () => {
    if (!cardContent) return null;

    if (React.isValidElement(cardContent) || typeof cardContent === "string") {
      return <>{cardContent}</>;
    }

    const { title, description, image, extraContent } =
      cardContent as WrapCardContentObject;

    return (
      <VStack spacing={0}>
        {image &&
          (typeof image === "string" ? (
            <Image boxSize="36px" objectFit="cover" src={image} alt={title} />
          ) : (
            image
          ))}
        <Text
          fontSize="xs-sm"
          className="no-select"
          fontWeight={isSelected ? "bold" : "normal"}
          mt={image ? 2 : 0}
        >
          {title}
        </Text>
        <Text fontSize="xs" className="secondary-text no-select ellipsis-text">
          {description}
        </Text>
        {extraContent}
      </VStack>
    );
  };

  return (
    <Card
      className="content-card"
      w={width}
      borderColor={`${primaryColor}.500`}
      variant={isSelected ? "outline" : "elevated"}
      position="relative"
      {...cardProps}
    >
      {variant === "radio" && (
        <Box position="absolute" top={2} left={2}>
          <Radio
            value={radioValue}
            onClick={onSelect}
            colorScheme={primaryColor}
          />
        </Box>
      )}
      {renderContent()}
    </Card>
  );
};

export const WrapCardGroup: React.FC<WrapCardGroupProps> = ({
  cardMinWidth = 41.8,
  spacing = 3.5,
  items,
  variant = "normal",
  widthMode = "dynamic",
  cardAspectRatio = 0,
  ...props
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const spacingScale = theme.space[1] || "0.25rem";
  const baseFontSize = theme.fontSizes.base || "16px";
  const numberToPx = parseFloat(spacingScale) * parseInt(baseFontSize);
  const [cardWidth, setCardWidth] = useState<number>(cardMinWidth * numberToPx);

  const resizeCard = useCallback(() => {
    if (boxRef.current && widthMode === "dynamic") {
      const boxWidth = boxRef.current.offsetWidth;
      const cardPerRow = Math.floor(
        (boxWidth + spacing * numberToPx) /
          (cardMinWidth * numberToPx + spacing * numberToPx)
      );
      if (items.length > cardPerRow) {
        const calculatedWidth =
          (boxWidth - spacing * numberToPx * (cardPerRow - 1) - 1) / cardPerRow;
        setCardWidth(calculatedWidth);
      } else {
        setCardWidth(cardMinWidth * numberToPx);
      }
    }
  }, [boxRef, numberToPx, cardMinWidth, spacing, widthMode, items.length]);

  useLayoutEffect(() => {
    resizeCard();
    window.addEventListener("resize", resizeCard);
    return () => window.removeEventListener("resize", resizeCard);
  }, [resizeCard]);

  return (
    <Box {...props} overflow="hidden" ref={boxRef}>
      <Section
        title={props.title}
        headExtra={props.headExtra}
        description={props.description}
        isAccordion={props.isAccordion}
        initialIsOpen={props.initialIsOpen}
      >
        {items.length > 0 && (
          <Wrap spacing={spacing} mb={0.5}>
            {/* add mb to show last row cards' bottom shadow */}
            {items.map((item, index) => (
              <WrapItem key={index}>
                <WrapCard
                  {...item}
                  width={`${cardWidth}px`}
                  variant={variant}
                  {...(cardAspectRatio !== 0 && {
                    height: `${cardWidth / cardAspectRatio}px`,
                  })}
                />
              </WrapItem>
            ))}
          </Wrap>
        )}
      </Section>
    </Box>
  );
};
