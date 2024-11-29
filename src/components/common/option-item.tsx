import { 
  Flex, 
  VStack, 
  HStack, 
  Text,
  Divider,
  Card,
  Box,
  BoxProps 
} from "@chakra-ui/react";
import React from "react";

export interface OptionItemProps extends BoxProps {
  prefixElement?: React.ReactNode;
  title: string;
  description?: string;
  titleExtra?: React.ReactNode;
  children: React.ReactNode;
}

export interface OptionItemGroupProps extends BoxProps {
  title?: string;
  items: (OptionItemProps | React.ReactNode)[];
}

export const OptionItem: React.FC<OptionItemProps> = ({
  prefixElement,
  title,
  description,
  titleExtra,
  children,
  ...boxProps
}) => {
  return (
    <Flex justify="space-between" alignItems="self-start" {...boxProps}>
      <HStack spacing={2.5}>
        {prefixElement}
        <VStack spacing={0} mr={2} alignItems="start" overflow="hidden">
          <HStack spacing={2} flexWrap="wrap">
            <Text fontSize="xs-sm" className="no-select">
              {title}
            </Text>
            {titleExtra}
          </HStack>
          {description && <Text fontSize="xs" className="secondary-text no-select">{description}</Text>}
        </VStack>
      </HStack>
      {
        typeof children === 'string' 
        ? <Text fontSize="xs-sm" className="secondary-text">{children}</Text>
        : children
      }
    </Flex>
  );
};

export const OptionItemGroup: React.FC<OptionItemGroupProps> = ({
  title,
  items,
  ...boxProps
}) => {

  function isOptionItemProps(item: any): item is OptionItemProps {
    return (item as OptionItemProps)?.title != null && (item as OptionItemProps)?.children != null;
  }

  return (
    <Box mb={4} {...boxProps}>
      {title && <Text fontWeight="bold" fontSize="sm" className="no-select">
        {title}
      </Text>}
      {items.length > 0 && 
        <Card mt={2.5} className="content-card">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {isOptionItemProps(item) ? (
                <OptionItem
                  title={item.title}
                  description={item.description}
                  titleExtra={item.titleExtra}
                  prefixElement={item.prefixElement}
                >
                  {item.children}
                </OptionItem>
              ) : (item)}
              {index !== items.length - 1 && (
                <Divider my={2} />
              )}
            </React.Fragment>
          ))}
        </Card>
      }
    </Box>
  );
};
