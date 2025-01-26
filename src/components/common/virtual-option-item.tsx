import {
  Box,
  BoxProps,
  Card,
  Divider,
  Flex,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { Section, SectionProps } from "@/components/common/section";

export interface VirtualOptionItemProps extends BoxProps {
  prefixElement?: React.ReactNode;
  title: string;
  titleExtra?: React.ReactNode;
  description?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
  childrenOnHover?: boolean;
}

export interface VirtualOptionItemGroupProps extends SectionProps {
  items: (VirtualOptionItemProps | React.ReactNode)[];
  withDivider?: boolean;
  itemHeight?: number; // 新增项高度属性
  height?: number; // 新增容器高度属性
}

export const VirtualOptionItem: React.FC<VirtualOptionItemProps> = ({
  prefixElement,
  title,
  titleExtra,
  description,
  isLoading = false,
  children,
  childrenOnHover = false,
  ...boxProps
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Flex
      justify="space-between"
      alignItems="self-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...boxProps}
    >
      <HStack spacing={2.5} overflowY="hidden">
        {prefixElement && (
          <Skeleton isLoaded={!isLoading}>{prefixElement}</Skeleton>
        )}
        <VStack spacing={0} mr={2} alignItems="start" overflow="hidden">
          <HStack spacing={2} flexWrap="wrap">
            <Skeleton isLoaded={!isLoading}>
              <Text fontSize="xs-sm" className="no-select">
                {title}
              </Text>
            </Skeleton>
            {titleExtra &&
              (isLoading ? (
                <Skeleton isLoaded={!isLoading}>
                  <Text fontSize="xs-sm">
                    PLACEHOLDER {/*width holder for skeleton*/}
                  </Text>
                </Skeleton>
              ) : (
                titleExtra
              ))}
          </HStack>
          {description &&
            (typeof description === "string" ? (
              <Skeleton isLoaded={!isLoading}>
                <Text fontSize="xs" className="secondary-text no-select">
                  {description}
                </Text>
              </Skeleton>
            ) : (
              description
            ))}
        </VStack>
      </HStack>
      {(childrenOnHover ? isHovered : true) &&
        (typeof children === "string" ? (
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="xs-sm" className="secondary-text">
              {children}
            </Text>
          </Skeleton>
        ) : (
          children
        ))}
    </Flex>
  );
};

export const VirtualOptionItemGroup: React.FC<VirtualOptionItemGroupProps> = ({
  items,
  withDivider = true,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemHeight, setItemHeight] = useState(50);

  useEffect(() => {
    if (containerRef.current) {
      const firstItem = containerRef.current.querySelector(".option-item");
      if (firstItem) {
        setItemHeight(firstItem.clientHeight);
      }
    }
  }, [items]);

  function isVirtualOptionItemProps(item: any): item is VirtualOptionItemProps {
    return (
      (item as VirtualOptionItemProps)?.title != null &&
      (item as VirtualOptionItemProps)?.children != null
    );
  }

  const rowRenderer = ({ index, style }: ListRowProps) => {
    const item = items[index];
    return (
      <div style={style}>
        {isVirtualOptionItemProps(item) ? (
          <VirtualOptionItem
            title={item.title}
            description={item.description}
            titleExtra={item.titleExtra}
            prefixElement={item.prefixElement}
          >
            {item.children}
          </VirtualOptionItem>
        ) : (
          item
        )}
        {index !== items.length - 1 &&
          (withDivider ? <Divider my={2} /> : <Box h={2} />)}
      </div>
    );
  };

  return (
    <Section {...props}>
      {items.length > 0 && (
        <Card className="content-card" ref={containerRef} h="100%">
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                rowCount={items.length}
                rowHeight={itemHeight}
                rowRenderer={rowRenderer}
              />
            )}
          </AutoSizer>
        </Card>
      )}
    </Section>
  );
};
