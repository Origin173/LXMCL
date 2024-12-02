import {
  Box,
  BoxProps,
  Flex,
  IconButton,
  Spacer,
  Tooltip,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FaCircleCheck, FaRegCircle } from "react-icons/fa6";
import { ChakraColorEnums, ColorSelectorType } from "@/models/enums";

interface ChakraColorSelectorProps extends BoxProps {
  current: string;
  onColorSelect: (color: ColorSelectorType) => void;
  size?: string;
}

const ChakraColorSelector: React.FC<ChakraColorSelectorProps> = ({
  current,
  onColorSelect,
  size = "md",
  ...boxProps
}) => {
  const { t } = useTranslation();

  return (
    <Box w="100%" {...boxProps}>
      <Flex>
        {ChakraColorEnums.map((color: ColorSelectorType, index: number) => (
          <>
            <Tooltip label={t(`Enums.chakraColors.${color}`)} fontSize={size}>
              <IconButton
                key={color}
                size={size}
                variant={
                  current === color
                    ? color === "gray"
                      ? "darkGray"
                      : "solid"
                    : "subtle"
                }
                colorScheme={color}
                aria-label={color}
                icon={
                  current === color ? (
                    <FaCircleCheck color="white" />
                  ) : (
                    <FaRegCircle />
                  )
                }
                onClick={() => onColorSelect(color)}
              />
            </Tooltip>
            {index < ChakraColorEnums.length - 1 && <Spacer />}
          </>
        ))}
      </Flex>
    </Box>
  );
};

export default ChakraColorSelector;
