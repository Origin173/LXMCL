import { Container, Toast, baseTheme, extendTheme } from "@chakra-ui/react";

const subtleButtonVariant = (props: any) => ({
  bg: `${props.colorScheme}.100`,
  color: `${props.colorScheme}.700`,
  _hover: {
    bg: `${props.colorScheme}.200`,
  },
  _active: {
    bg: `${props.colorScheme}.300`,
  },
  _focus: {
    boxShadow: "none",
  },
  _disabled: {
    bg: `${props.colorScheme}.100`,
    color: `${props.colorScheme}.500`,
    cursor: "not-allowed",
    opacity: 0.6,
    _hover: {
      bg: `${props.colorScheme}.100 !important`,
    },
    _active: {
      bg: `${props.colorScheme}.100 !important`,
    },
  },
});

const customGraySolidButtonTheme = {
  bg: "gray.600",
  color: "white",
  _hover: { bg: "gray.700" },
  _active: { bg: "gray.800" },
  _focus: { boxShadow: "none" },
  _disabled: {
    bg: "gray.500",
    color: "gray.300",
    cursor: "not-allowed",
    opacity: 0.6,
    _hover: {
      bg: "gray.500 !important",
    },
    _active: {
      bg: "gray.500 !important",
    },
  },
};

const customGrayOutlineButtonTheme = {
  borderColor: "gray.600",
  color: "gray.600",
  bg: "transparent",
  _hover: {
    borderColor: "gray.700",
    bg: "gray.100",
  },
  _active: {
    borderColor: "gray.800",
    bg: "gray.200",
  },
  _focus: {
    boxShadow: "none",
  },
  _disabled: {
    borderColor: "gray.500",
    color: "gray.300",
    bg: "transparent",
    cursor: "not-allowed",
    opacity: 0.6,
    _hover: {
      bg: "transparent !important",
    },
    _active: {
      bg: "transparent !important",
    },
  },
};

const chakraExtendTheme = extendTheme({
  components: {
    Alert: {
      baseStyle: {
        container: {
          paddingY: 2,
        },
        title: {
          fontSize: "sm",
          marginBottom: -0.5,
        },
        description: {
          fontSize: "xs",
          lineHeight: 4,
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: "normal",
      },
      variants: {
        subtle: subtleButtonVariant,
        solid: (props: any) => {
          return props.colorScheme === "gray" ? customGraySolidButtonTheme : {};
        },
      },
    },
    Divider: {
      baseStyle: {
        borderColor: "gray.300",
      },
    },
    Menu: {
      baseStyle: {
        list: {
          minWidth: "auto",
          py: 1,
        },
      },
    },
  },
  fontSizes: {
    "xs-sm": "0.8rem",
  },
});

export default chakraExtendTheme;
