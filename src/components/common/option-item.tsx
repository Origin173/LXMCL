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
  title: string;
  description?: string;
  titleExtra?: string;
  children: React.ReactNode;
}

export interface OptionItemGroupProps extends BoxProps {
  title: string;
  items: OptionItemProps[];
}

const OptionItem: React.FC<OptionItemProps> = ({
  title,
  description,
  titleExtra,
  children,
  ...boxProps
}) => {
  return (
    <Flex justify="space-between" alignItems="self-start" {...boxProps}>
      <VStack spacing={1} mr={2} alignItems="start" overflow="hidden">
        <HStack spacing={2} flexWrap="wrap">
          <Text fontSize="sm">
            {title}
          </Text>
          {titleExtra}
        </HStack>
        {description && <Text fontSize="sm" className="secondary-text">{description}</Text>}
      </VStack>
      {children}
    </Flex>
  );
};

export const OptionItemGroup: React.FC<OptionItemGroupProps> = ({
  title,
  items,
  ...boxProps
}) => {
  return (
    <Box {...boxProps}>
      <Text fontWeight="semibold" fontSize="md">
        {title}
      </Text>
      <Card mt={2.5} className="content-card">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <OptionItem
              title={item.title}
              description={item.description}
              titleExtra={item.titleExtra}
            >
              {item.children}
            </OptionItem>
            {index !== items.length - 1 && (
              <Divider my={2} />
            )}
          </React.Fragment>
        ))}
      </Card>
    </Box>
  );
};

export default OptionItem;
