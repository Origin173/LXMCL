import {
  Box,
  BoxProps,
  Collapse,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

export interface SectionProps extends Omit<BoxProps, "children"> {
  title?: string;
  titleExtra?: React.ReactNode;
  headExtra?: React.ReactNode;
  description?: string;
  isAccordion?: boolean;
  initialIsOpen?: boolean;
  children?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  title,
  titleExtra,
  headExtra,
  description,
  isAccordion = false,
  initialIsOpen = true,
  children,
  ...props
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: initialIsOpen });

  return (
    <Box {...props}>
      {(isAccordion || title || description) && (
        <Flex alignItems="flex-start" flexShrink={0} mb={isOpen ? 2.5 : 0}>
          <HStack spacing={1}>
            {isAccordion && (
              <IconButton
                aria-label="accordion-control"
                icon={
                  isOpen ? (
                    <LuChevronDown size={14} />
                  ) : (
                    <LuChevronRight size={14} />
                  )
                }
                size="xs"
                variant="ghost"
                colorScheme="gray"
                onClick={onToggle}
              />
            )}
            <VStack spacing={0} align="start">
              {title && (
                <Text fontWeight="bold" fontSize="sm" className="no-select">
                  {title}
                </Text>
              )}
              {description && (
                <Text fontSize="xs" className="secondary-text no-select">
                  {description}
                </Text>
              )}
            </VStack>
            {titleExtra}
          </HStack>
          <Box ml="auto">{headExtra}</Box>
        </Flex>
      )}
      {isAccordion ? (
        <Collapse in={isOpen} animateOpacity>
          {children}
        </Collapse>
      ) : (
        children
      )}
    </Box>
  );
};
