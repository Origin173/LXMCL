import { extendTheme } from '@chakra-ui/react';

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
    boxShadow: 'none',
  },
  _disabled: {
    bg: `${props.colorScheme}.100`,
    color: `${props.colorScheme}.500`,
    cursor: 'not-allowed',
    opacity: 0.6,
    _hover: {
      bg: `${props.colorScheme}.100 !important`,
    },
    _active: {
      bg: `${props.colorScheme}.100 !important`,
    },
  },
});

const chakraExtendTheme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontWeight: "normal",
      },
      variants: {
        subtle: subtleButtonVariant,
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
          py: 1
        },
      },
    },
  },
  fontSizes: {
    'xs-sm': '0.8rem'
  }
});

export default chakraExtendTheme;
