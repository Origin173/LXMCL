import { Button, ButtonProps, useTheme } from "@chakra-ui/react";
import React from "react";

interface SelectableButtonProps extends ButtonProps {
  isSelected?: boolean;
  bgColorScheme?: string;
}

const SelectableButton: React.FC<SelectableButtonProps> = ({
  isSelected = false,
  bgColorScheme = "blackAlpha",
  colorScheme = "gray",
  children,
  ...props
}) => {
  const theme = useTheme();

  const selectedBg = theme.colors[bgColorScheme][200];
  const selectedColor = theme.colors[colorScheme][900];
  const defaultColor = theme.colors[colorScheme][600];

  return (
    <Button
      variant="ghost"
      bg={isSelected ? selectedBg : "transparent"}
      color={isSelected ? selectedColor : defaultColor}
      textAlign="left"
      justifyContent="flex-start"
      overflow="hidden"
      _hover={{
        bg: isSelected ? selectedBg : theme.colors[bgColorScheme][100],
      }}
      _active={{
        bg: theme.colors[bgColorScheme][300],
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default SelectableButton;
